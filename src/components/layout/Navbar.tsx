import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Plus, User, LogOut, Clock, Sun, Stars, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Get current day of the year to select a quote
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const todaysQuote = motivationalQuotes[dayOfYear % motivationalQuotes.length];

  // Atualizar o relógio a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Detectar scroll para mudar o visual da navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Formatar hora atual
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Formatar data atual
  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Determinar o período do dia para o ícone
  const hour = currentTime.getHours();
  const isDaytime = hour >= 6 && hour < 18;

  return (
    <header 
      className={cn(
        "h-16 sticky top-0 z-30 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b shadow-sm" 
          : "bg-gradient-to-r from-white via-blue-50 to-purple-50 border-b border-blue-100/50"
      )}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-blue-600 hover:bg-blue-50" 
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative">
            <h1 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Barbearia Silva
            </h1>
            <p className="text-xs font-medium text-blue-600/80 animate-pulse-soft flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              {todaysQuote}
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm font-medium">
              <Calendar className="h-4 w-4 text-blue-600 mr-1.5" />
              <span className="text-blue-700">{formattedDate}</span>
              <span className="mx-1.5 text-blue-400">•</span>
              {isDaytime ? (
                <Sun className="h-4 w-4 text-amber-500 mr-1.5" />
              ) : (
                <Stars className="h-4 w-4 text-indigo-500 mr-1.5" />
              )}
              <span className="text-blue-700">{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
          </Button>

          {/* User Profile */}
          <Button 
            variant="ghost" 
            className="gap-2 bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all" 
            onClick={() => navigate('/establishment-profile')}
          >
            <Avatar className="h-8 w-8 ring-2 ring-offset-1 ring-blue-200">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">JS</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">João Silva</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
