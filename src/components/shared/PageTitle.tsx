import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function PageTitle({ title, subtitle, icon, className }: PageTitleProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="p-1.5 rounded-lg bg-purple-100">{icon}</div>}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
