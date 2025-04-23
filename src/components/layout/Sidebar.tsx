import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Package,
  Store,
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
  User,
  ShoppingBag,
  Building,
  FileText,
  PieChart,
  PackageOpen,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

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
  { icon: Scissors, label: "Serviços", path: "/servicos", category: "principal" },
  { icon: UserSquare2, label: "Profissionais", path: "/profissionais", category: "principal" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro", category: "principal" },
  { icon: Package, label: "Estoque", path: "/estoque", category: "principal" },
  { icon: Store, label: "PDV", path: "/pdv", category: "principal" },
  { icon: PieChart, label: "Relatórios", path: "/relatorios", category: "principal" },
  { icon: BarChart, label: "Marketing", path: "/marketing", category: "principal" },
  { icon: BrainCircuit, label: "IA WhatsApp", path: "/ia", category: "principal" },
  { icon: Building, label: "Estabelecimento", path: "/establishment-profile", category: "configuracoes" },
  { icon: User, label: "Usuários", path: "/usuarios", category: "configuracoes" },
  { icon: CreditCard, label: "Mensalidade", path: "/mensalidade", category: "configuracoes" },
];

const menuItemColors = {
  // Cores para cada item do menu
  "/dashboard": { color: "text-blue-600", bg: "bg-blue-100", hover: "hover:bg-blue-100" },
  "/appointments": { color: "text-purple-600", bg: "bg-purple-100", hover: "hover:bg-purple-100" },
  "/clientes": { color: "text-emerald-600", bg: "bg-emerald-100", hover: "hover:bg-emerald-100" },
  "/servicos": { color: "text-amber-600", bg: "bg-amber-100", hover: "hover:bg-amber-100" },
  "/profissionais": { color: "text-emerald-600", bg: "bg-emerald-100", hover: "hover:bg-emerald-100" },
  "/financeiro": { color: "text-green-600", bg: "bg-green-100", hover: "hover:bg-green-100" },
  "/estoque": { color: "text-cyan-600", bg: "bg-cyan-100", hover: "hover:bg-cyan-100" },
  "/pdv": { color: "text-cyan-600", bg: "bg-cyan-100", hover: "hover:bg-cyan-100" },
  "/relatorios": { color: "text-amber-600", bg: "bg-amber-100", hover: "hover:bg-amber-100" },
  "/marketing": { color: "text-amber-600", bg: "bg-amber-100", hover: "hover:bg-amber-100" },
  "/ia": { color: "text-purple-600", bg: "bg-purple-100", hover: "hover:bg-purple-100" },
  "/establishment-profile": { color: "text-violet-600", bg: "bg-violet-100", hover: "hover:bg-violet-100" },
  "/usuarios": { color: "text-indigo-600", bg: "bg-indigo-100", hover: "hover:bg-indigo-100" },
  "/mensalidade": { color: "text-orange-600", bg: "bg-orange-100", hover: "hover:bg-orange-100" },
};

// Cores para categorias
const categoryColors = {
  "principal": "text-blue-600 dark:text-blue-400",
  "analise": "text-purple-600 dark:text-purple-400",
  "configuracoes": "text-orange-600 dark:text-orange-400",
  "outros": "text-gray-600 dark:text-gray-400"
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Função para realizar logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
        variant: "success"
      });
      
      // Redirecionar para a página inicial
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar sair. Tente novamente.",
        variant: "destructive"
      });
    }
  };

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
    const itemColors = menuItemColors[item.path];

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-soft transition-all duration-200",
          itemColors.hover,
          "hover:text-neutral-900 dark:hover:text-white",
          isActive ? `${itemColors.bg} ${itemColors.color} font-medium dark:bg-opacity-20` : "",
          !isOpen && "justify-center",
          "group relative"
        )}
        onContextMenu={(e) => {
          e.preventDefault();
          togglePinnedItem(item.path);
        }}
      >
        <div className={cn(
          "flex items-center justify-center w-7 h-7 rounded-md transition-transform duration-200",
          isActive ? itemColors.bg : "bg-transparent",
          isActive && "scale-110"
        )}>
          <item.icon className={cn(
            "w-4 h-4", 
            itemColors.color,
            "transition-all duration-200"
          )} />
        </div>
        {isOpen && (
          <span className={cn(
            "text-sm truncate",
            isActive ? itemColors.color : "text-neutral-600 dark:text-neutral-400"
          )}>
            {item.label}
          </span>
        )}
        {isPinned && isOpen && (
          <div className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
            itemColors.color
          )} />
        )}
      </Link>
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
          "fixed top-0 left-0 z-40 h-full border-r transition-all duration-300",
          "bg-gradient-to-b from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-950", 
          "shadow-sm dark:shadow-none",
          isOpen ? "w-64" : "w-20",
          "transform lg:translate-x-0",
          !isOpen && "hidden lg:block",
          isOpen && "translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center justify-between px-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          !isOpen && "flex-col-reverse justify-center gap-4 px-2"
        )}>
          <Link to="/dashboard" className={cn(
            "flex items-center gap-2",
            !isOpen && "justify-center w-full"
          )}>
            {isOpen ? (
              <img 
                src="/LOGO.png" 
                alt="Pulse Logo" 
                className="h-8 object-contain animate-fade-in" 
              />
            ) : (
              <img 
                src="/favicon.ico" 
                alt="Pulse Icon" 
                className="w-8 h-8 animate-fade-in" 
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden lg:flex hover:bg-white/10 text-white",
              isOpen ? "ml-auto mr-0" : "absolute -right-3 top-6 bg-white border hover:bg-gray-50 p-1 h-5 w-5 rounded-full"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-3 w-3 text-blue-600" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <div className="p-2 space-y-2">
          {/* Itens fixados */}
          {pinnedItems.length > 0 && isOpen && (
            <div className="mb-4">
              <div className="px-3 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300 rounded-md mb-1">
                Fixados
              </div>
              {pinnedItems.map(path => {
                const item = menuItems.find(i => i.path === path);
                if (item) return renderMenuItem(item);
              })}
              <div className="mt-1 border-b dark:border-neutral-800" />
            </div>
          )}

          {/* Menu categorizado */}
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category}>
              {isOpen && (
                <div className={cn(
                  "px-3 py-0.5 text-xs font-medium capitalize rounded-md mb-1",
                  category === "principal" ? "bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300" : "",
                  category === "configuracoes" ? "bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900 text-orange-700 dark:text-orange-300" : "",
                  category === "analise" ? "bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-300" : "",
                  category === "outros" ? "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-300" : ""
                )}>
                  {category}
                </div>
              )}
              <nav className="space-y-0.5">
                {items.map(renderMenuItem)}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t bg-gradient-to-t from-gray-100 to-white dark:from-neutral-950 dark:to-neutral-900">
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950 dark:hover:to-pink-950 transition-colors",
                !isOpen && "justify-center"
              )}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-red-100 dark:bg-red-900/30">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              {isOpen && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
