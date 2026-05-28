import { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { importFromFile } from "@/services/export-service";
import { Button } from "@/components/ui/button";

interface DataImportButtonProps {
  onImportSuccess: () => void;
}

export function DataImportButton({ onImportSuccess }: DataImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatus("idle");

    try {
      const result = await importFromFile(file);

      if (!result.success) {
        setStatus("error");
        setMessage(result.message || "Failed to import file");
        return;
      }

      if (!result.data) {
        setStatus("error");
        setMessage("No data found in file");
        return;
      }

      // Import para localStorage (um por um)
      if (result.data.tasks) {
        localStorage.setItem("star-habit-tasks", JSON.stringify({ tasks: result.data.tasks }));
      }
      if (result.data.projects) {
        localStorage.setItem("star-habit-projects", JSON.stringify({ projects: result.data.projects }));
      }
      if (result.data.skills) {
        localStorage.setItem("star-habit-skills", JSON.stringify({ skills: result.data.skills }));
      }
      if (result.data.diary) {
        localStorage.setItem("star-habit-diary", JSON.stringify({ entries: result.data.diary }));
      }
      if (result.data.pomodoro) {
        localStorage.setItem("star-habit-pomodoro-sessions", JSON.stringify({ sessions: result.data.pomodoro }));
      }

      setStatus("success");
      setMessage(`Data imported! ${Object.keys(result.data).length} categories loaded.`);

      // Reset após 2s
      setTimeout(() => {
        setStatus("idle");
        onImportSuccess();
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Import failed");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        disabled={isImporting}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting || status === "success"}
        variant="outline"
        size="sm"
        className="w-full text-white/70 hover:text-white border-white/20 hover:border-white/40 gap-2"
      >
        {status === "success" ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Imported!
          </>
        ) : status === "error" ? (
          <>
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Error
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {isImporting ? "Importing..." : "Import data"}
          </>
        )}
      </Button>

      {message && (
        <p
          className={`text-xs text-center ${
            status === "success" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
