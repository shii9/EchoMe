import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface BlogEmptyStateProps {
    searchQuery: string;
    onClearSearch: () => void;
}

export const BlogEmptyState = ({ searchQuery, onClearSearch }: BlogEmptyStateProps) => {
    return (
        <Card className="p-12 border-border/50 bg-secondary/5">
            <div className="text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'No articles in this category yet'}
                </p>
                {searchQuery && (
                    <Button variant="outline" onClick={onClearSearch}>
                        Clear Search
                    </Button>
                )}
            </div>
        </Card>
    );
};
