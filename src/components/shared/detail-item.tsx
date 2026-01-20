import { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CoverImageBanner } from "./cover-image-banner";
import { EditableTitle } from "./editable-title";
import { FavoriteButton } from "./favorite-button";

// ============================================================================
// DetailContainer - The main Sheet wrapper
// ============================================================================

interface DetailContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function DetailContainer({
  open,
  onOpenChange,
  children,
  className
}: DetailContainerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "w-full sm:max-w-md bg-background border-l border-white/10 text-white flex flex-col p-0",
          className
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// DetailContent - Scrollable content area
// ============================================================================

interface DetailContentProps {
  children: ReactNode;
  className?: string;
}

export function DetailContent({ children, className }: DetailContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto scrollbar-none", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// DetailHeader - Flexible header with optional cover image
// ============================================================================

interface DetailHeaderProps {
  /** Cover image URL */
  image?: string | null;
  /** Alt text for cover image */
  imageAlt?: string;
  /** Callback when image is updated */
  onUpdateImage?: (image: string | null) => void;
  /** Custom leading element (icon, checkbox, etc.) */
  leading?: ReactNode;
  /** Title text */
  title?: string;
  /** Title edit mode */
  titleMode?: "click-to-edit" | "always-editable" | "readonly";
  /** Callback when title changes */
  onUpdateTitle?: (title: string) => void;
  /** Show edit icon for title */
  showTitleEditIcon?: boolean;
  /** Subtitle or description */
  subtitle?: ReactNode;
  /** Whether item is favorited */
  isFavorite?: boolean;
  /** Callback when favorite is toggled */
  onToggleFavorite?: () => void;
  /** Favorite button color */
  favoriteColor?: "yellow" | "purple";
  /** Extra trailing content (badges, buttons) */
  trailing?: ReactNode;
  /** Custom children content below title/subtitle */
  children?: ReactNode;
  className?: string;
}

export function DetailHeader({
  image,
  imageAlt = "Cover",
  onUpdateImage,
  leading,
  title,
  titleMode = "click-to-edit",
  onUpdateTitle,
  showTitleEditIcon = true,
  subtitle,
  isFavorite,
  onToggleFavorite,
  favoriteColor = "purple",
  trailing,
  children,
  className
}: DetailHeaderProps) {
  return (
    <div className={cn("border-b border-white/10", className)}>
      {/* Cover Image */}
      {onUpdateImage && (
        <CoverImageBanner
          image={image ?? null}
          alt={imageAlt}
          onUpdateImage={onUpdateImage}
          height="md"
        />
      )}

      {/* Header Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Leading element */}
          {leading}

          {/* Title & Subtitle */}
          <div className="flex-1 min-w-0">
            {title !== undefined && onUpdateTitle && titleMode !== "readonly" ? (
              <EditableTitle
                value={title}
                onChange={onUpdateTitle}
                mode={titleMode}
                showEditIcon={showTitleEditIcon}
              />
            ) : title !== undefined ? (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            ) : null}

            {subtitle && (
              <div className="text-sm text-white/50 mt-1">{subtitle}</div>
            )}

            {children}
          </div>

          {/* Trailing elements */}
          <div className="flex items-center gap-2 shrink-0">
            {trailing}
            {onToggleFavorite && (
              <FavoriteButton
                isFavorite={isFavorite ?? false}
                onToggle={onToggleFavorite}
                color={favoriteColor}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DetailSection - Generic section with title and content
// ============================================================================

interface DetailSectionProps {
  /** Section title */
  title?: string;
  /** Icon next to title */
  icon?: ReactNode;
  /** Right side of section header (actions, badges) */
  headerRight?: ReactNode;
  /** Section content */
  children: ReactNode;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
  /** No padding/border variant */
  variant?: "default" | "compact" | "flush";
}

export function DetailSection({
  title,
  icon,
  headerRight,
  children,
  className,
  contentClassName,
  variant = "default"
}: DetailSectionProps) {
  const variantStyles = {
    default: "px-4 py-4 border-b border-white/10",
    compact: "px-4 py-3 border-b border-white/10",
    flush: "border-b border-white/10"
  };

  return (
    <div className={cn(variantStyles[variant], className)}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-white/50">{icon}</span>}
            {title && (
              <h3 className="text-sm font-medium text-white/70">{title}</h3>
            )}
          </div>
          {headerRight}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

// ============================================================================
// DetailActionRow - Row with icon, label, and optional value/action
// ============================================================================

interface DetailActionRowProps {
  /** Icon element */
  icon: ReactNode;
  /** Label text */
  label: string;
  /** Current value display */
  value?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether to show a clickable hover state */
  clickable?: boolean;
  /** Color accent for the value */
  valueColor?: string;
  /** Right side element */
  trailing?: ReactNode;
  className?: string;
}

export function DetailActionRow({
  icon,
  label,
  value,
  onClick,
  clickable = true,
  valueColor,
  trailing,
  className
}: DetailActionRowProps) {
  const Component = onClick && clickable ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-2 text-left",
        clickable && onClick && "hover:bg-white/5 -mx-2 px-2 rounded-lg cursor-pointer transition-colors",
        className
      )}
    >
      <span className="text-white/50 w-5 h-5 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-sm text-white/70 flex-1">{label}</span>
      {value && (
        <span
          className="text-sm"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </span>
      )}
      {trailing}
    </Component>
  );
}

// ============================================================================
// DetailActionGrid - Grid of action buttons
// ============================================================================

interface DetailActionGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DetailActionGrid({
  children,
  columns = 3,
  className
}: DetailActionGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4"
  };

  return (
    <div className={cn("grid gap-2", gridCols[columns], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// DetailActionButton - Single action button for grid
// ============================================================================

interface DetailActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  activeColor?: string;
  className?: string;
}

export function DetailActionButton({
  icon,
  label,
  onClick,
  isActive = false,
  activeColor,
  className
}: DetailActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors cursor-pointer",
        isActive
          ? "bg-white/10 text-white"
          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70",
        className
      )}
      style={isActive && activeColor ? { color: activeColor } : undefined}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}

// ============================================================================
// DetailStat - Display a stat with label and value
// ============================================================================

interface DetailStatProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DetailStat({
  label,
  value,
  icon,
  color,
  size = "md",
  className
}: DetailStatProps) {
  const sizeStyles = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={cn("text-center", className)}>
      {icon && <div className="text-white/40 mb-1">{icon}</div>}
      <div
        className={cn("font-bold", sizeStyles[size])}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

// ============================================================================
// DetailStatGrid - Grid of stats
// ============================================================================

interface DetailStatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DetailStatGrid({
  children,
  columns = 3,
  className
}: DetailStatGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4"
  };

  return (
    <div
      className={cn(
        "grid gap-4 p-4 bg-white/5 rounded-lg",
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// DetailEmptyState - Empty state for sections
// ============================================================================

interface DetailEmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function DetailEmptyState({
  icon,
  message,
  action,
  className
}: DetailEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
    >
      {icon && <div className="text-white/20 mb-2">{icon}</div>}
      <p className="text-sm text-white/40">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// ============================================================================
// DetailDivider - Simple divider
// ============================================================================

interface DetailDividerProps {
  className?: string;
}

export function DetailDivider({ className }: DetailDividerProps) {
  return <div className={cn("border-t border-white/10", className)} />;
}
