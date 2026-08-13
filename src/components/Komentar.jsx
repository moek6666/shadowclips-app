import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Turnstile } from '@marsidev/react-turnstile';
import {
    Loader2, User, Send, MessageSquare, ChevronDown,
    Bold, Italic, Code, Link as LinkIcon, Quote, X, LogOut
} from 'lucide-react';

// ==========================================
// WADAH GOOGLE OAUTH PROVIDER
// ==========================================
export default function KomentarWrapper(props) {
    return (
        <GoogleOAuthProvider clientId="584667592518-5j301svkhtkoij6dudhscof5ucj4ge16.apps.googleusercontent.com">
            <Komentar {...props} />
        </GoogleOAuthProvider>
    );
}

// ==========================================
// KOMPONEN UTAMA KOMENTAR
// ==========================================
function Komentar({ videoId, onCommentSuccess }) {
    const [comments, setComments] = useState([]);
    const [activeTab, setActiveTab] = useState(() => {
        return (typeof window !== 'undefined' && localStorage.getItem('shadowclips_user_picture')) ? 'guest' : 'login';
    });

    const [formData, setFormData] = useState(() => {
        return {
            name: typeof window !== 'undefined' ? localStorage.getItem('shadowclips_user_name') || '' : '',
            email: typeof window !== 'undefined' ? localStorage.getItem('shadowclips_user_email') || '' : '',
            picture: typeof window !== 'undefined' ? localStorage.getItem('shadowclips_user_picture') || '' : '',
            content: ''
        };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [replyTo, setReplyTo] = useState(null);

    // State & Ref untuk Cloudflare Turnstile
    const [captchaToken, setCaptchaToken] = useState(null);
    const turnstileRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const fetchComments = async () => {
            if (!videoId) return;

            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('video_id', String(videoId))
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (!error && data) {
                const localPending = JSON.parse(localStorage.getItem(`shadowclips_pending_${videoId}`) || '[]');
                const validPending = localPending.filter(
                    pending => !data.some(approved => approved.content === pending.content && approved.name === pending.name)
                );

                localStorage.setItem(`shadowclips_pending_${videoId}`, JSON.stringify(validPending));
                setComments([...validPending, ...data]);
            }
        };
        fetchComments();
    }, [videoId]);

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        return `${Math.floor(diffInSeconds / 86400)}d`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'content' && value.length > 2000) return;

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'content' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleReplyClick = (comment) => {
        setReplyTo(comment);
        setActiveTab('guest');
        setTimeout(() => {
            if (textareaRef.current) textareaRef.current.focus();
        }, 50);
    };

    const cancelReply = () => {
        setReplyTo(null);
        setFormData(prev => ({ ...prev, content: '' }));
    };

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();

                setFormData(prev => ({
                    ...prev,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture,
                }));

                localStorage.setItem('shadowclips_user_name', userInfo.name);
                localStorage.setItem('shadowclips_user_email', userInfo.email);
                localStorage.setItem('shadowclips_user_picture', userInfo.picture);

                setNotification(null);
                setActiveTab('guest');
            } catch (error) {
                console.error("Gagal mengambil data Google:", error);
                setNotification({ type: 'error', message: 'Autentikasi gagal.' });
            }
        },
        onError: () => {
            setNotification({ type: 'error', message: 'Login dibatalkan.' });
        },
    });

    const handleLogout = () => {
        setFormData(prev => ({ ...prev, name: '', email: '', picture: '' }));
        localStorage.removeItem('shadowclips_user_name');
        localStorage.removeItem('shadowclips_user_email');
        localStorage.removeItem('shadowclips_user_picture');
        setActiveTab('login');
    };

    // Fungsi Toolbar dengan penyisipan teks yang lebih baik
    const insertFormat = (format) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = formData.content;
        const selectedText = text.substring(start, end);
        let newText = text;

        if (format === 'bold') newText = text.substring(0, start) + '**' + (selectedText || 'bold') + '**' + text.substring(end);
        if (format === 'italic') newText = text.substring(0, start) + '*' + (selectedText || 'italic') + '*' + text.substring(end);
        if (format === 'code') newText = text.substring(0, start) + '`' + (selectedText || 'code') + '`' + text.substring(end);
        if (format === 'link') newText = text.substring(0, start) + '[' + (selectedText || 'text') + '](url)' + text.substring(end);
        if (format === 'quote') newText = text.substring(0, start) + '\n> ' + (selectedText || 'quote') + '\n' + text.substring(end);

        setFormData(prev => ({ ...prev, content: newText }));
        setTimeout(() => textareaRef.current.focus(), 0);
    };

    // Fungsi Parsing Markdown ke HTML
    const parseMarkdown = (text) => {
        if (!text) return '';

        // 1. Hindari XSS (Sanitasi HTML sederhana)
        let html = text.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));

        // 2. Terapkan Regex Markdown
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>'); // Bold
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>'); // Italic
        html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-[#0FFCBE] text-[12px] font-mono">$1</code>'); // Code
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#106EBE] hover:underline">$1</a>'); // Link
        html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-2 border-[#106EBE] pl-3 my-1 text-zinc-400 italic bg-zinc-900/30 py-1">$1</blockquote>'); // Quote

        // 3. Konversi enter menjadi line-break (<br/>)
        html = html.replace(/\n/g, '<br/>');

        return html;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.content || !captchaToken) return;

        if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
            setNotification({ type: 'error', message: 'Harap gunakan alamat Gmail yang valid.' });
            setTimeout(() => setNotification(null), 4000);
            return;
        }

        setIsSubmitting(true);
        setNotification(null);

        const targetParentId = replyTo ? (replyTo.parent_id || replyTo.id) : null;

        const { error } = await supabase
            .from('comments')
            .insert({
                video_id: String(videoId),
                name: formData.name,
                email: formData.email,
                avatar_url: formData.picture || null,
                content: formData.content,
                parent_id: targetParentId
            });

        setIsSubmitting(false);

        if (error) {
            console.error("Supabase Error:", error.message);
            setNotification({ type: 'error', message: 'Gagal mengirim komentar.' });
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken(null);
        } else {
            const newPendingComment = {
                id: `temp-${Date.now()}`,
                name: formData.name,
                avatar_url: formData.picture,
                content: formData.content,
                created_at: new Date().toISOString(),
                status: 'pending',
                parent_id: targetParentId
            };

            setComments(prev => [newPendingComment, ...prev]);

            localStorage.setItem('shadowclips_user_name', formData.name);
            localStorage.setItem('shadowclips_user_email', formData.email);
            if (formData.picture) localStorage.setItem('shadowclips_user_picture', formData.picture);

            const existingPending = JSON.parse(localStorage.getItem(`shadowclips_pending_${videoId}`) || '[]');
            localStorage.setItem(`shadowclips_pending_${videoId}`, JSON.stringify([newPendingComment, ...existingPending]));

            setFormData(prev => ({ ...prev, content: '' }));
            setReplyTo(null);

            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken(null);

            localStorage.setItem(`shadowclips_commented_${videoId}`, 'true');
            if (onCommentSuccess) onCommentSuccess();

            if (textareaRef.current) textareaRef.current.style.height = '120px';
        }
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'G';
    const mainComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return (
        <div className="w-full mt-4 mb-8 font-sans">

            {/* TOP BAR: Navigasi Login / Guest */}
            <div className="flex items-center gap-4 mb-5 border-b border-zinc-800/60 pb-4">
                <button
                    onClick={() => setActiveTab('login')}
                    className={`px-5 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-all outline-none ${activeTab === 'login' ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.3)]' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                    <User className="w-4 h-4" /> Sign in
                </button>
                <span className="text-zinc-600 text-sm font-medium">or</span>
                <button
                    onClick={() => setActiveTab('guest')}
                    className={`text-sm font-medium transition-colors outline-none ${activeTab === 'guest' ? 'text-white border-b-2 border-[#106EBE] pb-0.5' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                    post as guest
                </button>
            </div>

            {/* WADAH UTAMA FORM (Dengan Border Elegan) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-10 shadow-lg transition-all duration-500">

                {/* === TAMPILAN LOGIN GOOGLE === */}
                {activeTab === 'login' && (
                    <div className="px-6 py-14 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                        <p className="text-zinc-400 text-sm mb-8 text-center max-w-md">
                            Login securely with Google to join the discussion and unlock exclusive VIP contents instantly.
                        </p>

                        <button
                            onClick={() => login()}
                            className="w-full max-w-sm bg-white hover:bg-zinc-200 rounded-lg p-2 flex items-center justify-between transition-colors shadow-md group outline-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center text-lg font-black text-zinc-800 overflow-hidden">
                                    G
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[15px] font-bold text-zinc-900 group-hover:text-[#106EBE] transition-colors">
                                        Continue with Google
                                    </span>
                                    <span className="text-[11px] font-medium text-zinc-500">
                                        Fast, secure & seamless
                                    </span>
                                </div>
                            </div>
                            <div className="pr-3">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                        </button>

                        {notification && notification.type === 'error' && (
                            <span className="mt-4 text-xs font-medium text-red-400 animate-in fade-in">{notification.message}</span>
                        )}
                    </div>
                )}

                {/* === TAMPILAN TAB GUEST / FORM KOMENTAR === */}
                {activeTab === 'guest' && (
                    <form onSubmit={handleSubmit} className="animate-in fade-in zoom-in-95 duration-300">

                        {/* HEADER PROFIL ATAU INPUT GUEST */}
                        {formData.email && formData.picture ? (
                            <div className="flex items-center justify-between px-5 py-4 bg-zinc-950/50 border-b border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={formData.picture}
                                        alt={formData.name}
                                        className="w-10 h-10 rounded-full shadow-md object-cover border border-zinc-800"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-bold text-white leading-tight">{formData.name}</span>
                                        <span className="text-[11px] font-medium text-zinc-400">{formData.email}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-red-400 transition-colors outline-none bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-red-400/50">
                                    <LogOut className="w-3.5 h-3.5" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row bg-zinc-950/50 border-b border-zinc-800">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Your name *"
                                    className="w-full sm:w-1/2 bg-transparent px-5 py-4 text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 transition-colors"
                                    required
                                />
                                <div className="w-full sm:w-px h-px sm:h-auto bg-zinc-800"></div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email (required for access) *"
                                    className="w-full sm:w-1/2 bg-transparent px-5 py-4 text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        {/* TOOLBAR FORMATTING */}
                        <div className="flex items-center gap-4 px-5 py-3 bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                            <button type="button" onClick={() => insertFormat('bold')} className="hover:text-white transition-colors outline-none"><Bold className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertFormat('italic')} className="hover:text-white transition-colors outline-none"><Italic className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertFormat('code')} className="hover:text-white transition-colors outline-none"><Code className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertFormat('link')} className="hover:text-white transition-colors outline-none"><LinkIcon className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertFormat('quote')} className="hover:text-white transition-colors outline-none"><Quote className="w-4 h-4" /></button>

                            {replyTo && (
                                <div className="ml-auto flex items-center gap-2 bg-[#106EBE]/20 text-[#106EBE] px-3 py-1 rounded-md border border-[#106EBE]/30">
                                    <span className="text-[11px] font-bold truncate max-w-[100px] sm:max-w-[200px]">Replying to @{replyTo.name}</span>
                                    <button type="button" onClick={cancelReply} className="hover:bg-[#106EBE]/30 rounded-full p-0.5 outline-none"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            )}
                        </div>

                        {/* TEXTAREA KOMENTAR */}
                        <div className="relative bg-zinc-950/80">
                            <textarea
                                ref={textareaRef}
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Join the discussion..."
                                className="w-full bg-transparent px-5 py-5 text-[14px] text-white placeholder-zinc-600 focus:outline-none min-h-[140px] resize-y"
                                required
                            />
                            <div className="absolute bottom-3 right-5 text-[11px] font-medium text-zinc-600 select-none">
                                {formData.content.length}/2000
                            </div>
                        </div>

                        {/* FOOTER SUBMIT & CLOUDFLARE TURNSTILE */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900 border-t border-zinc-800">

                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
                                {/* CLOUDFLARE TURNSTILE */}
                                <div className="min-h-[65px] flex items-center bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                                    <Turnstile
                                        siteKey="0x4AAAAAAEI8owBAGHjSd7E5"
                                        onSuccess={(token) => setCaptchaToken(token)}
                                        onExpire={() => setCaptchaToken(null)}
                                        onError={() => setCaptchaToken(null)}
                                        theme="dark"
                                        ref={turnstileRef}
                                    />
                                </div>

                                {notification && (
                                    <span className={`text-[12px] font-medium animate-in fade-in ${notification.type === 'success' ? 'text-[#0FFCBE]' : 'text-red-400'}`}>
                                        {notification.message}
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.content.trim() || !captchaToken}
                                className="w-full sm:w-auto bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-[13px] transition-all shadow-[0_0_15px_rgba(16,110,190,0.3)] disabled:shadow-none outline-none"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Post Comment
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* KOMENTAR HEADER */}
            <div className="flex items-center justify-between mb-8 pb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-xl font-black text-white tracking-tight">Comments</h3>
                    <span className="bg-zinc-800 text-[#0FFCBE] text-xs font-black px-2.5 py-0.5 rounded-full">{comments.length}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-zinc-500 cursor-pointer hover:text-white transition-colors">
                    Newest First <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* LIST KOMENTAR */}
            <div className="flex flex-col gap-8">
                {mainComments.length > 0 ? mainComments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-3">

                        <div className={`flex gap-4 group ${comment.status === 'pending' ? 'opacity-60' : ''}`}>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 shadow-md border border-zinc-700 overflow-hidden">
                                {comment.avatar_url ? (
                                    <img src={comment.avatar_url} alt={comment.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="text-zinc-300 font-black text-sm sm:text-base">{getInitial(comment.name)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                    <span className="text-[13px] sm:text-[14px] font-bold text-zinc-100">{comment.name}</span>
                                    <span className="text-[11px] sm:text-[12px] font-medium text-zinc-500">{timeAgo(comment.created_at)}</span>
                                    {comment.status === 'pending' && (
                                        <span className="px-2 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Awaiting Approval</span>
                                    )}
                                </div>
                                {/* RENDER MARKDOWN DISINI */}
                                <div
                                    className="text-[13px] sm:text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words"
                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(comment.content) }}
                                />
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/60">
                                    <button onClick={() => handleReplyClick(comment)} className="text-[11px] sm:text-[12px] text-zinc-400 font-bold hover:text-[#0FFCBE] transition-colors outline-none">
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Balasan (Replies) */}
                        {getReplies(comment.id).length > 0 && (
                            <div className="flex flex-col gap-4 mt-1 ml-14 sm:ml-16">
                                {getReplies(comment.id).map(reply => (
                                    <div key={reply.id} className="flex gap-3 group">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700 overflow-hidden">
                                            {reply.avatar_url ? (
                                                <img src={reply.avatar_url} alt={reply.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <span className="text-zinc-400 font-bold text-xs sm:text-sm">{getInitial(reply.name)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col bg-zinc-900/40 p-3 sm:p-4 rounded-xl border border-zinc-800/60">
                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                <span className="text-[12px] sm:text-[13px] font-bold text-zinc-200">{reply.name}</span>
                                                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500">{timeAgo(reply.created_at)}</span>
                                            </div>
                                            {/* RENDER MARKDOWN DISINI (REPLY) */}
                                            <div className="text-[12px] sm:text-[13px] text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">
                                                <span className="text-[#106EBE] font-bold mr-1">@{comment.name}</span>
                                                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(reply.content) }} />
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/60">
                                                <button onClick={() => handleReplyClick(reply)} className="text-[10px] sm:text-[11px] text-zinc-500 font-bold hover:text-[#0FFCBE] transition-colors outline-none">Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-12 text-zinc-600 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
}