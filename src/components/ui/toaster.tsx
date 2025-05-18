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

// Sistema avançado de deduplicação para evitar toasts repetidos
const toastDisplayed = new Set<string>();
// Armazenar os últimos toasts mostrados para evitar duplicações
const recentToasts: {key: string, timestamp: number}[] = [];

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        // Verificar se este toast já está sendo exibido
        const toastKey = `${variant}-${title}-${description}`;
        
        // Verificar se o toast foi mostrado recentemente (nos últimos 5 segundos)
        const now = Date.now();
        const recentDuplicate = recentToasts.find(
          item => item.key === toastKey && (now - item.timestamp) < 5000
        );
        
        // Se já estiver exibindo ou foi mostrado recentemente, ignorar
        if (toastDisplayed.has(toastKey) || recentDuplicate) {
          return null;
        }
        
        // Adicionar à lista de toasts exibidos
        toastDisplayed.add(toastKey);
        
        // Adicionar aos toasts recentes
        recentToasts.push({ key: toastKey, timestamp: now });
        
        // Limitar o array de toasts recentes aos últimos 10
        if (recentToasts.length > 10) {
          recentToasts.shift();
        }
        
        // Configurar para remover da lista após fechar
        setTimeout(() => {
          toastDisplayed.delete(toastKey);
        }, 5000); // Tempo médio de exibição de um toast

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
            case "destructive": return "bg-red-100 p-1.5 rounded-full";
            case "success": return "bg-green-100 p-1.5 rounded-full";
            case "warning": return "bg-amber-100 p-1.5 rounded-full";
            case "info": return "bg-blue-100 p-1.5 rounded-full";
            case "primary": return "bg-pink-100 p-1.5 rounded-full";
            case "loading": return "bg-cyan-100 p-1.5 rounded-full";
            default: return "bg-gray-100 p-1.5 rounded-full";
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
                          variant === "destructive" ? "text-red-700" :
                          variant === "success" ? "text-green-700" :
                          variant === "warning" ? "text-amber-700" :
                          variant === "info" ? "text-blue-700" :
                          variant === "primary" ? "text-pink-700" :
                          variant === "loading" ? "text-cyan-700 animate-spin" : ""
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
