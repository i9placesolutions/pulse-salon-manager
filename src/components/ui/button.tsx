import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300",
        secondary: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        ghost: "text-blue-700 hover:bg-blue-50 hover:text-blue-800",
        link: "text-blue-600 underline-offset-4 hover:underline",
        
        // Variantes do Dashboard/Sidebar
        dashboard: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        "dashboard-outline": "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300",
        "dashboard-secondary": "bg-blue-100 text-blue-800 hover:bg-blue-200",
        "dashboard-ghost": "text-blue-700 hover:bg-blue-50 hover:text-blue-800",
        
        appointments: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm",
        "appointments-outline": "border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 hover:border-purple-300",
        "appointments-secondary": "bg-purple-100 text-purple-800 hover:bg-purple-200",
        "appointments-ghost": "text-purple-700 hover:bg-purple-50 hover:text-purple-800",
        
        clients: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
        "clients-outline": "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300",
        "clients-secondary": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        "clients-ghost": "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
        
        services: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
        "services-outline": "border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:border-amber-300",
        "services-secondary": "bg-amber-100 text-amber-800 hover:bg-amber-200",
        "services-ghost": "text-amber-700 hover:bg-amber-50 hover:text-amber-800",
        
        professionals: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm",
        "professionals-outline": "border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300",
        "professionals-secondary": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
        "professionals-ghost": "text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800",
        
        financial: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        "financial-outline": "border border-green-200 bg-white text-green-700 hover:bg-green-50 hover:border-green-300",
        "financial-secondary": "bg-green-100 text-green-800 hover:bg-green-200",
        "financial-ghost": "text-green-700 hover:bg-green-50 hover:text-green-800",
        
        inventory: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        "inventory-outline": "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300",
        "inventory-secondary": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        "inventory-ghost": "text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800",
        
        marketing: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        "marketing-outline": "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-300",
        "marketing-secondary": "bg-rose-100 text-rose-800 hover:bg-rose-200",
        "marketing-ghost": "text-rose-700 hover:bg-rose-50 hover:text-rose-800",
        
        subscription: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
        "subscription-outline": "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-300",
        "subscription-secondary": "bg-orange-100 text-orange-800 hover:bg-orange-200",
        "subscription-ghost": "text-orange-700 hover:bg-orange-50 hover:text-orange-800",
        
        settings: "bg-gray-600 text-white hover:bg-gray-700 shadow-sm",
        "settings-outline": "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
        "settings-secondary": "bg-gray-100 text-gray-800 hover:bg-gray-200",
        "settings-ghost": "text-gray-700 hover:bg-gray-50 hover:text-gray-800",
        
        // Manter os botões pink
        pink: "bg-[#db2777] text-white hover:bg-[#be185d] shadow-sm",
        "pink-outline": "border border-[#db2777]/30 bg-white text-[#db2777] hover:bg-[#db2777]/10 hover:border-[#db2777]/60",
        "pink-secondary": "bg-[#db2777]/10 text-[#db2777] hover:bg-[#db2777]/20",
        "pink-ghost": "text-[#db2777] hover:bg-[#db2777]/10 hover:text-[#be185d]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
