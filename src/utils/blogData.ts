export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    authorId: string; // Unique ID to track post ownership
    date: string;
    category: string;
    readTime: string;
    views: number;
    rating: number; // Star rating from 1 to 5
    loves: number; // Total love/heart count
}

export interface CommentReaction {
    emoji: string;
    userIds: string[];
}

export interface Comment {
    id: string;
    postId: string;
    parentId: string | null; // null = top-level, string = reply to comment
    authorName: string;
    authorId: string;
    content: string;
    date: string;
    timestamp: number;
    reactions: Record<string, string[]>; // emoji -> userIds[]
    edited?: boolean;
    editedAt?: string;
}

export interface ArticleReport {
    id: string;
    postId: string;
    postTitle: string;
    reporterId: string;
    reason: string;
    details: string;
    timestamp: number;
    date: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    adminNote?: string;
}

const COMMENTS_KEY = 'blog-comments';
const LOVES_KEY = 'blog-loves'; // stores { [postId]: string[] } where string[] = userIds
const REPORTS_KEY = 'blog-reports';

// ── Admin helpers ───────────────────────────────────────────────
// ── Love/Heart helpers ──────────────────────────────────────────
const _getLovesMap = (): Record<string, string[]> => {
    try {
        const stored = localStorage.getItem(LOVES_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const _saveLovesMap = (map: Record<string, string[]>) => {
    localStorage.setItem(LOVES_KEY, JSON.stringify(map));
};

/** Get total love count for a post */
export const getLoves = (postId: string): number => {
    const map = _getLovesMap();
    return (map[postId] || []).length;
};

/** Check if the current user has loved a post */
export const hasUserLoved = (postId: string): boolean => {
    const map = _getLovesMap();
    const userId = getCurrentUserId();
    return (map[postId] || []).includes(userId);
};

/** Toggle love for a post. Returns { loved: boolean, count: number } */
export const toggleLove = (postId: string): { loved: boolean; count: number } => {
    const map = _getLovesMap();
    const userId = getCurrentUserId();
    if (!map[postId]) map[postId] = [];

    const idx = map[postId].indexOf(userId);
    if (idx === -1) {
        map[postId].push(userId);
    } else {
        map[postId].splice(idx, 1);
    }
    _saveLovesMap(map);

    // Also update the loves count on the post object in storage
    const posts = getPosts();
    const pi = posts.findIndex(p => p.id === postId);
    if (pi !== -1) {
        posts[pi].loves = map[postId].length;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    return { loved: idx === -1, count: map[postId].length };
};



// ── Comment helpers ─────────────────────────────────────────────
const _getAllComments = (): Comment[] => {
    try {
        const stored = localStorage.getItem(COMMENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const _saveAllComments = (comments: Comment[]): void => {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

/** Get top-level comments for a post (sorted newest first) */
export const getComments = (postId: string): Comment[] => {
    const all = _getAllComments();
    return all
        .filter(c => c.postId === postId && !c.parentId)
        .sort((a, b) => b.timestamp - a.timestamp);
};

/** Get replies for a specific comment */
export const getReplies = (commentId: string): Comment[] => {
    const all = _getAllComments();
    return all
        .filter(c => c.parentId === commentId)
        .sort((a, b) => a.timestamp - b.timestamp);
};

/** Add a new comment or reply */
export const addComment = (
    postId: string,
    content: string,
    parentId: string | null = null,
    authorName?: string
): Comment => {
    const all = _getAllComments();
    const userId = getCurrentUserId();
    const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        postId,
        parentId,
        authorName: authorName || 'Anonymous',
        authorId: userId,
        content: content.trim(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        timestamp: Date.now(),
        reactions: {},
        edited: false,
    };
    all.push(newComment);
    _saveAllComments(all);
    return newComment;
};

/** Edit a comment (only owner can call this, enforced in UI) */
export const editComment = (commentId: string, newContent: string): boolean => {
    const all = _getAllComments();
    const idx = all.findIndex(c => c.id === commentId);
    if (idx === -1) return false;
    all[idx].content = newContent.trim();
    all[idx].edited = true;
    all[idx].editedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    _saveAllComments(all);
    return true;
};

export const deleteComment = (commentId: string): void => {
    const all = _getAllComments();
    // Delete the comment and all its replies
    const filtered = all.filter(c => c.id !== commentId && c.parentId !== commentId);
    _saveAllComments(filtered);
};

/** Toggle a reaction emoji on a comment */
export const toggleCommentReaction = (
    commentId: string,
    emoji: string
): Record<string, string[]> => {
    const all = _getAllComments();
    const idx = all.findIndex(c => c.id === commentId);
    if (idx === -1) return {};

    const userId = getCurrentUserId();
    if (!all[idx].reactions) all[idx].reactions = {};
    if (!all[idx].reactions[emoji]) all[idx].reactions[emoji] = [];

    const userIdx = all[idx].reactions[emoji].indexOf(userId);
    if (userIdx === -1) {
        all[idx].reactions[emoji].push(userId);
    } else {
        all[idx].reactions[emoji].splice(userIdx, 1);
        if (all[idx].reactions[emoji].length === 0) {
            delete all[idx].reactions[emoji];
        }
    }
    _saveAllComments(all);
    return all[idx].reactions;
};

// ── Report helpers ───────────────────────────────────────────────
const _getAllReports = (): ArticleReport[] => {
    try {
        const stored = localStorage.getItem(REPORTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const _saveAllReports = (reports: ArticleReport[]): void => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const getReports = (): ArticleReport[] => {
    return _getAllReports().sort((a, b) => b.timestamp - a.timestamp);
};

export const getPendingReportsCount = (): number => {
    return _getAllReports().filter(r => r.status === 'pending').length;
};

export const addReport = (
    postId: string,
    postTitle: string,
    reason: string,
    details: string
): ArticleReport => {
    const all = _getAllReports();
    const newReport: ArticleReport = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        postId,
        postTitle,
        reporterId: getCurrentUserId(),
        reason,
        details,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'pending',
    };
    all.push(newReport);
    _saveAllReports(all);
    return newReport;
};

export const updateReportStatus = (
    reportId: string,
    status: ArticleReport['status'],
    adminNote?: string
): boolean => {
    const all = _getAllReports();
    const idx = all.findIndex(r => r.id === reportId);
    if (idx === -1) return false;
    all[idx].status = status;
    if (adminNote !== undefined) all[idx].adminNote = adminNote;
    _saveAllReports(all);
    return true;
};

export const deleteReport = (reportId: string): void => {
    const all = _getAllReports();
    _saveAllReports(all.filter(r => r.id !== reportId));
};

/** Check if the current user has already reported a post */
export const hasUserReported = (postId: string): boolean => {
    const userId = getCurrentUserId();
    return _getAllReports().some(r => r.postId === postId && r.reporterId === userId);
};

const INITIAL_POSTS: BlogPost[] = [
    {
        id: "1",
        title: "Understanding Phishing Attacks in 2024",
        excerpt: "Phishing attacks are evolving. Learn about the latest techniques attackers are using to steal your data and how to stay safe.",
        content: `# Understanding Phishing Attacks in 2024

Phishing attacks continue to be one of the most prevalent cybersecurity threats in 2024. As technology advances, so do the tactics employed by cybercriminals.

## What is Phishing?

Phishing is a type of social engineering attack where attackers attempt to trick individuals into revealing sensitive information such as passwords, credit card numbers, or personal data.

## Common Techniques

1. **Email Spoofing**: Attackers impersonate legitimate organizations
2. **Spear Phishing**: Targeted attacks on specific individuals
3. **Smishing**: Phishing via SMS messages
4. **Vishing**: Voice phishing through phone calls

## How to Protect Yourself

- Always verify the sender's email address
- Look for spelling and grammar errors
- Never click on suspicious links
- Enable two-factor authentication
- Keep your software updated

Stay vigilant and always think before you click!`,
        author: "Security Team",
        authorId: "default-security-team",
        date: "March 15, 2024",
        category: "Security Awareness",
        readTime: "5 min read",
        views: 156,
        rating: 4,
        loves: 12
    },
    {
        id: "2",
        title: "The Importance of Email Header Analysis",
        excerpt: "Email headers contain a wealth of information. Discover how analyzing headers can help you identify malicious emails.",
        content: `# The Importance of Email Header Analysis

Email headers are like the DNA of an email - they contain crucial information that can help you identify whether an email is legitimate or malicious.

## What Are Email Headers?

Email headers contain metadata about the email's journey from sender to recipient, including routing information, authentication results, and timestamps.

## Key Header Fields to Check

- **From**: The sender's address (can be spoofed)
- **Return-Path**: The actual email address for replies
- **Received**: Shows the path the email took
- **SPF/DKIM/DMARC**: Authentication results

## How to Analyze Headers

1. Access the full email headers in your email client
2. Look for inconsistencies in sender information
3. Check authentication results
4. Verify the email's path matches expected routes

Understanding email headers is a powerful skill in identifying phishing attempts.`,
        author: "Tech Analyst",
        authorId: "default-tech-analyst",
        date: "March 10, 2024",
        category: "Technical",
        readTime: "8 min read",
        views: 89,
        rating: 3,
        loves: 5
    },
    {
        id: "3",
        title: "Social Engineering: The Human Element",
        excerpt: "Why do people fall for scams? We explore the psychological tactics used by cybercriminals to manipulate victims.",
        content: `# Social Engineering: The Human Element

Social engineering exploits human psychology rather than technical vulnerabilities. Understanding these tactics is crucial for protecting yourself and your organization.

## Common Psychological Tactics

### 1. Authority
Attackers impersonate authority figures to pressure victims into compliance.

### 2. Urgency
Creating a false sense of urgency to bypass rational thinking.

### 3. Fear
Using threats or scary scenarios to manipulate victims.

### 4. Curiosity
Exploiting natural human curiosity to get victims to click links.

## Real-World Examples

- CEO fraud emails requesting urgent wire transfers
- Fake security alerts claiming your account is compromised
- Prize notifications requiring personal information

## Defense Strategies

- Always verify requests through alternative channels
- Take time to think before acting
- Trust your instincts
- Educate yourself and others

Remember: The best defense against social engineering is awareness and skepticism.`,
        author: "Guest Writer",
        authorId: "default-guest-writer",
        date: "March 5, 2024",
        category: "Psychology",
        readTime: "6 min read",
        views: 203,
        rating: 4,
        loves: 24
    }
];

const STORAGE_KEY = 'blog-posts';

export const BLOG_CATEGORIES = [
    'Security Awareness',
    'Technical',
    'Psychology',
    'General',
    'Others'
];

export const getPosts = (): BlogPost[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing stored posts:', error);
        }
    }
    // Initialize with default posts
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
};

export const getPostById = (id: string): BlogPost | null => {
    const posts = getPosts();
    return posts.find(post => post.id === id) || null;
};

// Get or create a unique user ID for the current device/browser
export const getCurrentUserId = (): string => {
    const USER_ID_KEY = 'blog-user-id';
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
        userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
};

export const createPost = (post: Omit<BlogPost, 'id' | 'date' | 'views' | 'rating' | 'authorId'>): BlogPost => {
    const posts = getPosts();
    const newPost: BlogPost = {
        ...post,
        id: Date.now().toString(),
        authorId: getCurrentUserId(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),

        views: 0,
        rating: 3, // Default rating
        loves: 0
    };
    const updatedPosts = [...posts, newPost];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    return newPost;
};

export const updatePost = (id: string, updatedPost: Partial<Omit<BlogPost, 'id' | 'date'>>): BlogPost | null => {
    const posts = getPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;

    const existingPost = posts[postIndex];
    const updated: BlogPost = {
        ...existingPost,
        ...updatedPost,
        // Recalculate readTime if content changed
        readTime: updatedPost.content ? `${Math.ceil(updatedPost.content.split(/\s+/).length / 200)} min read` : existingPost.readTime,
        // Recalculate excerpt if content changed
        excerpt: updatedPost.content ? (updatedPost.content.substring(0, 150) + (updatedPost.content.length > 150 ? '...' : '')) : existingPost.excerpt
    };

    posts[postIndex] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return updated;
};

export const deletePost = (id: string): boolean => {
    const posts = getPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    if (filteredPosts.length === posts.length) return false; // Post not found

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));
    return true;
};

export const getCategories = (): string[] => {
    const posts = getPosts();
    const categories = new Set(posts.map(post => post.category));
    return Array.from(categories);
};



export const incrementViews = (id: string): BlogPost | null => {
    const posts = getPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;

    posts[postIndex].views += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return posts[postIndex];
};

// Advanced search function
export const searchPosts = (query: string, posts: BlogPost[]): BlogPost[] => {
    if (!query.trim()) return posts;

    const searchTerm = query.toLowerCase();
    return posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm) ||
        post.category.toLowerCase().includes(searchTerm)
    );
};

// Sort posts
export type SortOption = 'newest' | 'oldest' | 'popular' | 'most-viewed';

export const sortPosts = (posts: BlogPost[], sortBy: SortOption): BlogPost[] => {
    const sortedPosts = [...posts];

    switch (sortBy) {
        case 'newest':
            return sortedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        case 'oldest':
            return sortedPosts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'popular':
            return sortedPosts.sort((a, b) => b.views - a.views);
        case 'most-viewed':
            return sortedPosts.sort((a, b) => b.views - a.views);
        default:
            return sortedPosts;
    }
};

export const getPopularPosts = (limit: number = 10): BlogPost[] => {
    const posts = getPosts();
    return posts
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
};
