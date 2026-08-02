import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ─── Shared spring presets ────────────────────────────────────────────────────
const SPRING_SNAPPY = { type: 'spring', stiffness: 420, damping: 28, mass: 0.8 } as const;
const SPRING_GENTLE = { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 } as const;
const SPRING_BOUNCY = { type: 'spring', stiffness: 500, damping: 22, mass: 0.7 } as const;
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

// Stagger container for comment list
const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.055, delayChildren: 0 } },
    exit: {},
};
const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_SNAPPY },
    exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18, ease: EASE_OUT_QUART } },
};

// Reply / nested thread stagger
const replyListVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
    exit: {},
};
const replyItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: SPRING_GENTLE },
    exit: { opacity: 0, x: -6, transition: { duration: 0.14 } },
};
import {
    Calendar, User, Clock, Tag, Download, FileJson, FileText, Share2,
    Edit, Trash2, Library, MessageCircle, Send, ChevronDown, Heart,
    Shield, Facebook, Twitter, Linkedin, Link2, Brain, Flag,
    Smile, MoreVertical, Check, X, AlertTriangle, CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
import {
    getPostById, BlogPost as BlogPostType, deletePost,
    addComment, deleteComment, editComment,
    toggleCommentReaction, Comment,
    getLoves, hasUserLoved, toggleLove,
    getCurrentUserId, addReport, hasUserReported
} from '@/utils/blogData';
import { EditPostModal } from '@/components/EditPostModal';
import { MobileMenu } from '@/components/MobileMenu';

// ─── Reaction emojis ─────────────────────────────────────────────────────────
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

// ─── Report Reasons ───────────────────────────────────────────────────────────
const REPORT_REASONS = [
    'Misinformation / False Content',
    'Spam or Misleading',
    'Inappropriate / Offensive Content',
    'Hate Speech or Harassment',
    'Copyright Violation',
    'Other',
];

// ─── ReportModal ──────────────────────────────────────────────────────────────
const ReportModal = ({
    post,
    onClose,
    onReported,
}: {
    post: BlogPostType;
    onClose: () => void;
    onReported: () => void;
}) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!reason) return;
        addReport(post.id, post.title, reason, details);
        setSubmitted(true);
        setTimeout(() => { onReported(); onClose(); }, 1800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={SPRING_SNAPPY}
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
                style={{ willChange: 'transform, opacity' }}
            >
                {submitted ? (
                    <div className="py-6 text-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                            <Check className="w-7 h-7 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold">Report Submitted</h3>
                        <p className="text-sm text-muted-foreground">Thank you. Our team will review this article.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <Flag className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Report Article</h3>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">"{post.title}"</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason <span className="text-red-500">*</span></label>
                            <div className="grid gap-1.5">
                                {REPORT_REASONS.map(r => (
                                    <button key={r} onClick={() => setReason(r)}
                                        className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${reason === r
                                            ? 'border-red-500 bg-red-500/10 text-red-500 font-medium'
                                            : 'border-border hover:bg-muted/40'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Additional details (optional)</label>
                            <Textarea placeholder="Describe the issue..." value={details}
                                onChange={e => setDetails(e.target.value)} rows={3} className="resize-none text-sm" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                            <Button size="sm" disabled={!reason} onClick={handleSubmit}
                                className="gap-2 bg-red-500 hover:bg-red-600 text-white">
                                <Flag className="w-3.5 h-3.5" /> Submit Report
                            </Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

// ─── EmojiReactionBar ─────────────────────────────────────────────────────────
const EmojiReactionBar = ({
    commentId,
    reactions,
    currentUserId,
    onReacted,
}: {
    commentId: string;
    reactions: Record<string, string[]>;
    currentUserId: string;
    onReacted: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleReact = (emoji: string) => {
        toggleCommentReaction(commentId, emoji);
        setOpen(false);
        onReacted();
    };

    // My current reaction (first one I've added)
    const myReaction = Object.entries(reactions).find(([, ids]) => ids.includes(currentUserId))?.[0];

    return (
        <div ref={ref} className="relative inline-flex items-center">
            <button
                onClick={() => setOpen(p => !p)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all hover:bg-muted/60 ${myReaction ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
                {myReaction ? (
                    <span className="text-base leading-none">{myReaction}</span>
                ) : (
                    <Smile className="w-3.5 h-3.5" />
                )}
                <span>{myReaction ? 'React' : 'React'}</span>
            </button>

            {/* Floating emoji picker */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.75, y: 4 }}
                        transition={SPRING_BOUNCY}
                        className="absolute bottom-full left-0 mb-2 z-30 flex gap-0.5 bg-card/98 backdrop-blur-md border border-border rounded-2xl px-2.5 py-2 shadow-2xl"
                        style={{ willChange: 'transform, opacity', transformOrigin: 'bottom left' }}
                    >
                        {REACTION_EMOJIS.map((emoji, i) => (
                            <motion.button
                                key={emoji}
                                initial={{ opacity: 0, scale: 0.5, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0, transition: { ...SPRING_BOUNCY, delay: i * 0.03 } }}
                                whileHover={{ scale: 1.35, y: -3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReact(emoji)}
                                className={`text-xl px-1 py-0.5 rounded-lg transition-colors ${reactions[emoji]?.includes(currentUserId) ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
                                title={emoji}
                                style={{ willChange: 'transform' }}
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── CommentItem ──────────────────────────────────────────────────────────────
const CommentItem = ({
    comment,
    allComments,
    depth = 0,
    postId,
    currentUserId,
    adminMode,
    onRefresh,
}: {
    comment: Comment;
    allComments: Comment[];
    depth?: number;
    postId: string;
    currentUserId: string;
    adminMode: boolean;
    onRefresh: () => void;
}) => {
    const isOwner = comment.authorId === currentUserId;
    const canDelete = isOwner || adminMode; // admin can delete any
    const canEditDelete = isOwner;         // only owner can edit/delete their own

    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [menuOpen, setMenuOpen] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const replies = allComments
        .filter(c => c.parentId === comment.id)
        .sort((a, b) => a.timestamp - b.timestamp);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        if (menuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const handleDelete = () => {
        deleteComment(comment.id);
        setMenuOpen(false);
        onRefresh();
    };

    const handleEditStart = () => {
        setEditText(comment.content);
        setEditMode(true);
        setMenuOpen(false);
    };

    const handleSaveEdit = () => {
        if (!editText.trim()) return;
        editComment(comment.id, editText);
        setEditMode(false);
        onRefresh();
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        await new Promise(r => setTimeout(r, 180));
        addComment(postId, replyText, comment.id);
        setReplyText('');
        setShowReplyBox(false);
        setShowReplies(true);
        setSubmittingReply(false);
        onRefresh();
    };

    const reactions = comment.reactions || {};
    const totalReactions = Object.values(reactions).reduce((s, arr) => s + arr.length, 0);

    // Avatar initials / icon
    const avatarLetter = comment.authorName?.charAt(0).toUpperCase() || 'A';
    const isAdminComment = adminMode && comment.authorId === currentUserId;

    return (
        <motion.div layout="position" className="flex gap-2.5">
            {/* Avatar */}
            <div className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold uppercase select-none ${depth > 0 ? 'w-7 h-7 text-[10px] mt-0.5' : 'w-8 h-8 text-xs mt-0.5'} ${isAdminComment
                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                : isOwner
                    ? 'bg-gradient-to-br from-primary to-accent/80 text-primary-foreground'
                    : 'bg-muted text-muted-foreground border border-border/40'}`}>
                {isAdminComment ? <Shield className="w-3.5 h-3.5" /> : avatarLetter}
            </div>

            {/* Content block */}
            <div className="flex-1 min-w-0">
                {/* Bubble + 3-dot menu row */}
                <div className="flex items-start gap-1.5 group/bubble">
                    {/* Bubble */}
                    <div className={`flex-1 min-w-0 rounded-2xl px-3 py-2 ${depth > 0 ? 'bg-muted/30 border border-border/30' : 'bg-muted/40 border border-border/30'}`}>
                        {/* Name + author badge */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className={`text-sm font-semibold leading-tight ${isAdminComment ? 'text-red-500' : isOwner ? 'text-primary' : 'text-foreground'}`}>
                                {isOwner && !adminMode ? 'You' : comment.authorName}
                            </span>
                            {isAdminComment && (
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                                    Admin
                                </span>
                            )}
                            {isOwner && !adminMode && (
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-primary/70 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                                    Author
                                </span>
                            )}
                        </div>

                        {/* Content or edit form */}
                        <AnimatePresence mode="wait" initial={false}>
                            {editMode ? (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, height: 0, y: -4 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -4 }}
                                    transition={SPRING_SNAPPY}
                                    className="space-y-2 mt-1"
                                    style={{ willChange: 'height, opacity' }}
                                >
                                    <div className="flex-1 relative rounded-2xl border border-border/40 bg-background/60 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-colors">
                                        <Textarea
                                            value={editText}
                                            onChange={e => {
                                                setEditText(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            rows={2}
                                            autoFocus
                                            className="text-sm w-full resize-none bg-transparent border-0 min-h-[40px] max-h-[100px] overflow-y-auto px-3 py-2 pr-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSaveEdit();
                                                if (e.key === 'Escape') setEditMode(false);
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <Button size="sm" onClick={handleSaveEdit}
                                            className="h-7 px-3 text-xs gap-1 bg-primary hover:bg-primary/90">
                                            <Check className="w-3 h-3" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}
                                            className="h-7 px-3 text-xs gap-1">
                                            <X className="w-3 h-3" /> Cancel
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.p
                                    key="content"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words"
                                >
                                    {comment.content}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Edited indicator */}
                        {comment.edited && !editMode && (
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 italic">edited</p>
                        )}

                        {/* Reaction summary bubbles */}
                        <AnimatePresence initial={false}>
                            {totalReactions > 0 && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={SPRING_GENTLE}
                                    className="flex items-center gap-1 mt-1.5 flex-wrap"
                                >
                                    <AnimatePresence initial={false}>
                                        {Object.entries(reactions).map(([emoji, ids]) =>
                                            ids.length > 0 ? (
                                                <motion.button
                                                    key={emoji}
                                                    layout
                                                    initial={{ scale: 0.4, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1, transition: SPRING_BOUNCY }}
                                                    exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.15 } }}
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => { toggleCommentReaction(comment.id, emoji); onRefresh(); }}
                                                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-colors ${ids.includes(currentUserId)
                                                        ? 'border-primary/40 bg-primary/10 text-primary'
                                                        : 'border-border/40 bg-background/40 hover:bg-muted/40'}`}
                                                    style={{ willChange: 'transform' }}
                                                >
                                                    <span className="text-sm">{emoji}</span>
                                                    <span className="text-[11px] font-medium">{ids.length}</span>
                                                </motion.button>
                                            ) : null
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3-dot menu — always visible on hover, or when open */}
                    <div ref={menuRef} className="relative flex-shrink-0 self-start mt-1">
                        <button
                            onClick={() => setMenuOpen(p => !p)}
                            className={`p-1.5 rounded-full transition-all ${menuOpen
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground/40 group-hover/bubble:text-muted-foreground hover:bg-muted/60'}`}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.82, y: -6, x: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.86, y: -4, x: 2 }}
                                    transition={SPRING_BOUNCY}
                                    className="absolute right-0 top-8 z-40 w-36 bg-card border border-border rounded-xl shadow-2xl overflow-hidden py-1"
                                    style={{ transformOrigin: 'top right', willChange: 'transform, opacity' }}
                                >
                                    {canEditDelete && (
                                        <>
                                            <button
                                                onClick={handleEditStart}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors text-left"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {/* Admin-only delete for others' comments */}
                                    {!canEditDelete && canDelete && (
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    )}
                                    {!canDelete && (
                                        <div className="px-3 py-2 text-xs text-muted-foreground italic">
                                            No actions available
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Action bar: timestamp · React · Reply · show replies */}
                {!editMode && (
                    <div className="flex items-center gap-0.5 mt-1 ml-1 flex-wrap">
                        {/* Timestamp */}
                        <span className="text-[11px] text-muted-foreground/60 mr-1">{comment.date}</span>

                        {/* React */}
                        <EmojiReactionBar
                            commentId={comment.id}
                            reactions={reactions}
                            currentUserId={currentUserId}
                            onReacted={onRefresh}
                        />

                        {/* Reply */}
                        <button
                            onClick={() => { setShowReplyBox(p => !p); }}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-muted-foreground hover:bg-muted/60 transition-all"
                        >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            Reply
                        </button>

                        {/* Show/hide replies */}
                        {replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(p => !p)}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-primary/70 hover:text-primary hover:bg-primary/10 transition-all ml-1"
                            >
                                <MessageCircle className="w-3 h-3" />
                                {showReplies ? 'Hide replies' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                                <ChevronDown className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                )}

                {/* Reply input box */}
                <AnimatePresence mode="popLayout">
                    {showReplyBox && (
                        <motion.div
                            key="reply-box"
                            initial={{ opacity: 0, height: 0, scale: 0.97, y: -8, originY: 0 }}
                            animate={{
                                opacity: 1,
                                height: 'auto',
                                scale: 1,
                                y: 0,
                                transition: { ...SPRING_GENTLE, opacity: { duration: 0.18 } },
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                scale: 0.94,
                                y: -6,
                                x: -4,
                                transition: {
                                    height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                                    opacity: { duration: 0.18, ease: 'easeIn' },
                                    scale: { duration: 0.22, ease: [0.4, 0, 1, 1] },
                                    x: { duration: 0.22, ease: [0.4, 0, 1, 1] },
                                    y: { duration: 0.22, ease: [0.4, 0, 1, 1] },
                                },
                            }}
                            className="mt-1"
                            style={{ willChange: 'height, opacity, transform', transformOrigin: 'top left' }}
                        >
                            <motion.div
                                className="flex gap-2 items-start"
                                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                            >
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1.5">
                                    <User className="w-3 h-3 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 flex items-start gap-1.5">
                                    <div className="flex-1 relative rounded-2xl border border-border/40 bg-muted/30 focus-within:bg-background/60 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-colors">
                                        <Textarea
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={e => {
                                                setReplyText(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            rows={1}
                                            autoFocus
                                            className="min-h-[36px] max-h-[96px] w-full overflow-y-auto px-3 py-2 pr-16 text-xs resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitReply();
                                                if (e.key === 'Escape') setShowReplyBox(false);
                                            }}
                                        />
                                        <div className="absolute right-2 bottom-1 flex items-center">
                                            <Button size="sm" onClick={handleSubmitReply}
                                                disabled={!replyText.trim() || submittingReply}
                                                className="h-7 px-2 text-xs gap-1 rounded-xl bg-primary hover:bg-primary/90">
                                                {submittingReply
                                                    ? <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    : <Send className="w-2.5 h-2.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="w-[28px] flex-shrink-0" />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nested replies */}
                <AnimatePresence mode="popLayout">
                    {showReplies && replies.length > 0 && (
                        <motion.div
                            key="replies"
                            initial={{ opacity: 0, height: 0, y: 4 }}
                            animate={{
                                opacity: 1,
                                height: 'auto',
                                y: 0,
                                transition: { ...SPRING_GENTLE, mass: 1.1 },
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                y: -4,
                                transition: {
                                    height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                                    opacity: { duration: 0.2, ease: 'easeIn' },
                                    y: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                                },
                            }}
                            className="mt-3 pl-4 relative"
                            style={{ willChange: 'height, opacity, transform' }}
                        >
                            <motion.div
                                variants={replyListVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{
                                    opacity: 0,
                                    transition: { staggerChildren: 0.03, staggerDirection: -1 },
                                }}
                                className="space-y-4"
                            >
                                {replies.map((reply, index) => {
                                    const isLast = index === replies.length - 1;
                                    return (
                                        <motion.div key={reply.id} variants={replyItemVariants} className="relative">
                                            {/* Thread pointer L-shape */}
                                            <div
                                                className="absolute -left-[16px] top-[-10px] w-[12px] h-[26px] border-l-2 border-b-2 border-border/50 rounded-bl-[12px]"
                                            />
                                            {/* Continuous vertical line if not last */}
                                            {!isLast && (
                                                <div
                                                    className="absolute -left-[16px] top-[-10px] bottom-[-20px] border-l-2 border-border/50"
                                                />
                                            )}
                                            <div className="pl-0.5">
                                                <CommentItem
                                                    comment={reply}
                                                    allComments={allComments}
                                                    depth={depth + 1}
                                                    postId={postId}
                                                    currentUserId={currentUserId}
                                                    adminMode={adminMode}
                                                    onRefresh={onRefresh}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ─── Main BlogPost ─────────────────────────────────────────────────────────────
const BlogPost = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { history, historyOpen, setHistoryOpen, quizOpen, setQuizOpen } = useAnalytics();
    const [apiModalOpen, setApiModalOpen] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [post, setPost] = useState<BlogPostType | null>(null);
    const currentUserId = getCurrentUserId();

    const isPostAuthor = post ? post.authorId === currentUserId : false;
    const canEditPost = isPostAuthor;

    // Comments
    const [allComments, setAllComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    // Love
    const [loved, setLoved] = useState(false);
    const [loveCount, setLoveCount] = useState(0);

    // Report
    const [reportOpen, setReportOpen] = useState(false);
    const [alreadyReported, setAlreadyReported] = useState(false);

    const refreshComments = useCallback((postId?: string) => {
        const pid = postId || id!;
        try {
            const stored = localStorage.getItem('blog-comments');
            const all: Comment[] = stored ? JSON.parse(stored) : [];
            setAllComments(all.filter(c => c.postId === pid));
        } catch { setAllComments([]); }
    }, [id]);

    useEffect(() => {
        if (id) {
            const found = getPostById(id);
            if (found) {
                setPost(found);
                refreshComments(id);
                setLoved(hasUserLoved(id));
                setLoveCount(getLoves(id) || found.loves || 0);
                setAlreadyReported(hasUserReported(id));
            } else navigate('/blog');
        }
    }, [id, navigate, refreshComments]);

    const topLevelComments = allComments
        .filter(c => !c.parentId)
        .sort((a, b) => b.timestamp - a.timestamp);

    const displayedComments = showAllComments ? topLevelComments : topLevelComments.slice(0, 5);

    const handleExportCSV = () => exportHistoryToCSV(history);
    const handleExportJSON = () => exportHistoryToJSON(history);
    const handleExportPDF = () => exportHistoryToPDF(history);

    const handleDeletePost = () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePost(post!.id);
            navigate('/blog');
        }
    };

    const handleToggleLove = () => {
        if (!post) return;
        const r = toggleLove(post.id);
        setLoved(r.loved);
        setLoveCount(r.count);
    };

    const handleCopyLink = async () => {
        try { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
        catch { prompt('Copy this link:', window.location.href); }
    };

    const handlePostUpdated = () => {
        if (id) { const u = getPostById(id); if (u) setPost(u); }
        setEditModalOpen(false);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !id) return;
        setSubmittingComment(true);
        await new Promise(r => setTimeout(r, 250));
        addComment(id, commentText);
        setCommentText('');
        setSubmittingComment(false);
        refreshComments(id);
        const el = document.getElementById('main-comment-input');
        if (el) el.style.height = 'auto';
    };

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-muted-foreground">Loading article...</h2>
                </div>
            </div>
        );
    }

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

            {/* Quick Actions */}
            <div className="hidden md:flex fixed top-20 right-4 flex-col gap-2 z-30 no-print">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setShowAI(true)}
                            className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all animate-glow-pulse shadow-sm hover:shadow-md">
                            <div className="relative w-5 h-5 rounded-md bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-sm ring-1 ring-white/10 overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]" />
                                <Brain className="w-3 h-3 relative z-10" />
                            </div>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI Assistant</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={history.length === 0}
                            className="gap-2 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/20 border-secondary/30 hover:border-secondary/50 transition-all shadow-sm hover:shadow-md">
                            <Download className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
                        <DropdownMenuItem onClick={handleExportCSV} disabled={history.length === 0} className="cursor-pointer hover:bg-primary/10"><FileJson className="w-4 h-4 mr-2" />Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportJSON} disabled={history.length === 0} className="cursor-pointer hover:bg-primary/10"><FileJson className="w-4 h-4 mr-2" />Export as JSON</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF} disabled={history.length === 0} className="cursor-pointer hover:bg-primary/10"><FileText className="w-4 h-4 mr-2" />Export as PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setApiModalOpen(true)}
                            className="gap-2 bg-gradient-to-r from-red-500/5 to-orange-500/10 hover:from-red-500/10 hover:to-orange-500/20 border-red-500/30 hover:border-red-500/50 transition-all shadow-sm hover:shadow-md">
                            <FileJson className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Manage API keys</TooltipContent>
                </Tooltip>
            </div>

            <div className="pt-20 pb-16 px-4">
                <div className="w-full max-w-5xl mx-auto md:translate-x-px">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING_GENTLE, delay: 0.05 }}
                        className="space-y-8 animate-in slide-in-from-bottom-4 duration-700"
                    >

                        {/* ── Article Header ── */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                    <Tag className="w-3 h-3 mr-1" />{post.category}
                                </Badge>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">{post.title}</h1>
                                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{post.author}</p>
                                            <p className="text-xs text-muted-foreground">Author</p>
                                        </div>
                                    </div>
                                    <Separator orientation="vertical" className="h-10" />
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span className="text-sm">{post.date}</span></div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-sm">{post.readTime}</span></div>
                                    <div className="flex items-center gap-2 text-sm"><MessageCircle className="w-4 h-4 text-accent" /><span>{topLevelComments.length} comments</span></div>
                                    <div className="flex items-center gap-2 text-sm text-pink-500 font-medium"><Heart className="w-4 h-4 fill-pink-500" /><span>{loveCount} love</span></div>
                                </div>
                            </div>
                            <Separator />
                        </div>

                        {/* ── Article Content ── */}
                        <Card className="border-border/50 shadow-lg backdrop-blur-sm overflow-hidden">
                            <div className="p-8 md:p-12">
                                <article className="prose prose-lg dark:prose-invert max-w-none">
                                    <div className="text-lg leading-relaxed whitespace-pre-wrap [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:ml-6 [&>ol]:mb-4 [&>ol]:ml-6">
                                        {post.content}
                                    </div>
                                </article>
                            </div>

                            {/* Bottom action bar */}
                            <div className="px-8 md:px-12 py-5 border-t border-border/40 bg-muted/20">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    {/* Left: Report */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm"
                                                onClick={() => !alreadyReported && setReportOpen(true)}
                                                disabled={alreadyReported}
                                                className={`gap-2 text-xs transition-all ${alreadyReported ? 'text-muted-foreground cursor-not-allowed' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'}`}>
                                                <Flag className="w-3.5 h-3.5" />
                                                {alreadyReported ? 'Reported' : 'Report Article'}
                                            </Button>
                                        </TooltipTrigger>
                                        {alreadyReported && <TooltipContent>You've already reported this article</TooltipContent>}
                                    </Tooltip>

                                    {/* Right: Actions */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link to="/blog">
                                            <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all">
                                                <Library className="w-4 h-4" />View All Articles
                                            </Button>
                                        </Link>
                                        {canEditPost && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}
                                                    className="gap-2 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all">
                                                    <Edit className="w-4 h-4" />Edit Article
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleDeletePost}
                                                    className="gap-2 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all">
                                                    <Trash2 className="w-4 h-4" />Delete Article
                                                </Button>
                                            </>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all">
                                                    <Share2 className="w-4 h-4" />Share
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-card border-border z-50">
                                                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer hover:bg-primary/10 font-medium"><Link2 className="w-4 h-4 mr-2" />Copy Link</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post!.title + " " + window.location.href)}`, '_blank')} className="cursor-pointer hover:bg-primary/10 text-green-500 focus:text-green-500 font-medium"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post!.title)}`, '_blank')} className="cursor-pointer hover:bg-primary/10 text-primary focus:text-primary font-medium"><Send className="w-4 h-4 mr-2" />Telegram</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="cursor-pointer hover:bg-primary/10 text-primary focus:text-primary font-medium"><Facebook className="w-4 h-4 mr-2" />Facebook</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post!.title)}`, '_blank')} className="cursor-pointer hover:bg-primary/10 text-sky-500 focus:text-sky-500 font-medium"><Twitter className="w-4 h-4 mr-2" />Twitter / X</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')} className="cursor-pointer hover:bg-primary/10 text-primary focus:text-primary font-medium"><Linkedin className="w-4 h-4 mr-2" />LinkedIn</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="outline" size="sm" onClick={handleToggleLove}
                                            className={`gap-2 transition-all ${loved ? 'bg-pink-50 text-pink-600 border-pink-300 hover:bg-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-700' : 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 dark:hover:bg-pink-950/40'}`}>
                                            <Heart className={`w-4 h-4 transition-all duration-300 ${loved ? 'fill-current' : ''}`} />
                                            {loved ? 'Loved' : 'Love'} ({loveCount})
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* ── Comment Section ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING_GENTLE, delay: 0.18 }}
                        >
                            <Card className="border-border/50 shadow-md overflow-hidden">
                                {/* Header */}
                                <div className="px-8 py-5 border-b border-border/40 bg-muted/20 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Comments</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {topLevelComments.length} {topLevelComments.length === 1 ? 'comment' : 'comments'} · Join the discussion
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    {/* ── Post Comment Form ── */}
                                    <div className="flex gap-2.5 items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full mt-0.5 flex items-center justify-center bg-primary/10">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-start gap-1.5">
                                            <div className="flex-1 relative rounded-2xl border border-border/40 bg-muted/30 focus-within:bg-background/60 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-colors">
                                                <Textarea
                                                    id="main-comment-input"
                                                    placeholder="Share your thoughts..."
                                                    value={commentText}
                                                    onChange={e => {
                                                        setCommentText(e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                                    }}
                                                    rows={1}
                                                    className="min-h-[44px] max-h-[100px] w-full overflow-y-auto px-4 py-3 pr-24 text-sm resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitComment();
                                                    }}
                                                />
                                                <div className="absolute right-2 bottom-1.5 flex items-center">
                                                    <Button size="sm" onClick={handleSubmitComment}
                                                        disabled={!commentText.trim() || submittingComment}
                                                        className="h-8 px-3 gap-1.5 bg-primary hover:bg-primary/90 shadow-sm text-xs rounded-xl">
                                                        {submittingComment
                                                            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            : <Send className="w-3 h-3" />}
                                                        <span className="sr-only sm:not-sr-only">Post</span>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="w-[28px] flex-shrink-0" />
                                        </div>
                                    </div>

                                    {/* ── Comment List ── */}
                                    {topLevelComments.length === 0 ? (
                                        <div className="py-2 text-center">
                                            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                                                <MessageCircle className="w-4 h-4 opacity-50" />
                                                No comments yet. Be the first to share your thoughts!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <motion.div
                                                variants={listVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <AnimatePresence mode="popLayout" initial={false}>
                                                    {displayedComments.map((comment) => (
                                                        <motion.div
                                                            key={comment.id}
                                                            variants={itemVariants}
                                                            layout="position"
                                                            style={{ willChange: 'transform, opacity' }}
                                                            className="pb-5 last:pb-0"
                                                        >
                                                            <CommentItem
                                                                comment={comment}
                                                                allComments={allComments}
                                                                depth={0}
                                                                postId={id!}
                                                                currentUserId={currentUserId}
                                                                adminMode={false}
                                                                onRefresh={() => refreshComments(id)}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </motion.div>

                                            {topLevelComments.length > 5 && (
                                                <motion.div
                                                    layout
                                                    className="flex justify-center pt-1"
                                                >
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => setShowAllComments(p => !p)}
                                                        className="gap-2 text-muted-foreground hover:text-foreground group">
                                                        <motion.span
                                                            animate={{ rotate: showAllComments ? 180 : 0 }}
                                                            transition={SPRING_SNAPPY}
                                                            style={{ display: 'inline-flex', willChange: 'transform' }}
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </motion.span>
                                                        {showAllComments ? 'Show less' : `Show ${topLevelComments.length - 5} more comments`}
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                    </motion.div>
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {reportOpen && (
                    <ReportModal
                        post={post}
                        onClose={() => setReportOpen(false)}
                        onReported={() => setAlreadyReported(true)}
                    />
                )}
            </AnimatePresence>

            <APIKeysModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />
            <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

            <AnimatePresence>
                {quizOpen && <QuizMode onClose={() => setQuizOpen(false)} onAchievement={() => { }} />}
            </AnimatePresence>

            <HistorySidebar
                history={history} isOpen={historyOpen} onClose={() => setHistoryOpen(false)}
                onSelect={(item) => { sessionStorage.setItem('selectedHistoryItem', JSON.stringify(item)); window.location.href = import.meta.env.BASE_URL; }}
                onClear={() => setHistoryOpen(false)} useSidebarHistory={true}
            />

            <EditPostModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onPostUpdated={handlePostUpdated} post={post} />
        </div>
    );
};

export default BlogPost;
