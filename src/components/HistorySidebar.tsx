import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, Search, Star, StarOff, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AnalysisHistory } from '../types/phishing';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';

interface HistorySidebarProps {
  history: AnalysisHistory[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: AnalysisHistory) => void;
  onClear?: () => void;
  useSidebarHistory?: boolean;
}

export const HistorySidebar = ({ history, isOpen, onClose, onSelect, onClear, useSidebarHistory = false }: HistorySidebarProps) => {
  const { sidebarHistory, setSidebarHistory } = useAnalytics();
  const displayHistory = useSidebarHistory ? sidebarHistory : history;

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  // `searchInput` is the immediate input value; we debounce updates to `searchQuery`
  const [searchInput, setSearchInput] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'old'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'safe' | 'suspicious' | 'phishing'>('all');
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set());

  const handleClear = () => {
    if (useSidebarHistory) {
      setSidebarHistory([]);
    } else if (onClear) {
      onClear();
    }
  };

  // Filtered history
  const filteredHistory = useMemo(() => {
    let filtered = displayHistory;

    // Time filter
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeFilter === 'recent') {
      filtered = filtered.filter(item => now - item.timestamp <= oneDay);
    } else if (timeFilter === 'old') {
      filtered = filtered.filter(item => now - item.timestamp > oneDay);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const score = item.result.score;
        switch (categoryFilter) {
          case 'safe':
            return score < 30;
          case 'suspicious':
            return score >= 30 && score < 70;
          case 'phishing':
            return score >= 70;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.inputContent.toLowerCase().includes(query) ||
        item.result.emailPreview?.toLowerCase().includes(query) ||
        item.inputType.toLowerCase().includes(query) ||
        item.result.reasons.some(reason => reason.toLowerCase().includes(query))
      );
    }

    // Sort by newest first (default)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    return filtered;
  }, [displayHistory, timeFilter, categoryFilter, searchQuery]);

  // Separate starred and unstarred items
  const starredHistory = filteredHistory.filter(item => starredItems.has(item.id));
  const unstarredHistory = filteredHistory.filter(item => !starredItems.has(item.id));

  // Combine with starred items first
  const sortedHistory = [...starredHistory, ...unstarredHistory];

  const toggleStar = (itemId: string) => {
    setStarredItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 70) return 'text-warning';
    return 'text-danger';
  };

  // Debounce the search input so filtering doesn't run on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 220);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border/50 z-50 shadow-card backdrop-blur-sm"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Analysis History</h2>
                </div>
                <button
                  onClick={onClose}
                  className="x-close-btn x-close-btn-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Debounce search input -> update searchQuery after a short delay */}
              {/* Note: placing effect here ensures component mounted before scheduling */}
              {/* Filters and Search */}
              <div className="p-4 border-b border-border/50 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search history..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex gap-2">
                  <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as 'all' | 'recent' | 'old')}>
                    <SelectTrigger className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Time" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="min-w-[200px]">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="old">Old</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as 'all' | 'safe' | 'suspicious' | 'phishing')}>
                    <SelectTrigger className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <SelectValue placeholder="Category" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="min-w-[200px]">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="safe">Safe</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="phishing">Phishing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              </div>

              <ScrollArea className="flex-1 p-4 overflow-y-scroll">
                {sortedHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {displayHistory.length === 0
                        ? "No analysis history yet"
                        : "No items match your filters"
                      }
                    </p>

                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedHistory.map((item) => (
                      <div key={item.id}>
                        <Card
                          className="p-3 cursor-pointer hover:bg-accent/10 transition-colors group border-border/30 hover:border-primary/20 rounded-r-xl rounded-l-sm"
                          onClick={() => {
                            onSelect(item);
                            onClose();
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-2xl font-bold ${getScoreColor(item.result.score)}`}>
                                  {item.result.score}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.result.score < 30 ? 'Safe' : item.result.score < 70 ? 'Suspicious' : 'Phishing'}
                                </span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                                  {item.inputType}
                                </span>
                              </div>

                              {/* Content Analysis */}
                              {(item.inputType === 'url' || item.inputType === 'ip' || item.inputType === 'domain') && (
                                <div className="mb-2 text-xs">
                                  <div className="font-medium text-muted-foreground mb-1 capitalize">
                                    {item.inputType} Content Analysis
                                  </div>
                                  <div className="text-muted-foreground pl-2 border-l border-muted-foreground/20">
                                    {item.inputType === 'url' && item.result.metadata?.urlAnalysis ? (
                                      <div className="space-y-1">
                                        {item.result.metadata.urlAnalysis.map((analysis, idx) => (
                                          <div key={idx}>
                                            <div className="font-medium">{analysis.verdict}</div>
                                            <div className="text-xs mt-1">{analysis.threatReasoning}</div>
                                            <div className="text-xs mt-1 font-medium">Recommendation:</div>
                                            <div className="text-xs">{analysis.recommendation}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : item.inputType === 'ip' ? (
                                      <div className="space-y-1">
                                        <div className="font-medium">
                                          {item.result.score < 30 ? '✅ Safe IP Address' :
                                            item.result.score < 70 ? '⚠️ Suspicious IP Address' :
                                              '🚨 Malicious IP Address'}
                                        </div>
                                        <div className="text-xs mt-1">
                                          {item.result.score < 30 ?
                                            'This IP address appears safe with no suspicious patterns detected. It follows standard IP address conventions and shows no indicators of malicious activity.' :
                                            item.result.score < 70 ?
                                              'This IP address shows some suspicious characteristics that warrant caution. While not definitively malicious, it exhibits patterns commonly associated with potential security risks.' :
                                              'This IP address exhibits multiple high-risk indicators suggesting potential malicious activity. It may be associated with botnets, command-and-control servers, or other cyber threats.'}
                                        </div>
                                        <div className="text-xs mt-1 font-medium">Recommendation:</div>
                                        <div className="text-xs">
                                          {item.result.score < 30 ?
                                            'This IP address appears safe, but always verify the source and exercise normal security precautions.' :
                                            item.result.score < 70 ?
                                              'Exercise caution when interacting with this IP address. Verify its legitimacy through official channels before proceeding.' :
                                              'Avoid any interaction with this IP address. It may be associated with malicious activities and should be blocked.'}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <div className="font-medium">
                                          {item.result.score < 30 ? '✅ Safe Domain' :
                                            item.result.score < 70 ? '⚠️ Suspicious Domain' :
                                              '🚨 Malicious Domain'}
                                        </div>
                                        <div className="text-xs mt-1">
                                          {item.result.score < 30 ?
                                            'This domain name appears safe with no suspicious patterns detected. It follows standard domain naming conventions and shows no indicators of malicious activity.' :
                                            item.result.score < 70 ?
                                              'This domain name shows some suspicious characteristics that warrant caution. While not definitively malicious, it exhibits patterns commonly associated with potential security risks.' :
                                              'This domain name exhibits multiple high-risk indicators suggesting potential malicious activity. It may be associated with phishing campaigns, malware distribution, or other cyber threats.'}
                                        </div>
                                        <div className="text-xs mt-1 font-medium">Recommendation:</div>
                                        <div className="text-xs">
                                          {item.result.score < 30 ?
                                            'This domain appears safe, but always verify the website\'s legitimacy before entering sensitive information.' :
                                            item.result.score < 70 ?
                                              'Exercise caution with this domain. Verify its legitimacy through official channels before proceeding.' :
                                              'Do not visit this domain. It may be associated with phishing or malicious activities and should be avoided.'}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Detection Reasons */}
                              {item.result.categorizedReasons && (
                                <div className="mb-2 space-y-1">
                                  {Object.entries(item.result.categorizedReasons).map(([category, reasons]) =>
                                    reasons.length > 0 && (
                                      <div key={category} className="text-xs">
                                        <div className="font-medium text-muted-foreground capitalize mb-1">
                                          {category} ({reasons.length})
                                        </div>
                                        <div className="space-y-1">
                                          {reasons.map((reason, idx) => (
                                            <div key={idx} className="text-muted-foreground pl-2 border-l border-muted-foreground/20">
                                              {idx + 1}. {reason}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground">
                                {item.inputType === 'email' ? item.result.emailPreview :
                                  item.inputType === 'file' ? `File: ${item.inputContent}` :
                                    item.inputType === 'url' ? `URL: ${item.inputContent}` :
                                      item.inputType === 'ip' ? `IP: ${item.inputContent}` :
                                        `Domain: ${item.inputContent}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(item.id);
                              }}
                            >
                              {starredItems.has(item.id) ? (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              ) : (
                                <StarOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {displayHistory.length > 0 && onClear && (
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {sortedHistory.length} of {displayHistory.length} items
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleClear}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear History
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
