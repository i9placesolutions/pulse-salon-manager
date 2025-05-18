import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-foreground p-6 pr-8 shadow-md",
        destructive:
          "group border-l-8 border-l-red-600 bg-gradient-to-r from-red-50 to-white text-red-800 p-4 pl-4 pr-8 shadow-md",
        success:
          "group border-l-8 border-l-green-600 bg-gradient-to-r from-green-50 to-white text-green-800 p-4 pl-4 pr-8 shadow-md",
        warning:
          "group border-l-8 border-l-amber-600 bg-gradient-to-r from-amber-50 to-white text-amber-800 p-4 pl-4 pr-8 shadow-md",
        info:
          "group border-l-8 border-l-blue-600 bg-gradient-to-r from-blue-50 to-white text-blue-800 p-4 pl-4 pr-8 shadow-md",
        primary:
          "group border-l-8 border-l-pink-600 bg-gradient-to-r from-pink-50 to-white text-pink-800 p-4 pl-4 pr-8 shadow-md",
        loading:
          "group border-l-8 border-l-cyan-600 bg-gradient-to-r from-cyan-50 to-white text-cyan-800 p-4 pl-4 pr-8 shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      "group-[.destructive]:border-red-300 group-[.destructive]:hover:border-red-700 group-[.destructive]:hover:bg-red-600 group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-red-500",
      "group-[.success]:border-green-300 group-[.success]:hover:border-green-700 group-[.success]:hover:bg-green-600 group-[.success]:hover:text-white group-[.success]:focus:ring-green-500",
      "group-[.warning]:border-amber-300 group-[.warning]:hover:border-amber-700 group-[.warning]:hover:bg-amber-600 group-[.warning]:hover:text-white group-[.warning]:focus:ring-amber-500",
      "group-[.info]:border-blue-300 group-[.info]:hover:border-blue-700 group-[.info]:hover:bg-blue-600 group-[.info]:hover:text-white group-[.info]:focus:ring-blue-500",
      "group-[.primary]:border-pink-300 group-[.primary]:hover:border-pink-700 group-[.primary]:hover:bg-pink-600 group-[.primary]:hover:text-white group-[.primary]:focus:ring-pink-500",
      "group-[.loading]:border-cyan-300 group-[.loading]:hover:border-cyan-700 group-[.loading]:hover:bg-cyan-600 group-[.loading]:hover:text-white group-[.loading]:focus:ring-cyan-500",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      "group-[.destructive]:text-red-500 group-[.destructive]:hover:text-red-700 group-[.destructive]:focus:ring-red-500",
      "group-[.success]:text-green-500 group-[.success]:hover:text-green-700 group-[.success]:focus:ring-green-500",
      "group-[.warning]:text-amber-500 group-[.warning]:hover:text-amber-700 group-[.warning]:focus:ring-amber-500",
      "group-[.info]:text-blue-500 group-[.info]:hover:text-blue-700 group-[.info]:focus:ring-blue-500",
      "group-[.primary]:text-pink-500 group-[.primary]:hover:text-pink-700 group-[.primary]:focus:ring-pink-500",
      "group-[.loading]:text-cyan-500 group-[.loading]:hover:text-cyan-700 group-[.loading]:focus:ring-cyan-500",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <div className="flex items-center">
    {props.children && (
      <>
        {typeof props.children === 'string' && props.children.includes("Sucesso") && (
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        )}
        {typeof props.children === 'string' && props.children.includes("Erro") && (
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
        )}
        {typeof props.children === 'string' && props.children.includes("Atenção") && (
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
        )}
        {typeof props.children === 'string' && props.children.includes("Informação") && (
          <Info className="h-5 w-5 text-blue-600 mr-2" />
        )}
        {typeof props.children === 'string' && props.children.includes("Processando") && (
          <Loader2 className="h-5 w-5 text-cyan-600 mr-2 animate-spin" />
        )}
        <ToastPrimitives.Title
          ref={ref}
          className={cn("text-base font-semibold", className)}
          {...props}
        />
      </>
    )}
  </div>
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm ml-7", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
