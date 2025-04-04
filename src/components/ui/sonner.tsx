import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Definição de tipo para as funções de classe
type ToastClassNameFn = (opts: { type?: string }) => string

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:rounded-lg group-[.toaster]:border group-[.toaster]:shadow-xl data-[type=success]:border-l-8 data-[type=success]:border-l-green-500 data-[type=success]:bg-gradient-to-r data-[type=success]:from-green-100 data-[type=success]:to-white data-[type=success]:text-green-800 data-[type=success]:shadow-green-100 data-[type=error]:border-l-8 data-[type=error]:border-l-red-500 data-[type=error]:bg-gradient-to-r data-[type=error]:from-red-100 data-[type=error]:to-white data-[type=error]:text-red-800 data-[type=error]:shadow-red-100 data-[type=warning]:border-l-8 data-[type=warning]:border-l-amber-500 data-[type=warning]:bg-gradient-to-r data-[type=warning]:from-amber-100 data-[type=warning]:to-white data-[type=warning]:text-amber-800 data-[type=warning]:shadow-amber-100 data-[type=info]:border-l-8 data-[type=info]:border-l-blue-500 data-[type=info]:bg-gradient-to-r data-[type=info]:from-blue-100 data-[type=info]:to-white data-[type=info]:text-blue-800 data-[type=info]:shadow-blue-100 data-[type=loading]:border-l-8 data-[type=loading]:border-l-cyan-500 data-[type=loading]:bg-gradient-to-r data-[type=loading]:from-cyan-100 data-[type=loading]:to-white data-[type=loading]:text-cyan-800 data-[type=loading]:shadow-cyan-100 data-[type=default]:bg-white data-[type=default]:text-foreground data-[type=default]:border-gray-200 p-4 pr-8",
          title: "font-semibold text-base",
          description: "text-sm mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 data-[type=success]:text-green-500 data-[type=success]:hover:text-green-700 data-[type=success]:focus:ring-green-500 data-[type=error]:text-red-500 data-[type=error]:hover:text-red-700 data-[type=error]:focus:ring-red-500 data-[type=warning]:text-amber-500 data-[type=warning]:hover:text-amber-700 data-[type=warning]:focus:ring-amber-500 data-[type=info]:text-blue-500 data-[type=info]:hover:text-blue-700 data-[type=info]:focus:ring-blue-500 data-[type=loading]:text-cyan-500 data-[type=loading]:hover:text-cyan-700 data-[type=loading]:focus:ring-cyan-500 data-[type=default]:text-gray-500 data-[type=default]:hover:text-gray-700 data-[type=default]:focus:ring-gray-500"
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
