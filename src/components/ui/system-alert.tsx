import { cn } from "@/lib/utils";
import { AlertCircle, Bell, CheckCircle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

type SystemAlertVariant = "info" | "success" | "warning" | "error" | "demo";

interface SystemAlertProps {
  title: string;
  message: string;
  variant?: SystemAlertVariant;
  icon?: React.ReactNode;
  dismissible?: boolean;
  className?: string;
  autoClose?: number; // em milissegundos
}

export function SystemAlert({
  title,
  message,
  variant = "info",
  icon,
  dismissible = true,
  className,
  autoClose
}: SystemAlertProps) {
  const [visible, setVisible] = useState(true);

  // Fechar automaticamente após o tempo especificado
  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  if (!visible) return null;

  // Definir classes com base na variante
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "border-green-500 bg-gradient-to-r from-green-100 to-emerald-50 text-green-800";
      case "warning":
        return "border-amber-500 bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800";
      case "error":
        return "border-red-500 bg-gradient-to-r from-red-100 to-rose-50 text-red-800";
      case "demo":
        return "border-purple-500 bg-gradient-to-r from-purple-100 to-fuchsia-50 text-purple-800";
      case "info":
      default:
        return "border-blue-500 bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-800";
    }
  };

  // Definir ícone padrão com base na variante se não for fornecido
  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-amber-600" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case "demo":
        return <Bell className="h-6 w-6 text-purple-600" />;
      case "info":
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div 
      className={cn(
        "relative rounded-xl border-l-8 p-4 shadow-md animate-slide-up mb-4",
        getVariantClasses(),
        className
      )}
    >
      <div className="flex gap-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && (
          <button 
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Fechar alerta"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
} 