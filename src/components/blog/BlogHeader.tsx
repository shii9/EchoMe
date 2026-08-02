import { PenSquare } from "lucide-react";

export const BlogHeader = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse"></div>
            <div className="relative p-8 md:p-12">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <PenSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Security Blog</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Security Insights & News
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
                        Stay informed with the latest news, tips, and analysis from our security experts.
                    </p>
                </div>
            </div>
        </div>
    );
};
