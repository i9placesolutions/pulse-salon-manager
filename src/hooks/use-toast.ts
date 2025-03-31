import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

// Nova interface para permitir id nas funções de toast
interface ToastOptions extends Omit<ToasterToast, "id"> {
  id?: string;
}

function toast(props: ToastOptions) {
  const id = props.id || genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    success: (props: ToastOptions) => 
      toast({ ...props, variant: "success" }),
    error: (props: ToastOptions) => 
      toast({ ...props, variant: "destructive" }),
    warning: (props: ToastOptions) => 
      toast({ ...props, variant: "warning" }),
    info: (props: ToastOptions) => 
      toast({ ...props, variant: "info" }),
    primary: (props: ToastOptions) => 
      toast({ ...props, variant: "primary" }),
    loading: (props: ToastOptions) => 
      toast({ ...props, variant: "loading" }),
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// Helper functions for direct import
const toastSuccess = (props: ToastOptions) => 
  toast({ ...props, variant: "success" });

const toastError = (props: ToastOptions) => 
  toast({ ...props, variant: "destructive" });

const toastWarning = (props: ToastOptions) => 
  toast({ ...props, variant: "warning" });

const toastInfo = (props: ToastOptions) => 
  toast({ ...props, variant: "info" });

const toastPrimary = (props: ToastOptions) => 
  toast({ ...props, variant: "primary" });

const toastLoading = (props: ToastOptions) => 
  toast({ ...props, variant: "loading" });

// Documentação de como usar as notificações
export const TOAST_DOCUMENTATION = {
  variants: {
    default: "Notificação padrão (branca)",
    success: "Verde - Para operações bem-sucedidas",
    destructive: "Vermelho - Para erros ou operações com consequências graves",
    warning: "Âmbar - Para avisos ou alertas",
    info: "Azul - Para informações gerais",
    primary: "Rosa - Para destaques ou novidades",
    loading: "Azul claro - Para operações em andamento"
  },
  uso: `
    // Importação dos métodos
    import { 
      useToast, 
      toastSuccess, 
      toastError, 
      toastWarning, 
      toastInfo, 
      toastPrimary, 
      toastLoading 
    } from "@/components/ui/use-toast";

    // Usando o hook
    const { toast, success, error } = useToast();

    // Métodos diretos
    toast({ title: "Título", description: "Descrição", variant: "success" });
    
    // Métodos especializados
    toastSuccess({ title: "Sucesso", description: "Operação realizada" });
    toastError({ title: "Erro", description: "Falha na operação" });
    
    // Exemplo de uso com loading e atualização
    const loading = toastLoading({ title: "Processando" });
    // Após a operação:
    toastSuccess({ id: loading.id, title: "Concluído" });
  `,
  atualizacao: "Para atualizar um toast existente, use o id retornado pela função toast"
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
}
