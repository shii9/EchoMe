import { RiskDistributionChart } from '../components/RiskDistributionChart';

import { useAnalytics } from '../contexts/AnalyticsContext';
import { Navbar } from '../components/Navbar';
import { HistorySidebar } from '../components/HistorySidebar';
import { QuizMode } from '../components/QuizMode';
import { MessageSquare, Download, FileJson, FileText, TrendingUp, Shield, AlertTriangle, Award, Calendar, Target, Brain } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { exportHistoryToCSV } from '../utils/csvExport';
import { exportHistoryToJSON } from '../utils/jsonExport';
import { exportHistoryToPDF } from '../utils/pdfExport';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import APIKeysModal from '../components/APIKeysModal';
import { AIAssistant } from '../components/AIAssistant';
import { MobileMenu } from '../components/MobileMenu';

const Stats = () => {
  const { stats, history, setHistory, sidebarHistory, setSidebarHistory, historyOpen, setHistoryOpen, quizOpen, setQuizOpen } = useAnalytics();
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuizAchievement = (achievement: any) => {
    // Handle quiz achievement - could be implemented later
  };

  const handleExportCSV = () => {
    exportHistoryToCSV(history);
  };

  const handleExportJSON = () => {
    exportHistoryToJSON(history);
  };

  const handleExportPDF = () => {
    exportHistoryToPDF(history);
  };

  // Calculate additional stats
  const todayAnalyses = history.filter(item =>
    new Date(item.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const weekAnalyses = history.filter(item =>
    Date.now() - item.timestamp <= 7 * 24 * 60 * 60 * 1000
  ).length;

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, item) => sum + item.result.score, 0) / history.length)
    : 0;

  const successRate = history.length > 0
    ? Math.round((history.filter(item => item.result.score < 30).length / history.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onHistoryClick={() => setHistoryOpen(!historyOpen)} onQuizClick={() => setQuizOpen(!quizOpen)} onMenuClick={() => setMobileMenuOpen(true)} />

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onHistoryClick={() => setHistoryOpen(!historyOpen)}
        onQuizClick={() => setQuizOpen(!quizOpen)}
        onAIClick={() => setShowAI(!showAI)}
        onExportClick={handleExportCSV}
        onAPIKeysClick={() => setApiModalOpen(true)}
        historyLength={history.length}
      />

      {/* Desktop Quick Actions - Hidden on Mobile */}
      <div className="hidden md:flex fixed top-20 right-4 flex-col gap-2 z-30 no-print">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAI(true)}
              className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all animate-glow-pulse shadow-sm hover:shadow-md"
            >
              <div className="relative w-5 h-5 rounded-md bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-sm ring-1 ring-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]"></div>
                <Brain className="w-3 h-3 relative z-10" />
              </div>
              <span className="hidden">Nio AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Assistant</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={history.length === 0}
              className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
            <DropdownMenuItem
              onClick={handleExportCSV}
              disabled={history.length === 0}
              className="cursor-pointer hover:bg-primary/10"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportJSON}
              disabled={history.length === 0}
              className="cursor-pointer hover:bg-primary/10"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportPDF}
              disabled={history.length === 0}
              className="cursor-pointer hover:bg-primary/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApiModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all shadow-sm hover:shadow-md"
            >
              <FileJson className="w-4 h-4" />
              <span className="hidden">API Keys</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Manage API keys</TooltipContent>
        </Tooltip>
      </div>

      <div className="pt-20 pb-12 px-4">
        <div className="w-full max-w-5xl mx-auto md:translate-x-px">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-border/50">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse"></div>
              <div className="relative p-8 md:p-12">
                <div className="max-w-4xl mx-auto text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Security Statistics</span>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  >
                    Analyze Your Security Data
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                  >
                    Dive deep into your phishing detection statistics to understand patterns, track performance,
                    and gain valuable insights into your cybersecurity habits and effectiveness.
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Overview */}
            <Card className="p-8 bg-gradient-card border-border/50 shadow-card backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                Your Security Overview
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                  <div className="p-3 rounded-lg bg-background/40 inline-flex mb-3">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalAnalyses}</div>
                  <div className="text-xs text-muted-foreground font-medium">Total Scans</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                  <div className="p-3 rounded-lg bg-background/40 inline-flex mb-3">
                    <AlertTriangle className="w-8 h-8 text-danger" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.phishingDetected}</div>
                  <div className="text-xs text-muted-foreground font-medium">Threats Detected</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                  <div className="p-3 rounded-lg bg-background/40 inline-flex mb-3">
                    <Shield className="w-8 h-8 text-success" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.safeEmails}</div>
                  <div className="text-xs text-muted-foreground font-medium">Safe Analyses</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                  <div className="p-3 rounded-lg bg-background/40 inline-flex mb-3">
                    <Award className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.accuracy}%</div>
                  <div className="text-xs text-muted-foreground font-medium">Accuracy</div>
                </div>
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">{todayAnalyses}</div>
                  <div className="text-xs text-muted-foreground">Scans Today</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <Calendar className="w-5 h-5 text-accent mx-auto mb-1" />
                  <div className="text-lg font-bold">{weekAnalyses}</div>
                  <div className="text-xs text-muted-foreground">Scans This Week</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <Target className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{avgScore}</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{successRate}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </Card>

            <RiskDistributionChart history={history} />
          </motion.div>
        </div>
      </div>

      <APIKeysModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />

      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      <AnimatePresence>
        {quizOpen && (
          <QuizMode
            onClose={() => setQuizOpen(false)}
            onAchievement={handleQuizAchievement}
          />
        )}
      </AnimatePresence>

      <HistorySidebar
        history={history}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={(item) => {
          // Stay on current page and just load the selected item
          // Store the selected item in sessionStorage to be picked up by Index page
          sessionStorage.setItem('selectedHistoryItem', JSON.stringify(item));
          // Navigate to home page and load the selected item
          window.location.href = import.meta.env.BASE_URL;
        }}
        onClear={() => {
          // Clear sidebar history only - this doesn't affect stats data
          setHistoryOpen(false);
        }}
        useSidebarHistory={true}
      />


    </div>
  );
};

export default Stats;
