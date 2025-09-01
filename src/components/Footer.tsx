import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  Mail, 
  Globe, 
  Shield, 
  Book,
  Heart
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface/50 mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Precision Cavity Analyzer</h4>
            <p className="text-sm text-muted-foreground">
              Advanced STL superimposition and deviation analysis for medical and industrial applications.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-destructive" />
              Made with precision
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                <Book className="w-4 h-4 mr-2" />
                Documentation
              </Button>
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                <Globe className="w-4 h-4 mr-2" />
                API Reference
              </Button>
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Support</h4>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="ghost" size="sm" className="justify-start p-0 h-auto">
                <Github className="w-4 h-4 mr-2" />
                GitHub Issues
              </Button>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Technical</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>STL Format Support</div>
              <div>ICP Registration</div>
              <div>Point Cloud Analysis</div>
              <div>Real-time Visualization</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Precision Cavity Analyzer. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Version 2.0.0 Pro</span>
              <span>•</span>
              <span>Build 2024.01</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};