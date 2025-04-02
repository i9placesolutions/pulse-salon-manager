import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info, AlertTriangle, Loader2, Bell } from "lucide-react"

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
        else if (variant === "primary") Icon = Bell

        // Definir um estilo de fundo de ícone com base no variante
        const getIconBackground = () => {
          switch (variant) {
            case "destructive": return "bg-red-200 p-1.5 rounded-full";
            case "success": return "bg-green-200 p-1.5 rounded-full";
            case "warning": return "bg-amber-200 p-1.5 rounded-full";
            case "info": return "bg-blue-200 p-1.5 rounded-full";
            case "primary": return "bg-pink-200 p-1.5 rounded-full";
            case "loading": return "bg-cyan-200 p-1.5 rounded-full";
            default: return "bg-gray-200 p-1.5 rounded-full";
          }
        };

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="grid gap-1">
              {title && (
                <div className="flex items-center gap-2">
                  {variant && variant !== "default" && (
                    <div className={`shrink-0 ${getIconBackground()}`}>
                      <Icon 
                        className={`h-5 w-5 ${
                          variant === "destructive" ? "text-red-600" :
                          variant === "success" ? "text-green-600" :
                          variant === "warning" ? "text-amber-600" :
                          variant === "info" ? "text-blue-600" :
                          variant === "primary" ? "text-pink-600" :
                          variant === "loading" ? "text-cyan-600 animate-spin" : ""
                        }`} 
                      />
                    </div>
                  )}
                  <ToastTitle>{title}</ToastTitle>
                </div>
              )}
              {description && (
                <ToastDescription className="ml-9">{description}</ToastDescription>
              )}
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
