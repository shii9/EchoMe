import { useState, useEffect } from 'react';
import { AnimatePresence } from "framer-motion";
import { Download, FileJson, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from '@/components/Navbar';
import { HistorySidebar } from '@/components/HistorySidebar';
import { QuizMode } from '@/components/QuizMode';

import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import APIKeysModal from '@/components/APIKeysModal';
import { AIAssistant } from '@/components/AIAssistant';
import { exportHistoryToCSV } from '@/utils/csvExport';
import { exportHistoryToJSON } from '@/utils/jsonExport';
import { exportHistoryToPDF } from '@/utils/pdfExport';
import { getPosts, getCategories, BlogPost as BlogPostType, SortOption } from '@/utils/blogData';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogEmptyState } from '@/components/blog/BlogEmptyState';

import { MobileMenu } from '@/components/MobileMenu';

const Blog = () => {
    const { history, historyOpen, setHistoryOpen, quizOpen, setQuizOpen } = useAnalytics();
    const [apiModalOpen, setApiModalOpen] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [posts, setPosts] = useState<BlogPostType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const loadPosts = () => {
        const allPosts = getPosts();
        setPosts(allPosts);
        const allCategories = getCategories();
        setCategories(['All', ...allCategories]);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleQuizAchievement = (achievement: any) => {
        // Handle quiz achievement
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

    const filteredPosts = posts
        .filter(post => selectedCategory === 'All' || post.category === selectedCategory)
        .filter(post =>
            searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

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

            {/* Desktop Quick Actions */}
            <div className="hidden lg:flex fixed top-20 right-4 flex-col gap-2 z-30 no-print">
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
                        <DropdownMenuItem onClick={handleExportCSV} disabled={history.length === 0} className="cursor-pointer hover:bg-primary/10">
                            <FileJson className="w-4 h-4 mr-2" />
                            Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportJSON} disabled={history.length === 0} className="cursor-pointer hover:bg-primary/10">
                            <FileJson className="w-4 h-4 mr-2" />
                            Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF} disabled={history.length === 0} className="cursor-pointer hover:bg-primary/10">
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

                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        <BlogHeader />

                        <BlogFilters
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            categories={categories}
                            totalPosts={filteredPosts.length}
                        />



                        {/* All Articles Section */}
                        <div className="blog-articles-section space-y-4 scroll-mt-20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {selectedCategory === 'All' ? 'All Articles' : `${selectedCategory} Articles`}
                                    </h2>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} found
                                    </p>
                                </div>
                            </div>

                            {/* Posts Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPosts.map((post, index) => (
                                    <BlogPostCard
                                        key={post.id}
                                        post={post}
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* Empty State */}
                            {filteredPosts.length === 0 && (
                                <BlogEmptyState
                                    searchQuery={searchQuery}
                                    onClearSearch={() => setSearchQuery('')}
                                />
                            )}
                        </div>
                    </div>
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
                    sessionStorage.setItem('selectedHistoryItem', JSON.stringify(item));
                    window.location.href = import.meta.env.BASE_URL;
                }}
                onClear={() => {
                    setHistoryOpen(false);
                }}
                useSidebarHistory={true}
            />
        </div>
    );
};

export default Blog;
