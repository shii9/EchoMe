import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, History, MessageSquare, FileText, TrendingUp, Home, BookOpen, Zap, FileJson, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryClick: () => void;
  onQuizClick: () => void;
  onAIClick: () => void;
  onExportClick: () => void;
  onAPIKeysClick: () => void;
  historyLength: number;
}

export const MobileMenu = ({
  isOpen,
  onClose,
  onHistoryClick,
  onQuizClick,
  onAIClick,
  onExportClick,
  onAPIKeysClick,
  historyLength
}: MobileMenuProps) => {
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: 'Detector', to: '/' },
    { icon: BarChart3, label: 'Statistics', to: '/stats' },
    { icon: TrendingUp, label: 'Trends', to: '/trends' },
    { icon: UserCheck, label: 'Assessment', to: '/assessment' },
    { icon: BookOpen, label: 'Blog', to: '/blog' },
  ];

  const actionItems = [
    { icon: History, label: 'History', onClick: onHistoryClick },
    { icon: Zap, label: 'Quiz Mode', onClick: onQuizClick },
    { icon: MessageSquare, label: 'AI Assistant', onClick: onAIClick },
    { icon: FileText, label: 'Export CSV', onClick: onExportClick, disabled: historyLength === 0 },
    { icon: FileJson, label: 'API Keys', onClick: onAPIKeysClick },
  ];

  const handleItemClick = (onClick: () => void) => {
    onClick();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-card border-l border-border z-50 md:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <ThemeToggle />
                </div>
                <button
                  onClick={onClose}
                  className="x-close-btn x-close-btn-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4 px-2">
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground px-3 mb-2">Navigation</p>
                    {navigationItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link to={item.to} onClick={onClose}>
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              className={`w-full justify-start gap-3 h-12 ${isActive ? 'shadow-lg shadow-primary/50 animate-glow' : ''
                                }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </Button>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Action Items */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground px-3 mb-2">Actions</p>
                    {actionItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navigationItems.length + index) * 0.05 }}
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 h-12 ${'admin' in item && item.admin ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : ''}`}
                            onClick={() => handleItemClick(item.onClick)}
                            disabled={'disabled' in item ? item.disabled : false}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
