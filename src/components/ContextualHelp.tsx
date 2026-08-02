import { motion } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Card } from './ui/card';

interface ContextualHelpProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ContextualHelp = ({ title, content, position = 'right' }: ContextualHelpProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`absolute ${positionClasses[position]} z-50 w-72`}
        >
          <Card className="p-4 shadow-xl border-primary/20">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="x-close-btn x-close-btn-sm"
                aria-label="Close help"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {content}
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
