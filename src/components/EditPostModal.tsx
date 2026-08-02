import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updatePost, BLOG_CATEGORIES } from '@/utils/blogData';
import { BlogPost } from '@/utils/blogData';
import { PenSquare } from 'lucide-react';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostUpdated: () => void;
    post: BlogPost | null;
}

export const EditPostModal = ({ isOpen, onClose, onPostUpdated, post }: EditPostModalProps) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setCategory(post.category);
            setContent(post.content);
            setAuthor(post.author);
        }
    }, [post]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post) return;

        setIsSubmitting(true);

        try {
            updatePost(post.id, {
                title,
                content,
                author: author || 'Anonymous',
                category
            });

            onPostUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!post) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PenSquare className="w-5 h-5" />
                        Edit Article
                    </DialogTitle>
                    <DialogDescription>
                        Update your security insights
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter article title"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                id="author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Your name (optional)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOG_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content * (Markdown supported)</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your article content here... You can use markdown formatting."
                            className="min-h-[300px] font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: Use # for headings, ** for bold, * for italic
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Article'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
