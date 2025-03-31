import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        // Determine which icon to show based on variant
        let Icon = Info
        
        if (variant === "destructive") Icon = AlertCircle
        else if (variant === "success") Icon = CheckCircle
        else if (variant === "warning") Icon = AlertTriangle
        else if (variant === "info") Icon = Info
        else if (variant === "loading") Icon = Loader2

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex items-start gap-3">
              {variant && variant !== "default" && (
                <div className="shrink-0 pt-0.5">
                  <Icon 
                    className={`h-5 w-5 ${
                      variant === "destructive" ? "text-red-600" :
                      variant === "success" ? "text-green-600" :
                      variant === "warning" ? "text-amber-600" :
                      variant === "info" ? "text-blue-600" :
                      variant === "primary" ? "text-pink-600" :
                      variant === "loading" ? "text-blue-600 animate-spin" : ""
                    }`} 
                  />
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
