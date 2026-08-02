import { BarChart3, History, Brain, Menu, Home, TrendingUp, UserCheck, BookOpen, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onHistoryClick: () => void;
  onQuizClick: () => void;
  onMenuClick: () => void;
}

export const Navbar = ({ onHistoryClick, onQuizClick, onMenuClick }: NavbarProps) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isStats = location.pathname === '/stats';
  const isTrends = location.pathname === '/trends';
  const isAssessment = location.pathname === '/assessment';
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-transparent border-transparent shadow-none rounded-none px-1 py-1 lg:bg-card/90 lg:backdrop-blur-xl lg:border lg:border-border/60 lg:shadow-2xl lg:rounded-full lg:px-3 lg:py-2 flex items-center justify-between gap-3 transition-all w-full max-w-5xl">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2 px-2">
            <img
              src={`${import.meta.env.BASE_URL}echome-logo.svg`}
              alt="EchoMe shield"
              className="w-8 h-8 rounded-full shadow-sm shadow-primary/30"
            />
            <div className="hidden sm:flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                EchoMe
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isHome
                        ? 'bg-gradient-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Detector</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Phishing threat analyzer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/stats">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isStats
                        ? 'bg-gradient-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Statistics</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>View analysis statistics</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/trends">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isTrends
                        ? 'bg-gradient-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Trends</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>View threat trends</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/assessment">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isAssessment
                        ? 'bg-gradient-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assessment</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Security self-assessment</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/blog">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isBlog
                        ? 'bg-gradient-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Blog</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Security guides & articles</TooltipContent>
            </Tooltip>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onHistoryClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-sm"
            >
              <History className="w-4 h-4 text-muted-foreground" />
              <span>History</span>
            </button>

            <button
              onClick={onQuizClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Quiz</span>
            </button>
            <ThemeToggle className="ml-1" />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full w-10 h-10"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </nav>
      </div>

    </>
  );
};
