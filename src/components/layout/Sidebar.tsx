
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Agendamentos", path: "/appointments" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: ShoppingCart, label: "PDV", path: "/pdv" },
  { icon: BarChart, label: "Relatórios", path: "/relatorios" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white border-r transition-all duration-300",
          isOpen ? "w-64" : "w-20",
          "transform lg:translate-x-0",
          !isOpen && "hidden lg:block",
          isOpen && "translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary" />
            {isOpen && <span className="font-semibold text-neutral">Pulse</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
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
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-soft hover:bg-secondary-soft transition-colors",
                location.pathname === item.path && "bg-primary/10 text-primary",
                !isOpen && "justify-center"
              )}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-soft hover:bg-secondary-soft transition-colors",
              !isOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
