import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface PopoverContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

const PopoverContext = React.createContext<PopoverContextType | null>(null)

const usePopover = () => {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error("Popover components must be used within a Popover")
  }
  return context
}

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Popover = ({ children, open: controlledOpen, onOpenChange }: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null!)
  
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setUncontrolledOpen(value)
    }
  }

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open)
      onClick?.(e)
    }

    const combinedRef = (node: HTMLButtonElement) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: combinedRef,
        onClick: handleClick,
        ...props,
      })
    }

    return (
      <button ref={combinedRef} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover()
    const [position, setPosition] = React.useState({ top: 0, left: 0 })
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const contentWidth = contentRef.current?.offsetWidth || 0
        
        let left = rect.left
        if (align === "center") {
          left = rect.left + rect.width / 2 - contentWidth / 2
        } else if (align === "end") {
          left = rect.right - contentWidth
        }

        setPosition({
          top: rect.bottom + sideOffset,
          left: Math.max(8, left),
        })
      }
    }, [open, align, sideOffset, triggerRef])

    if (!open) return null

    return createPortal(
      <>
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
        <div
          ref={(node) => {
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          style={{ top: position.top, left: position.left }}
          className={cn(
            "fixed z-50 w-auto rounded-lg border border-white/10 bg-[#1a1d3a] p-4 shadow-xl outline-none animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>,
      document.body
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
