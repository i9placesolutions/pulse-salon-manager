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

// Sistema de deduplicação para evitar toasts repetidos
const toastDisplayed = new Set<string>();
// Armazenar o último toast mostrado para evitar duplicações
let lastToastKey: string | null = null;

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        // Verificar se este toast já está sendo exibido
        const toastKey = `${title}-${description}`;
        
        // Se já estiver exibindo ou for igual ao último, ignorar
        if (toastDisplayed.has(toastKey) || toastKey === lastToastKey) {
          return null;
        }
        
        // Limpar todos os toasts anteriores para garantir apenas um por vez
        toastDisplayed.clear();
        
        // Adicionar à lista de toasts exibidos e atualizar o último
        toastDisplayed.add(toastKey);
        lastToastKey = toastKey;
        
        // Configurar para remover da lista após fechar
        setTimeout(() => {
          toastDisplayed.delete(toastKey);
          if (lastToastKey === toastKey) {
            lastToastKey = null;
          }
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
