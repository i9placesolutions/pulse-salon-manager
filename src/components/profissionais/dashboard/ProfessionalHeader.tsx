import { Link, useNavigate } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ProfessionalHeader() {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b sticky top-0 z-30 w-full">
      <div className="h-full px-6 flex items-center justify-between gap-4 max-w-full mx-auto">
        <div>
          <h1 className="font-semibold text-neutral">Barbearia Silva</h1>
          <p className="text-xs text-muted-foreground">Área do Profissional</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-neutral hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-neutral hover:text-primary">
                <Avatar className="h-8 w-8 border-2 border-primary/10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/5 text-primary">JS</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">João Silva</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profissional-profile')} className="cursor-pointer text-neutral hover:text-primary hover:bg-primary/5">
                <User className="w-4 h-4 mr-2" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/')} className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
