import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportButtonProps {
  onImport: (file: File) => void;
  tooltip?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  accept?: string;
}

export function ImportButton({
  onImport,
  tooltip = "Import data",
  className = "",
  size = "icon",
  accept = ".txt,.json"
}: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input to allow re-importing the same file
      e.target.value = "";
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      title={tooltip}
      className={`text-white/50 hover:text-white/90 hover:bg-white/10 ${className}`}
    >
      <Upload className="h-4 w-4" />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </Button>
  );
}
