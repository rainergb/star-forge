import { useState, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function ContextMenu({
  position,
  onClose,
  children,
  className
}: ContextMenuProps) {
  if (!position) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        className={cn(
          "fixed z-50 min-w-[180px] bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{ left: position.x, top: position.y }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

interface ContextMenuItemProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  className?: string;
}

export function ContextMenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  className
}: ContextMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors cursor-pointer",
        variant === "danger"
          ? "text-red-400 hover:bg-red-400/10"
          : "text-white/70 hover:bg-white/5",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function ContextMenuDivider() {
  return <div className="border-t border-white/10 my-1" />;
}

interface ContextMenuSubMenuProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}

export function ContextMenuSubMenu({ icon, label, children }: ContextMenuSubMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Delay para dar tempo do mouse atravessar o gap entre o item e o submenu.
    // Sem o delay, onMouseLeave dispara ao cruzar os 4px de gap e fecha o submenu
    // antes do usuário conseguir clicar em qualquer opção.
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer">
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="w-3 h-3 text-white/30" />
      </button>
      {open && (
        <div
          className="absolute left-full top-0 min-w-[160px] bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl py-1 z-[60]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Ponte transparente que preenche o gap entre o item e o submenu,
              evitando que onMouseLeave dispare ao cruzar o espaço entre eles */}
          <div className="absolute -left-2 inset-y-0 w-2" />
          {children}
        </div>
      )}
    </div>
  );
}

// Hook para gerenciar o context menu
export function useContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const close = () => setPosition(null);

  return { position, handleContextMenu, close };
}
