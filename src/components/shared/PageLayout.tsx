import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'emerald' | 'rose' | 'indigo';
}

export function PageLayout({ 
  children, 
  header, 
  fullWidth = true, 
  className = "",
  variant = 'blue'
}: PageLayoutProps) {
  // Cores baseadas no variant selecionado
  const bgColors = {
    'blue': 'bg-gradient-to-br from-blue-50 to-white',
    'purple': 'bg-gradient-to-br from-purple-50 to-white',
    'green': 'bg-gradient-to-br from-green-50 to-white',
    'amber': 'bg-gradient-to-br from-amber-50 to-white',
    'emerald': 'bg-gradient-to-br from-emerald-50 to-white',
    'rose': 'bg-gradient-to-br from-rose-50 to-white',
    'indigo': 'bg-gradient-to-br from-indigo-50 to-white'
  };

  const bgColor = bgColors[variant];

  return (
    <div className={`min-h-screen ${bgColor} ${className}`}>
      {header}
      <main className={`w-full px-6 py-6 ${fullWidth ? 'max-w-full' : 'container mx-auto'}`}>
        <div className="max-w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
} 