import { useState, useEffect } from 'react';
import { Shield, TrendingUp, History, MessageSquare, Download, FileJson, FileText, Award, Target, Calendar, RefreshCw, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelfAssessmentQuestionnaire } from '@/components/SelfAssessmentQuestionnaire';
import { AssessmentResult } from '@/utils/scoringEngine';
import { Navbar } from '@/components/Navbar';
import { HistorySidebar } from '@/components/HistorySidebar';
import { QuizMode } from '@/components/QuizMode';

import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportHistoryToCSV } from '@/utils/csvExport';
import { exportHistoryToJSON } from '@/utils/jsonExport';
import { exportHistoryToPDF } from '@/utils/pdfExport';
import { motion, AnimatePresence } from 'framer-motion';
import APIKeysModal from '@/components/APIKeysModal';
import { AIAssistant } from '@/components/AIAssistant';
import { MobileMenu } from '@/components/MobileMenu';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Assessment = () => {
  const { history, setHistory, sidebarHistory, setSidebarHistory, historyOpen, setHistoryOpen, quizOpen, setQuizOpen } = useAnalytics();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load assessment history on component mount
  useEffect(() => {
    const loadAssessmentHistory = (): void => {
      const history = localStorage.getItem('assessment-history');
      if (history) {
        try {
          const parsed = JSON.parse(history).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setAssessmentHistory(parsed);
        } catch (error) {
          console.error('Error loading assessment history:', error);
        }
      }
    };

    loadAssessmentHistory();

    // Listen for storage changes to update assessment history instantly
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === 'assessment-history') {
        loadAssessmentHistory();
      }
    };

    // Listen for custom event when assessment is completed
    const handleAssessmentComplete = (): void => {
      loadAssessmentHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('assessmentComplete', handleAssessmentComplete);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('assessmentComplete', handleAssessmentComplete);
    };
  }, []);

  const latestAssessment = assessmentHistory.length > 0 ? assessmentHistory[assessmentHistory.length - 1] : null;

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
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Security Assessment</span>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  >
                    Evaluate Your Digital Security
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                  >
                    Take our comprehensive security assessment to identify vulnerabilities in your digital habits
                    and receive personalized recommendations to strengthen your cybersecurity posture.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <Button
                      onClick={() => setShowQuestionnaire(true)}
                      size="lg"
                      className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Start Assessment
                    </Button>

                  </motion.div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto">
              {/* Assessment Cards Grid - Full Width for Uniform Sizing */}
              <div className="grid grid-cols-1 gap-6 mb-8">
                {/* Latest Results */}
                <Card className="p-6 border-border/50 shadow-card backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Your Latest Assessment</h3>
                  </div>

                  {latestAssessment ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div
                            className="text-3xl font-bold mb-1"
                            style={{ color: latestAssessment.category.color }}
                          >
                            {latestAssessment.normalizedScore}
                          </div>
                          <div className="text-sm text-muted-foreground">Risk Score</div>
                        </div>
                        <div className="text-center">
                          <Badge
                            className="text-lg px-3 py-1"
                            style={{
                              backgroundColor: latestAssessment.category.color + '20',
                              color: latestAssessment.category.color,
                              borderColor: latestAssessment.category.color
                            }}
                          >
                            {latestAssessment.category.name}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">Risk Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {latestAssessment.timestamp.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Last Assessment</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Key Recommendations:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {latestAssessment.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risk Score Graph */}
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Risk Score Visualization</h4>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[{ name: 'Risk Score', value: latestAssessment.normalizedScore }]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                              />
                              <YAxis
                                domain={[0, 100]}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                              />
                              <RechartsTooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div style={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '6px',
                                        padding: '8px'
                                      }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                                          {`Risk Score: ${payload[0].value}/100`}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                                          {latestAssessment.category.name}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar
                                dataKey="value"
                                fill={latestAssessment.category.color}
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => setShowQuestionnaire(true)}
                          variant="outline"
                          size="sm"
                          className="gap-2 transition-all shadow-sm hover:shadow-md border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-foreground"
                        >
                          <RefreshCw className="w-4 h-4 text-primary" />
                          Retake Assessment
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No assessment completed yet</p>
                      <Button onClick={() => setShowQuestionnaire(true)}>
                        Take Your First Assessment
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Progress Chart and Assessment History Combined */}
                {assessmentHistory.length > 0 && (
                  <Card className="p-6 mb-8 border-border/50 shadow-card backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">Risk Score Progress & History</h3>
                    </div>

                    {/* Progress Chart */}
                    <div className="mb-8">
                      <h4 className="font-semibold mb-4">Risk Score Progress</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={assessmentHistory.slice(-10).map((assessment, index) => ({
                              date: assessment.timestamp.toLocaleDateString(),
                              riskScore: assessment.normalizedScore,
                              rawScore: assessment.rawScore,
                              category: assessment.category.name
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                              domain={[0, 100]}
                              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
                            />
                            <RechartsTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div style={{
                                      backgroundColor: 'hsl(var(--card))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '6px',
                                      padding: '8px'
                                    }}>
                                      <p style={{ margin: 0, fontWeight: 'bold' }}>{`Date: ${label}`}</p>
                                      <p style={{ margin: 0, color: 'hsl(var(--primary))' }}>
                                        {`Risk Score: ${data.riskScore}/100`}
                                      </p>
                                      <p style={{ margin: 0, fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                                        {`Category: ${data.category}`}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="riskScore"
                              stroke={latestAssessment ? latestAssessment.category.color : 'hsl(var(--primary))'}
                              strokeWidth={3}
                              dot={{ fill: latestAssessment ? latestAssessment.category.color : 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: latestAssessment ? latestAssessment.category.color : 'hsl(var(--primary))', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground text-center">
                        Your risk score progression over time (higher scores indicate higher risk)
                      </div>
                    </div>

                    {/* Assessment History */}
                    <div>
                      <h4 className="font-semibold mb-4">Assessment History</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assessmentHistory.slice(-6).reverse().map((assessment, index) => (
                          <div key={index} className="p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ backgroundColor: assessment.category.color + '20' }}
                              >
                                {assessment.normalizedScore}
                              </div>
                              <div>
                                <div className="font-medium">{assessment.category.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {assessment.timestamp.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs w-fit">
                              Raw: {assessment.rawScore}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Start */}
                <Card className="p-6 border-border/50 shadow-card backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Quick Start Guide</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Ready to assess your security? Answer 15 questions about your security habits to get a comprehensive risk score and actionable recommendations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-primary">1</span>
                        </div>
                        <h4 className="font-semibold mb-2">Take the Quiz</h4>
                        <p className="text-sm text-muted-foreground">Answer 15 targeted questions about your digital security practices</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-primary">2</span>
                        </div>
                        <h4 className="font-semibold mb-2">Get Your Score</h4>
                        <p className="text-sm text-muted-foreground">Receive a detailed risk assessment from 0-100</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-primary">3</span>
                        </div>
                        <h4 className="font-semibold mb-2">Follow Recommendations</h4>
                        <p className="text-sm text-muted-foreground">Implement personalized security improvements</p>
                      </div>
                    </div>

                  </div>
                </Card>
              </div>
            </div>
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

      {/* Questionnaire Modal */ }
  {
    showQuestionnaire && (
      <SelfAssessmentQuestionnaire onClose={() => setShowQuestionnaire(false)} />
    )
  }
    </div >
  );
};

export default Assessment;

