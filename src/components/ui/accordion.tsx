import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("w-full", className)}>{children}</div>
)

const AccordionItem = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("border-b border-white/10", className)}>{children}</div>
)

const AccordionTrigger = ({ 
  children, 
  className, 
  isOpen, 
  onClick 
}: { 
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-primary text-white w-full text-left",
      className
    )}
  >
    {children}
    <ChevronDown
      className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-200 text-white/50",
        isOpen && "rotate-180"
      )}
    />
  </button>
)

const AccordionContent = ({ 
  children, 
  className, 
  isOpen 
}: { 
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}) => (
  <div
    className={cn(
      "overflow-hidden text-sm transition-all duration-300 ease-in-out",
      isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
    )}
  >
    <div className={cn("pt-0", className)}>{children}</div>
  </div>
)

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
