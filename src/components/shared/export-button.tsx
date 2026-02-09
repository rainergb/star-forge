import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => void;
  tooltip?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export function ExportButton({
  onExport,
  tooltip = "Export data",
  className = "",
  size = "icon"
}: ExportButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onExport}
      title={tooltip}
      className={`text-white/50 hover:text-white/90 hover:bg-white/10 ${className}`}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
