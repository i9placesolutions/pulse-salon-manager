
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  MessageSquare,
  Scissors,
  UserSquare2,
  CreditCard,
  BarChart,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();

  // Define menu items
  const menuItems = [
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

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0" />
          <span className="font-semibold text-neutral-700 dark:text-white">
            Pulse
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link to={item.path}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="size-4" />
          <span className="font-medium">Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
