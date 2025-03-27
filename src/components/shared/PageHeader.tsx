import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: React.ReactNode;
  badge?: string;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan' | 'orange' | 'gray';
}

export function PageHeader({ 
  title, 
  subtitle, 
  backTo, 
  action, 
  badge,
  variant = 'blue'
}: PageHeaderProps) {
  const navigate = useNavigate();
  
  // Cores baseadas no variant selecionado
  const colors = {
    'blue': {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-100',
      title: 'from-blue-700 to-blue-800',
      subtitle: 'text-blue-700/70',
      badge: 'bg-blue-500 border-blue-600',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    'purple': {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-100',
      title: 'from-purple-700 to-purple-800',
      subtitle: 'text-purple-700/70',
      badge: 'bg-purple-500 border-purple-600',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    'green': {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-100',
      title: 'from-green-700 to-green-800',
      subtitle: 'text-green-700/70',
      badge: 'bg-green-500 border-green-600',
      icon: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    'amber': {
      bg: 'from-amber-50 to-amber-100',
      border: 'border-amber-100',
      title: 'from-amber-700 to-amber-800',
      subtitle: 'text-amber-700/70',
      badge: 'bg-amber-500 border-amber-600',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100'
    },
    'emerald': {
      bg: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-100',
      title: 'from-emerald-700 to-emerald-800',
      subtitle: 'text-emerald-700/70',
      badge: 'bg-emerald-500 border-emerald-600',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    'rose': {
      bg: 'from-rose-50 to-rose-100',
      border: 'border-rose-100',
      title: 'from-rose-700 to-rose-800',
      subtitle: 'text-rose-700/70',
      badge: 'bg-rose-500 border-rose-600',
      icon: 'text-rose-600',
      iconBg: 'bg-rose-100'
    },
    'indigo': {
      bg: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-100',
      title: 'from-indigo-700 to-indigo-800',
      subtitle: 'text-indigo-700/70',
      badge: 'bg-indigo-500 border-indigo-600',
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    'cyan': {
      bg: 'from-cyan-50 to-cyan-100',
      border: 'border-cyan-100',
      title: 'from-cyan-700 to-cyan-800',
      subtitle: 'text-cyan-700/70',
      badge: 'bg-cyan-500 border-cyan-600',
      icon: 'text-cyan-600',
      iconBg: 'bg-cyan-100'
    },
    'orange': {
      bg: 'from-orange-50 to-orange-100',
      border: 'border-orange-100',
      title: 'from-orange-700 to-orange-800',
      subtitle: 'text-orange-700/70',
      badge: 'bg-orange-500 border-orange-600',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    'gray': {
      bg: 'from-gray-50 to-gray-100',
      border: 'border-gray-100',
      title: 'from-gray-700 to-gray-800',
      subtitle: 'text-gray-700/70',
      badge: 'bg-gray-500 border-gray-600',
      icon: 'text-gray-600',
      iconBg: 'bg-gray-100'
    }
  };

  const colorStyles = colors[variant];
  
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between w-full mb-6 gap-4 bg-gradient-to-r ${colorStyles.bg} p-6 rounded-xl border ${colorStyles.border} shadow-sm`}>
      <div className="flex items-center space-x-3">
        {backTo ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(backTo)}
            className={`${colorStyles.icon} hover:${colorStyles.iconBg} hover:${colorStyles.icon}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className={`${colorStyles.iconBg} p-3 rounded-full`}>
            <ChevronRight className={`h-5 w-5 ${colorStyles.icon}`} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r ${colorStyles.title}`}>{title}</h1>
            {badge && (
              <Badge variant="outline" className={`${colorStyles.badge} text-white uppercase text-xs font-semibold`}>
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className={`text-sm ${colorStyles.subtitle}`}>{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
} 