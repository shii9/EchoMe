import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, BookOpen, Eye, Flame, Heart } from "lucide-react";
import { BlogPost as BlogPostType, getLoves } from '@/utils/blogData';

interface BlogPostCardProps {
    post: BlogPostType;
    index: number;
    onEdit?: (post: BlogPostType) => void;
    onDelete?: (postId: string) => void;
    showPopularBadge?: boolean;
}

export const BlogPostCard = ({ post, index, onEdit, onDelete, showPopularBadge = true }: BlogPostCardProps) => {
    const isPopular = false;
    const popularRank = -1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm group relative overflow-hidden">
                {isPopular && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 via-red-500/5 to-transparent pointer-events-none" />
                )}

                {/* Card Header */}
                <CardHeader className="space-y-3 pb-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-2 flex-wrap items-center">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                {post.category}
                            </Badge>
                            {isPopular && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 gap-1 animate-pulse">
                                    <Flame className="w-3 h-3" />
                                    #{popularRank + 1} Popular
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{post.readTime}</span>
                    </div>

                    <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                        {post.title}
                    </CardTitle>

                    {/* Meta: author · date · views */}
                    <CardDescription className="flex items-center gap-4 text-xs flex-wrap">
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                        </span>
                        <span className="flex items-center gap-1 text-pink-500">
                            <Heart className="w-3 h-3 fill-pink-500" />
                            {getLoves(post.id) || post.loves || 0}
                        </span>
                    </CardDescription>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                    </p>

                    <div className="flex flex-col gap-3 mt-auto">
                        <Separator className="opacity-50" />

                        {/* Read Article button */}
                        <Link to={`/blog/${post.id}`} className="block">
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full gap-2 group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-sm hover:shadow-md"
                            >
                                <BookOpen className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                Read Article
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
