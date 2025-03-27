import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReactNode } from "react";

interface FormCardProps {
  title: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan';
}

export function FormCard({ 
  title, 
  description,
  children, 
  footer, 
  className = "",
  action,
  variant = 'blue'
}: FormCardProps) {
  // Cores baseadas no variant selecionado
  const colors = {
    'blue': {
      border: 'border-blue-200',
      header: 'bg-gradient-to-r from-blue-50 to-blue-100',
      title: 'text-blue-700',
      description: 'text-blue-600/70',
      footer: 'bg-blue-50/50',
      hover: 'hover:shadow-blue-100/40'
    },
    'purple': {
      border: 'border-purple-200',
      header: 'bg-gradient-to-r from-purple-50 to-purple-100',
      title: 'text-purple-700',
      description: 'text-purple-600/70',
      footer: 'bg-purple-50/50',
      hover: 'hover:shadow-purple-100/40'
    },
    'green': {
      border: 'border-green-200',
      header: 'bg-gradient-to-r from-green-50 to-green-100',
      title: 'text-green-700',
      description: 'text-green-600/70',
      footer: 'bg-green-50/50',
      hover: 'hover:shadow-green-100/40'
    },
    'amber': {
      border: 'border-amber-200',
      header: 'bg-gradient-to-r from-amber-50 to-amber-100',
      title: 'text-amber-700',
      description: 'text-amber-600/70',
      footer: 'bg-amber-50/50',
      hover: 'hover:shadow-amber-100/40'
    },
    'emerald': {
      border: 'border-emerald-200',
      header: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
      title: 'text-emerald-700',
      description: 'text-emerald-600/70',
      footer: 'bg-emerald-50/50',
      hover: 'hover:shadow-emerald-100/40'
    },
    'rose': {
      border: 'border-rose-200',
      header: 'bg-gradient-to-r from-rose-50 to-rose-100',
      title: 'text-rose-700',
      description: 'text-rose-600/70',
      footer: 'bg-rose-50/50',
      hover: 'hover:shadow-rose-100/40'
    },
    'indigo': {
      border: 'border-indigo-200',
      header: 'bg-gradient-to-r from-indigo-50 to-indigo-100',
      title: 'text-indigo-700',
      description: 'text-indigo-600/70',
      footer: 'bg-indigo-50/50',
      hover: 'hover:shadow-indigo-100/40'
    },
    'cyan': {
      border: 'border-cyan-200',
      header: 'bg-gradient-to-r from-cyan-50 to-cyan-100',
      title: 'text-cyan-700',
      description: 'text-cyan-600/70',
      footer: 'bg-cyan-50/50',
      hover: 'hover:shadow-cyan-100/40'
    }
  };

  const colorStyles = colors[variant];

  return (
    <Card className={`w-full ${colorStyles.border} shadow-sm hover:shadow transition-all ${colorStyles.hover} ${className}`}>
      <CardHeader className={`${action ? "flex flex-row items-center justify-between" : ""} ${colorStyles.header} rounded-t-lg`}>
        <div>
          {typeof title === 'string' ? (
            <CardTitle className={colorStyles.title}>{title}</CardTitle>
          ) : (
            title
          )}
          {description && <CardDescription className={colorStyles.description}>{description}</CardDescription>}
        </div>
        {action && action}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
      {footer && (
        <div className={`px-6 py-4 border-t ${colorStyles.footer} flex justify-end`}>
          {footer}
        </div>
      )}
    </Card>
  );
} 