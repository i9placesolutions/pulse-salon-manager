import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, AlertTriangle, XCircle, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground shadow-md mb-3",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-50 to-white",
        destructive:
          "border-l-8 border-l-red-500 bg-gradient-to-r from-red-100 to-white text-red-800 shadow-red-100",
        success:
          "border-l-8 border-l-green-500 bg-gradient-to-r from-green-100 to-white text-green-800 shadow-green-100",
        warning:
          "border-l-8 border-l-amber-500 bg-gradient-to-r from-amber-100 to-white text-amber-800 shadow-amber-100",
        info:
          "border-l-8 border-l-blue-500 bg-gradient-to-r from-blue-100 to-white text-blue-800 shadow-blue-100",
        primary:
          "border-l-8 border-l-pink-500 bg-gradient-to-r from-pink-100 to-white text-pink-800 shadow-pink-100",
        loading:
          "border-l-8 border-l-cyan-500 bg-gradient-to-r from-cyan-100 to-white text-cyan-800 shadow-cyan-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => {
  // Função para determinar o ícone com base no variant
  const renderIcon = () => {
    switch (variant) {
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "loading":
        return <Clock className="h-5 w-5 text-cyan-600" />;
      case "primary":
        return <Info className="h-5 w-5 text-pink-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {renderIcon()}
      {children}
    </div>
  );
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
