
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Scissors,
  UserSquare2,
  CreditCard,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Agendamentos", path: "/appointments" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: ShoppingCart, label: "PDV", path: "/pdv" },
  { icon: Scissors, label: "Serviços", path: "/servicos" },
  { icon: UserSquare2, label: "Profissionais", path: "/profissionais" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: MessageSquare, label: "Marketing", path: "/marketing" },
  { icon: CreditCard, label: "Mensalidade", path: "/mensalidade" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);

  // Função para alternar item fixado
  const togglePinnedItem = (path: string) => {
    setPinnedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    const isPinned = pinnedItems.includes(item.path);

    return (
      <Tooltip key={item.path}>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              "hover:bg-primary/5 hover:text-primary",
              isActive && "bg-primary/10 text-primary font-medium",
              !isOpen && "justify-center",
              "group relative"
            )}
            onContextMenu={(e) => {
              e.preventDefault();
              togglePinnedItem(item.path);
            }}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-200",
              isActive && "scale-110"
            )} />
            {isOpen && (
              <span className="text-sm font-medium truncate">
                {item.label}
              </span>
            )}
            {isPinned && isOpen && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white dark:bg-neutral-900 border-r dark:border-neutral-800 transition-all duration-300",
          "shadow-sm dark:shadow-none",
          isOpen ? "w-64" : "w-20",
          "transform lg:translate-x-0",
          !isOpen && "hidden lg:block",
          isOpen && "translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b dark:border-neutral-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary" />
            {isOpen && (
              <span className="font-semibold text-neutral dark:text-white animate-fade-in">
                Pulse
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex hover:bg-primary/5 dark:hover:bg-white/5"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <div className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Itens fixados */}
          {pinnedItems.length > 0 && isOpen && (
            <div className="mb-3">
              <div className="px-4 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Fixados
              </div>
              {pinnedItems.map(path => {
                const item = menuItems.find(i => i.path === path);
                if (item) return renderMenuItem(item);
              })}
              <div className="mt-2 border-b dark:border-neutral-800" />
            </div>
          )}

          {/* Menu items unified */}
          <nav className="space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
              "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors",
              !isOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
