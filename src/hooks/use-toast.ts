import { toast as sonnerToast } from "sonner";

// Tipos para manter compatibilidade com a API anterior
export interface ToastActionElement {}

export interface ToastProps {
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "primary" | "loading";
  className?: string;
  title?: string;
  description?: string;
  duration?: number;
}

// Opções de toast compatíveis com a API anterior
export interface ToastOptions extends ToastProps {
  id?: string;
}

// Estado da memória fictício para compatibilidade
const memoryState = { toasts: [] };

// API simplificada que redireciona para o Sonner
export function toast(options: ToastOptions) {
  const { variant, title, description, duration = 5000, ...rest } = options;
  
  // Mapeamento de variantes para o Sonner
  let type: "default" | "success" | "error" | "warning" | "info" | "loading" = "default";
  if (variant === "destructive") type = "error";
  else if (variant === "success") type = "success";
  else if (variant === "warning") type = "warning";
  else if (variant === "info") type = "info";
  else if (variant === "loading") type = "loading";
  
  // Use a API do Sonner
  if (type === "default") {
    sonnerToast(title || "", { description, duration });
  } else {
    (sonnerToast[type] as any)(title || "", { description, duration });
  }
  
  // Retorno para compatibilidade com a API antiga
  return {
    id: options.id || Math.random().toString(),
    dismiss: () => {},
    update: () => {},
  };
}

// Wrapper para manter a API de hooks compatível
export function useToast() {
  return {
    toast,
    success: (props: ToastOptions) => toast({ ...props, variant: "success" }),
    error: (props: ToastOptions) => toast({ ...props, variant: "destructive" }),
    warning: (props: ToastOptions) => toast({ ...props, variant: "warning" }),
    info: (props: ToastOptions) => toast({ ...props, variant: "info" }),
    primary: (props: ToastOptions) => toast({ ...props, variant: "primary" }),
    loading: (props: ToastOptions) => toast({ ...props, variant: "loading" }),
    dismiss: () => {},
    toasts: [],
  };
}

// Helpers para simplificar o uso
export const toastSuccess = (props: ToastOptions) => toast({ ...props, variant: "success" });
export const toastError = (props: ToastOptions) => toast({ ...props, variant: "destructive" });
export const toastWarning = (props: ToastOptions) => toast({ ...props, variant: "warning" });
export const toastInfo = (props: ToastOptions) => toast({ ...props, variant: "info" });
export const toastPrimary = (props: ToastOptions) => toast({ ...props, variant: "primary" });
export const toastLoading = (props: ToastOptions) => toast({ ...props, variant: "loading" });

// Documentação para completar a API
export const TOAST_DOCUMENTATION = "";
