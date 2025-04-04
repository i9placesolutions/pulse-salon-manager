
import { 
  useToast, 
  toast, 
  toastSuccess, 
  toastError, 
  toastWarning, 
  toastInfo, 
  toastPrimary, 
  toastLoading
} from "@/hooks/use-toast";

// Documentação dos toasts
export const TOAST_DOCUMENTATION = {
  uso: `
// Uso básico
toast({
  title: "Título da notificação",
  description: "Descrição opcional da notificação",
});

// Notificação de sucesso
toastSuccess({
  title: "Operação concluída",
  description: "A operação foi realizada com sucesso!"
});

// Notificação de erro
toastError({
  title: "Erro encontrado",
  description: "Ocorreu um erro ao processar sua solicitação."
});
  `,
  variants: {
    default: "Notificação padrão para informações gerais",
    success: "Operações concluídas com sucesso",
    error: "Erros e falhas no sistema",
    warning: "Alertas e avisos que precisam de atenção",
    info: "Informações importantes para o usuário",
    primary: "Destaques e novidades importantes",
    loading: "Indicação de processamento em andamento"
  },
  atualizacao: "Use o ID retornado pelo toast inicial para atualizar seu conteúdo posteriormente."
};

export { 
  useToast, 
  toast, 
  toastSuccess, 
  toastError, 
  toastWarning, 
  toastInfo, 
  toastPrimary, 
  toastLoading
};
