
import { Link, useLocation } from "react-router-dom";
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
  Moon,
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
  category?: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", category: "principal" },
  { icon: Calendar, label: "Agendamentos", path: "/appointments", category: "principal" },
  { icon: Users, label: "Clientes", path: "/clientes", category: "principal" },
  { icon: Scissors, label: "Serviços", path: "/servicos", category: "gestao" },
  { icon: UserSquare2, label: "Profissionais", path: "/profissionais", category: "gestao" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro", category: "gestao" },
  { icon: Package, label: "Estoque", path: "/estoque", category: "operacional" },
  { icon: ShoppingCart, label: "PDV", path: "/pdv", category: "operacional" },
  { icon: BarChart, label: "Relatórios", path: "/relatorios", category: "analise" },
  { icon: MessageSquare, label: "Marketing", path: "/marketing", category: "analise" },
  { icon: CreditCard, label: "Mensalidade", path: "/mensalidade", category: "configuracoes" },
  { icon: Settings, label: "Configurações", path: "/configuracoes", category: "configuracoes" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);

  // Agrupar itens do menu por categoria
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || "outros";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
              "flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-soft transition-all duration-200",
              "hover:bg-primary/5 hover:text-primary",
              isActive && "bg-primary/10 text-primary",
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
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full" />
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
        <div className="p-2 space-y-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Itens fixados */}
          {pinnedItems.length > 0 && isOpen && (
            <div className="mb-4">
              <div className="px-3 py-1 text-xs font-medium text-neutral-soft dark:text-neutral-400">
                Fixados
              </div>
              {pinnedItems.map(path => {
                const item = menuItems.find(i => i.path === path);
                if (item) return renderMenuItem(item);
              })}
              <div className="mt-2 border-b dark:border-neutral-800" />
            </div>
          )}

          {/* Menu categorizado */}
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category}>
              {isOpen && (
                <div className="px-3 py-1 text-xs font-medium text-neutral-soft dark:text-neutral-400 capitalize">
                  {category}
                </div>
              )}
              <nav className="space-y-1">
                {items.map(renderMenuItem)}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full flex items-center justify-center hover:bg-primary/5 dark:hover:bg-white/5"
            >
              <Moon className="w-5 h-5" />
            </Button>
            <button
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
                "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors",
                !isOpen && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5" />
              {isOpen && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
