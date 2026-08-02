import { Shield, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="bg-background/80 backdrop-blur-lg border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-6 sm:pt-5 sm:pb-7">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <div className="relative p-1 rounded-lg bg-primary/10">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm truncate">EchoMe</span>
          </div>

          <p className="text-[11px] text-muted-foreground/80 text-center flex-1">
            Advanced AI-powered phishing analysis · Built for cybersecurity &amp; safety
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-muted-foreground/80 mr-1">Connect</span>
            <a href="https://github.com/shii9" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 transition-colors">
                <Github className="w-3.5 h-3.5" />
              </Button>
            </a>
            <a href="mailto:saadahsan.0754@gmail.com">
              <Button variant="outline" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex sm:hidden items-center justify-between w-full gap-1">
          {/* Brand */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative p-1 rounded-lg bg-primary/10">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-[11px] truncate">EchoMe</span>
          </div>

          {/* Tagline Container - Both lines strictly share the same center alignment */}
          <div className="flex flex-col items-center justify-center flex-1 px-1">
            <p className="text-[9px] xs:text-[10px] text-muted-foreground/90 text-center leading-tight">
              Advanced AI-powered phishing analysis
            </p>
            <p className="text-[9px] xs:text-[10px] text-muted-foreground/70 text-center leading-tight mt-0.5">
              Built for cybersecurity &amp; safety
            </p>
          </div>

          {/* Connect */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a href="https://github.com/shii9" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10 transition-colors">
                <Github className="w-3.5 h-3.5" />
              </Button>
            </a>
            <a href="mailto:saadahsan.0754@gmail.com">
              <Button variant="outline" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10 transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
