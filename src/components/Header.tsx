import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Link, useLocation } from 'react-router-dom';
import { 
  Microscope, 
  Settings, 
  HelpCircle, 
  User,
  Sun,
  Moon,
  Home,
  Download
} from 'lucide-react';
import { useTheme } from 'next-themes';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur-lg shadow-sm supports-[backdrop-filter]:bg-card/90">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300">
          <div className="relative">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <Microscope className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Precision Cavity Analyzer
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-wide font-medium">
              Advanced STL Superimposition & Deviation Analysis
            </p>
          </div>
        </div>

        
        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hover:bg-accent transition-colors">
              <User className="w-4 h-4" />
              Profile
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hover:bg-accent transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <Link to="/downloads">
            <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hover:bg-accent transition-colors">
              <Download className="w-4 h-4" />
              Downloads
            </Button>
          </Link>
          <Link to="/help">
            <Button variant="ghost" size="sm" className="gap-2 text-sm font-medium hover:bg-accent transition-colors">
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
          </Link>
          
          <div className="ml-3 flex items-center gap-2">
            <Badge variant="secondary" className="px-2.5 py-1 font-semibold text-[10px] shadow-sm">
              v2.0.0 Pro
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-accent transition-all duration-300"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};