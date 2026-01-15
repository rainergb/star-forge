import { useRef } from "react";
import { Paperclip, Image, FileText, Trash2, ExternalLink } from "lucide-react";
import { DiaryFile } from "@/types/diary.types";

interface DiaryFilesSectionProps {
  files: DiaryFile[];
  onAddFile: (file: Omit<DiaryFile, "id" | "addedAt">) => void;
  onRemoveFile: (fileId: string) => void;
}

export function DiaryFilesSection({
  files,
  onAddFile,
  onRemoveFile
}: DiaryFilesSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      const fileType: DiaryFile["type"] = file.type.startsWith("image/")
        ? "image"
        : file.type.includes("pdf") ||
            file.type.includes("document") ||
            file.type.includes("text")
          ? "document"
          : "other";

      const url = URL.createObjectURL(file);

      onAddFile({
        name: file.name,
        url,
        type: fileType,
        mimeType: file.type,
        size: file.size
      });
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: DiaryFile["type"]) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <Paperclip className="w-4 h-4" />;
    }
  };

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Attachments
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          + Add file
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-lg group"
            >
              {file.type === "image" ? (
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0 text-white/40">
                  {getFileIcon(file.type)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 truncate">{file.name}</p>
                <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/40">No attachments</p>
      )}
    </div>
  );
}
