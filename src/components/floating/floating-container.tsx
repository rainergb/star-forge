import { ReactNode, useState, useRef, useCallback } from "react";
import { X, Pin, PinOff, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WidgetPosition } from "@/types/widget.types";

interface FloatingContainerProps {
  title: string;
  children: ReactNode;
  isVisible: boolean;
  isPinned: boolean;
  isExpanded?: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleExpand?: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  className?: string;
  expandedClassName?: string;
  stackIndex?: number;
  canExpand?: boolean; // Whether expansion is allowed (max 2 limit)
  showExpandButton?: boolean;
}

// Base heights for stacking calculation
const COLLAPSED_HEIGHT = 340; // max-h-[340px]
const EXPANDED_HEIGHT = 500; // max-h-[500px]
const STACK_GAP = 12; // Gap between stacked widgets

const positionClasses: Record<WidgetPosition, string> = {
  "top-left": "top-20 left-4",
  "top-right": "top-20 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4"
};

export function FloatingContainer({
  title,
  children,
  isVisible,
  isPinned,
  isExpanded = false,
  position,
  onClose,
  onTogglePin,
  onToggleExpand,
  onPositionChange,
  className,
  expandedClassName,
  stackIndex = 0,
  canExpand = true,
  showExpandButton = true
}: FloatingContainerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Calculate stack offset based on position and index
  // Each widget below the first gets offset by previous widgets' heights
  const getStackTransform = () => {
    if (stackIndex === 0) return '';
    
    // Approximate offset based on average widget height
    // In a real scenario, we'd measure actual heights
    const baseOffset = stackIndex * (COLLAPSED_HEIGHT + STACK_GAP);
    
    // For top positions, stack downwards
    // For bottom positions, stack upwards
    const isBottomPosition = position.startsWith('bottom');
    
    if (isBottomPosition) {
      return `translateY(-${baseOffset}px)`;
    }
    return `translateY(${baseOffset}px)`;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || isPinned) return;
    
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({
      x: rect.left,
      y: rect.top
    });
  }, [isPinned]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    const rect = containerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Constrain within screen bounds with some padding
    const minX = -rect.width + 50; // Keep at least 50px visible
    const maxX = windowWidth - 50;
    const minY = 0;
    const maxY = windowHeight - 50;
    
    setDragOffset(prev => ({
      x: Math.min(maxX, Math.max(minX, prev.x + deltaX)),
      y: Math.min(maxY, Math.max(minY, prev.y + deltaY))
    }));
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const midX = windowWidth / 2;
    const midY = windowHeight / 2;
    
    const isLeft = e.clientX < midX;
    const isTop = e.clientY < midY;
    
    let newPosition: WidgetPosition;
    if (isTop && isLeft) {
      newPosition = "top-left";
    } else if (isTop && !isLeft) {
      newPosition = "top-right";
    } else if (!isTop && isLeft) {
      newPosition = "bottom-left";
    } else {
      newPosition = "bottom-right";
    }
    
    onPositionChange(newPosition);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, onPositionChange]);

  if (!isVisible) return null;

  const stackTransform = getStackTransform();
  const draggingStyle = isDragging
    ? {
        position: "fixed" as const,
        left: dragOffset.x,
        top: dragOffset.y,
        right: "auto",
        bottom: "auto",
        transition: "none",
        transform: "none"
      }
    : { transform: stackTransform };

  return (
    <>
      {/* Invisible overlay to capture mouse events during drag */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-60 cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      )}

      <div
        ref={containerRef}
        style={draggingStyle}
        className={cn(
          "fixed z-50",
          !isDragging && positionClasses[position],
          "bg-background/50 backdrop-blur-md",
          "border border-white/10 rounded-2xl",
          "shadow-2xl shadow-black/20",
          "flex flex-col",
          !isDragging && "animate-in fade-in-0 duration-200",
          !isDragging && "transition-all duration-300 ease-out",
          isDragging && "cursor-grabbing shadow-2xl shadow-primary/20 scale-[1.02]",
          isExpanded
            ? cn("w-[420px] max-h-[500px]", expandedClassName)
            : cn("w-72 max-h-[340px]", className)
        )}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 relative z-10 bg-background/30">
          <div className="flex items-center gap-2">
            {!isPinned && (
              <button
                className={cn(
                  "cursor-grab active:cursor-grabbing text-white/40 hover:text-white/80 transition-colors select-none",
                  isDragging && "cursor-grabbing"
                )}
                onMouseDown={handleMouseDown}
                draggable={false}
              >
                <GripVertical className="h-4 w-4 pointer-events-none" />
              </button>
            )}
            <span className="text-sm font-medium text-white/90">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {showExpandButton && onToggleExpand && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 hover:bg-white/10",
                  isExpanded
                    ? "text-primary hover:text-primary"
                    : "text-white/60 hover:text-white/90",
                  !canExpand && !isExpanded && "opacity-50 cursor-not-allowed"
                )}
                onClick={onToggleExpand}
                disabled={!canExpand && !isExpanded}
                title={!canExpand && !isExpanded ? "Maximum 2 expanded widgets" : isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 hover:bg-white/10",
                isPinned
                  ? "text-primary hover:text-primary"
                  : "text-white/60 hover:text-white/90"
              )}
              onClick={onTogglePin}
            >
              {isPinned ? (
                <Pin className="h-4 w-4" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/60 hover:text-white/90 hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </>
  );
}
