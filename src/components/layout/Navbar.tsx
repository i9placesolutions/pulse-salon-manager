
import { Bell, User, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // This would need to be connected to a theme provider to actually toggle dark mode
  };

  return (
    <div className="h-16 border-b border-border bg-background flex items-center px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="relative w-72 max-w-sm hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
