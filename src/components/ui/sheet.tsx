import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) => {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-9999">
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="fixed top-0 right-0 z-10000 h-full duration-300 animate-in slide-in-from-right">
        <div className="relative h-full">
          {children}
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer z-10"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const SheetContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("h-full border-l border-white/10 bg-[#0b0d27] p-6 shadow-lg", className)} {...props}>
    {children}
  </div>
)

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold text-white", className)} {...props} />
)

export { Sheet, SheetContent, SheetHeader, SheetTitle }
