
import { Link } from "react-router-dom";
import { Menu, Bell, Plus, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Array of motivational quotes
const motivationalQuotes = [
  "Cada cliente é uma nova oportunidade",
  "Pequenos progressos levam a grandes conquistas",
  "Hoje é dia de fazer acontecer",
  "Sua dedicação faz a diferença",
  "Sorria, você está transformando vidas",
  "Excelência em cada atendimento",
  "Sua energia positiva contagia",
];

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({
  onMenuClick
}: NavbarProps) => {
  // Get current day of the year to select a quote
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const todaysQuote = motivationalQuotes[dayOfYear % motivationalQuotes.length];

  return <header className="h-16 bg-white border-b sticky top-0 z-30">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-neutral">Agendamentos</h1>
            <p className="text-xs text-muted-foreground animate-pulse-soft">{todaysQuote}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden md:inline">João Silva</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
};
