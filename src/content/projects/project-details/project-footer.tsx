import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface ProjectFooterProps {
  createdAt: number;
  onDelete: () => void;
}

export function ProjectFooter({ createdAt, onDelete }: ProjectFooterProps) {
  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">
          Criado em {format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
