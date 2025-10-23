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
    <header className="border-b border-border/50 bg-background/98 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-5 max-w-[1400px]">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-gradient-primary rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <Microscope className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Precision Cavity Analyzer
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Advanced STL Superimposition & Deviation Analysis
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                        isActive('/') ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/profile">
                    <NavigationMenuLink 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                        isActive('/profile') ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/settings">
                    <NavigationMenuLink 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                        isActive('/settings') ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/downloads">
                    <NavigationMenuLink 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                        isActive('/downloads') ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Downloads
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/help">
                    <NavigationMenuLink 
                      className={`group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
                        isActive('/help') ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary font-semibold px-3 py-1">
              v2.0.0 Pro
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-accent rounded-lg"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};