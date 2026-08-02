import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface BlogFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories: string[];
    totalPosts: number;
}

export const BlogFilters = ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories,
    totalPosts
}: BlogFiltersProps) => {
    return (
        <Card className="p-4 border-border/50 shadow-card backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-10 text-sm"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter:</span>
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => onCategoryChange(category)}
                            className="transition-all text-xs"
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Results Count */}
                <div className="text-xs text-muted-foreground whitespace-nowrap sm:ml-auto">
                    {totalPosts} {totalPosts === 1 ? 'article' : 'articles'}
                </div>
            </div>
        </Card>
    );
};
