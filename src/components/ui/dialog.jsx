// src/components/ui/dialog.jsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

// Helpers: clases utilitarias (puedes personalizarlas a tu gusto)
const overlayClass = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
const contentClass =
    "fixed z-50 left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none"
const headerClass = "mb-4 flex items-center justify-between"
const titleClass = "text-lg font-bold"
const closeBtnClass = "rounded-full p-2 hover:bg-gray-100"

// Componente Overlay
const DialogOverlay = React.forwardRef((props, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={overlayClass} {...props} />
))
DialogOverlay.displayName = "DialogOverlay"

// Componente Content
const DialogContent = React.forwardRef(({ children, className = "", ...props }, ref) => (
    <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref} className={`${contentClass} ${className}`} {...props}>
            {children}
            <DialogPrimitive.Close asChild>
                <button className={closeBtnClass} aria-label="Cerrar">
                    <X className="h-5 w-5" />
                </button>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
))
DialogContent.displayName = "DialogContent"

// Header, Title, Trigger...
const DialogHeader = ({ children, className = "", ...props }) => (
    <div className={`${headerClass} ${className}`} {...props}>
        {children}
    </div>
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className = "", ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={`${titleClass} ${className}`} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogTrigger = DialogPrimitive.Trigger
DialogTrigger.displayName = "DialogTrigger"

// Exporta todo igual que en shadcn/ui
export {
    DialogPrimitive as DialogRoot,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
}

export const Dialog = DialogPrimitive.Root
