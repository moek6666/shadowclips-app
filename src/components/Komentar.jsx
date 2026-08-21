import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Send, MessageSquare, ChevronDown, Smile, Bold, Italic, Code, Link as LinkIcon, Quote, X, BadgeCheck, Crown, LogIn } from 'lucide-react';
import ModalLogin from './ModalLogin';

// DAFTAR EMOJI 3D
const animatedEmojis = {
    ':keren:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png',
    ':love:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Smiling%20Face%20with%20Heart-Eyes.png',
    ':api:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Travel%20and%20places/Fire.png',
    ':ketawa:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Rolling%20on%20the%20Floor%20Laughing.png',
    ':roket:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Travel%20and%20places/Rocket.png',
    ':nangis:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Loudly%20Crying%20Face.png',
    ':jempol:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Hand%20gestures/Thumbs%20Up.png',
    ':wow:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Star-Struck.png',
    ':pesta:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Partying%20Face.png',
    ':mohon:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Pleading%20Face.png',
    ':mikir:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Thinking%20Face.png',
    ':marah:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Smilies/Pouting%20Face.png',
    ':tepuk:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Hand%20gestures/Clapping%20Hands.png',
    ':doa:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Hand%20gestures/Folded%20Hands.png',
    ':mahkota:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Objects/Crown.png',
    ':seratus:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Symbols/Hundred%20Points.png',
    ':hati:': 'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/Symbols/Red%20Heart.png'
};

export default function Komentar({ videoId, onCommentSuccess, supabase }) {
    const [comments, setComments] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});

    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const textareaRef = useRef(null);

    const fetchMyProfile = async (id) => {
        if (!supabase || !id) return;
        try {
            const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (data) setProfile(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!supabase) return;

        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            if (currentSession?.user) fetchMyProfile(currentSession.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
            if (currentSession?.user) fetchMyProfile(currentSession.user.id);
            else setProfile(null);
        });

        return () => subscription?.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase]);

    useEffect(() => {
        const fetchData = async () => {
            if (!videoId || !supabase) return;

            try {
                let query = supabase
                    .from('comments')
                    .select('*')
                    .eq('video_id', String(videoId))
                    .order('created_at', { ascending: false });

                if (session?.user?.email) {
                    query = query.or(`status.eq.approved,email.eq.${session.user.email}`);
                } else {
                    query = query.eq('status', 'approved');
                }

                const { data: commentsData, error: commentsError } = await query;

                if (!commentsError && commentsData) {
                    const uniqueEmails = [...new Set(commentsData.map(c => c.email).filter(Boolean))];
                    if (uniqueEmails.length > 0) {
                        const { data: profilesData } = await supabase
                            .from('profiles')
                            .select('email, is_admin, is_premium, active_frame')
                            .in('email', uniqueEmails);

                        if (profilesData) {
                            const profileMap = {};
                            profilesData.forEach(p => { profileMap[p.email] = p; });
                            setUserProfiles(profileMap);
                        }
                    }
                    setComments(commentsData || []);
                } else {
                    setComments([]);
                }
            } catch (e) {
                console.error("Error fetching comments:", e);
                setComments([]);
            }
        };

        fetchData();

        if (supabase) {
            const channel = supabase.channel(`public:comments:${videoId}`)
                .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, (payload) => {
                    setComments(currentComments => (currentComments || []).filter(c => c.id !== payload.old.id));
                }).subscribe();
            return () => supabase.removeChannel(channel);
        }
    }, [videoId, supabase, session?.user?.email]);

    const timeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((new Date() - date) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        return `${Math.floor(diffInSeconds / 86400)}d`;
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length > 2000) return;
        setContent(value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleReplyClick = (comment) => {
        setReplyTo(comment);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const cancelReply = () => {
        setReplyTo(null);
        setContent('');
    };

    const insertFormat = (format) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText = content;
        if (format === 'bold') newText = content.substring(0, start) + '**' + (selectedText || 'bold') + '**' + content.substring(end);
        if (format === 'italic') newText = content.substring(0, start) + '*' + (selectedText || 'italic') + '*' + content.substring(end);
        if (format === 'code') newText = content.substring(0, start) + '`' + (selectedText || 'code') + '`' + content.substring(end);
        if (format === 'link') newText = content.substring(0, start) + '[' + (selectedText || 'text') + '](url)' + content.substring(end);
        if (format === 'quote') newText = content.substring(0, start) + '\n> ' + (selectedText || 'quote') + '\n' + content.substring(end);
        setContent(newText);
        setTimeout(() => textareaRef.current.focus(), 0);
    };

    const insertEmoji = (emojiCode) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        setContent(content.substring(0, start) + emojiCode + content.substring(start));
        setTimeout(() => textareaRef.current.focus(), 0);
    };

    const parseMarkdown = (text) => {
        if (!text || typeof text !== 'string') return '';
        let html = text.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-900 dark:text-white font-bold">$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-zinc-600 dark:text-zinc-300">$1</em>');
        html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-200 dark:bg-zinc-900/60 px-1.5 py-0.5 rounded text-[#106EBE] dark:text-[#0FFCBE] text-[12px] font-mono">$1</code>');
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#106EBE] hover:underline">$1</a>');
        html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-2 border-[#106EBE] pl-3 my-1 text-zinc-500 dark:text-zinc-400 italic bg-zinc-100 dark:bg-zinc-900/30 py-1">$1</blockquote>');
        html = html.replace(/\n/g, '<br/>');

        html = html.replace(/(:[a-zA-Z0-9_]+:)/g, (match) => {
            if (animatedEmojis[match]) return `<img src="${animatedEmojis[match]}" alt="${match}" title="${match}" class="inline-block w-6 h-6 sm:w-7 sm:h-7 align-bottom drop-shadow-md hover:scale-125 transition-transform duration-300 border-none select-none" draggable="false" />`;
            return match;
        });
        return html;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user || !content.trim()) return; // Captcha token dilepas

        setIsSubmitting(true);
        setNotification(null);

        const targetParentId = replyTo ? (replyTo.parent_id || replyTo.id) : null;
        const isAdmin = profile?.is_admin || false;
        const statusKomentar = isAdmin ? 'approved' : 'pending';
        const userEmail = session.user.email;
        const userName = profile?.name || userEmail.split('@')[0];

        const newCommentPayload = {
            video_id: String(videoId),
            name: userName,
            email: userEmail,
            avatar_url: profile?.avatar_url || null,
            content: content,
            parent_id: targetParentId,
            status: statusKomentar
        };

        try {
            const { data: insertedData, error } = await supabase.from('comments').insert(newCommentPayload).select().single();
            if (error) throw error;

            setComments(prev => [insertedData, ...(prev || [])]);

            setUserProfiles(prev => ({
                ...prev,
                [userEmail]: {
                    email: userEmail,
                    is_admin: profile?.is_admin || false,
                    is_premium: profile?.is_premium || false,
                }
            }));

            if (!isAdmin) {
                await supabase.rpc('increment_user_points', { p_email: userEmail, p_points: 5 }).catch(() => { });
            }

            if (isAdmin) {
                setNotification({ type: 'success', message: 'Komentar Admin ditayangkan!' });
                setTimeout(() => setNotification(null), 3000);
            } else {
                setNotification({ type: 'success', message: 'Komentar terkirim! Menunggu persetujuan.' });
                setTimeout(() => setNotification(null), 4000);
            }

            setContent('');
            setReplyTo(null);

            if (onCommentSuccess) onCommentSuccess();
            if (textareaRef.current) textareaRef.current.style.height = '120px';

        } catch (error) {
            setNotification({ type: 'error', message: 'Gagal mengirim komentar.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    const safeComments = Array.isArray(comments) ? comments : [];
    const mainComments = safeComments.filter(c => !c.parent_id);
    const getReplies = (parentId) => safeComments.filter(c => c.parent_id === parentId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const renderAuthOrForm = (isInline = false) => {
        const isMeAdmin = profile?.is_admin || false;
        const isMePremium = profile?.is_premium || false;
        const userName = profile?.name || session?.user?.email?.split('@')[0] || 'Guest';

        return (
            <div className={`bg-white dark:bg-zinc-800/60 rounded-[1.5rem] overflow-hidden shadow-sm dark:shadow-lg transition-all duration-500 border-none ${isInline ? 'mt-3 mb-2' : 'mb-10'}`}>
                <form onSubmit={handleSubmit} className="animate-in fade-in duration-300 border-none">
                    <div className="flex items-center justify-between px-4 sm:px-5 py-4 bg-zinc-50 dark:bg-zinc-900/40 border-none">
                        {session?.user ? (
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt={userName} className="w-10 h-10 rounded-full shadow-md object-cover border-none" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#106EBE] flex items-center justify-center text-white border-none font-bold">{getInitial(userName)}</div>
                                    )}
                                    {isMeAdmin ? (
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5"><BadgeCheck className="w-4 h-4 text-[#106EBE] dark:text-[#0FFCBE] fill-white dark:fill-[#106EBE]" /></div>
                                    ) : isMePremium ? (
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm"><Crown className="w-4 h-4 text-amber-500 fill-amber-500/20" /></div>
                                    ) : null}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] sm:text-[14px] font-bold text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5 transition-colors">
                                        {userName}
                                        {isMePremium && !isMeAdmin && <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">VIP</span>}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-none transition-colors">{session.user.email}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shadow-md border-none transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] sm:text-[14px] font-bold text-zinc-800 dark:text-zinc-300 leading-tight transition-colors">Guest Mode</span>
                                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 transition-colors">Sign in is required to post a comment</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 px-4 sm:px-5 py-3 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-300 border-none overflow-visible transition-colors">
                        <button type="button" onClick={() => insertFormat('bold')} className="hover:text-zinc-900 dark:hover:text-white transition-colors outline-none border-none shrink-0" title="Bold"><Bold className="w-4 h-4" /></button>
                        <button type="button" onClick={() => insertFormat('italic')} className="hover:text-zinc-900 dark:hover:text-white transition-colors outline-none border-none shrink-0" title="Italic"><Italic className="w-4 h-4" /></button>
                        <button type="button" onClick={() => insertFormat('code')} className="hover:text-zinc-900 dark:hover:text-white transition-colors outline-none border-none shrink-0" title="Code"><Code className="w-4 h-4" /></button>
                        <button type="button" onClick={() => insertFormat('link')} className="hover:text-zinc-900 dark:hover:text-white transition-colors outline-none border-none shrink-0" title="Link"><LinkIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={() => insertFormat('quote')} className="hover:text-zinc-900 dark:hover:text-white transition-colors outline-none border-none shrink-0" title="Quote"><Quote className="w-4 h-4" /></button>
                        <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-600 mx-1 shrink-0 transition-colors"></div>

                        <div className="relative flex items-center group/emoji h-full py-1">
                            <button type="button" className="hover:text-[#106EBE] dark:hover:text-[#0FFCBE] transition-colors outline-none border-none shrink-0" title="Insert 3D Emoji"><Smile className="w-4 h-4" /></button>
                            <div className="absolute top-full left-0 pt-2 hidden group-hover/emoji:block z-50 min-w-max animate-in fade-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 w-56 sm:w-64 max-h-52 overflow-y-auto custom-scrollbar">
                                    {Object.entries(animatedEmojis).map(([code, url]) => (
                                        <button key={code} type="button" onClick={() => insertEmoji(code)} className="hover:scale-125 transition-transform duration-300 flex items-center justify-center p-1 outline-none border-none" title={code.replace(/:/g, '')}>
                                            <img src={url} className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm border-none" alt={code} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {replyTo && (
                            <div className="ml-auto flex items-center gap-2 bg-[#106EBE]/10 dark:bg-[#106EBE]/20 text-[#106EBE] px-3 py-1 rounded-lg border-none shrink-0">
                                <span className="text-[10px] sm:text-[11px] font-bold truncate max-w-[100px] sm:max-w-[150px]">Replying to @{replyTo.name}</span>
                                <button type="button" onClick={cancelReply} className="hover:bg-[#106EBE]/20 dark:hover:bg-[#106EBE]/30 rounded-full p-0.5 outline-none border-none"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                    </div>
                    <div className="relative bg-white dark:bg-zinc-900/40 border-none transition-colors">
                        <textarea ref={textareaRef} value={content} onChange={handleInputChange} placeholder="Type your comment here..." className={`w-full bg-transparent px-4 sm:px-5 py-5 text-[13px] sm:text-[14px] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-y border-none transition-colors ${isInline ? 'min-h-[100px]' : 'min-h-[140px]'}`} required />
                        <div className="absolute bottom-3 right-4 text-[9px] sm:text-[10px] font-medium text-zinc-400 dark:text-zinc-500 select-none border-none">{content.length}/2000</div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/80 border-none relative transition-colors">
                        {session?.user ? (
                            <>
                                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 border-none">
                                    {notification && <span className={`text-[11px] sm:text-[12px] font-medium animate-in fade-in border-none text-center ${notification.type === 'success' ? 'text-[#106EBE] dark:text-[#0FFCBE]' : 'text-red-500 dark:text-red-400'}`}>{notification.message}</span>}
                                </div>
                                {/* Tombol tanpa Captcha Dependency */}
                                <button type="submit" disabled={isSubmitting || !content.trim()} className="w-full sm:w-auto bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] transition-all shadow-sm outline-none border-none shrink-0">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Comment
                                </button>
                            </>
                        ) : (
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-[11px] sm:text-[12px] font-medium text-zinc-500 dark:text-zinc-400 text-center sm:text-left flex-1">Sign in safely with Google to post your comment.</span>
                                <button type="button" onClick={() => setIsLoginModalOpen(true)} className="w-full sm:w-auto bg-white dark:bg-white hover:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-xl flex items-center justify-center gap-2.5 font-bold text-[13px] transition-all shadow-sm outline-none border border-zinc-200 dark:border-transparent shrink-0 cursor-pointer">
                                    <LogIn className="w-4 h-4" /> Sign in to Post
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="w-full mt-6 mb-8 font-sans">
            <ModalLogin isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} supabase={supabase} />
            {!replyTo && renderAuthOrForm(false)}
            <div className="flex items-center justify-between mb-8 pb-2 border-none">
                <div className="flex items-center gap-2 border-none">
                    <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-white transition-colors" />
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight transition-colors">Comments</h3>
                    <span className="bg-zinc-200 dark:bg-zinc-800/60 text-[#106EBE] dark:text-[#0FFCBE] text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full border-none transition-colors">{safeComments.length}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors border-none">
                    Newest First <ChevronDown className="w-4 h-4" />
                </div>
            </div>
            <div className="flex flex-col gap-6 border-none">
                {mainComments.length > 0 ? (
                    mainComments.map((comment) => {
                        const userProfile = userProfiles[comment.email] || {};
                        const isAdmin = userProfile.is_admin;
                        const isPremium = userProfile.is_premium;
                        return (
                            <div key={comment.id} className="flex flex-col gap-3 border-none">
                                <div className={`flex gap-3 sm:gap-4 group border-none transition-all duration-500 ${comment.status === 'pending' ? 'opacity-50' : ''}`}>
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                                        <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800/60 flex items-center justify-center shadow-sm dark:shadow-md overflow-hidden border-none transition-colors">
                                            {comment.avatar_url ? (
                                                <img src={comment.avatar_url} alt={comment.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <span className="text-zinc-500 dark:text-zinc-300 font-black text-sm sm:text-base border-none transition-colors">{getInitial(comment.name)}</span>
                                            )}
                                        </div>
                                        {isAdmin ? (
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm" title="Verified Admin"><BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#106EBE] dark:text-[#0FFCBE] fill-white dark:fill-[#106EBE]" /></div>
                                        ) : isPremium ? (
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm" title="Premium VIP Member"><Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500/20" /></div>
                                        ) : null}
                                    </div>
                                    <div className={`flex-1 min-w-0 flex flex-col p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] border-none transition-colors ${isAdmin ? 'bg-gradient-to-br from-white dark:from-zinc-800/80 to-[#106EBE]/5 dark:to-[#106EBE]/20 shadow-sm dark:shadow-[0_5px_20px_rgba(16,110,190,0.15)]' : isPremium ? 'bg-gradient-to-br from-white dark:from-zinc-800/80 to-amber-500/5 dark:to-amber-500/10 shadow-sm dark:shadow-[0_5px_15px_rgba(245,158,11,0.1)]' : 'bg-white dark:bg-zinc-800/60 shadow-sm dark:shadow-none'}`}>
                                        <div className="flex items-center flex-wrap gap-2 mb-2 border-none">
                                            <span className={`text-[13px] sm:text-[14px] font-bold flex items-center gap-1.5 ${isAdmin ? 'text-[#106EBE] dark:text-[#0FFCBE]' : isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>{comment.name}</span>
                                            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-400 border-none transition-colors">{timeAgo(comment.created_at)}</span>
                                            {comment.status === 'pending' && <span className="px-2 py-0.5 rounded-[6px] text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-amber-500 text-white shadow-sm border-none transition-colors animate-pulse">Menunggu Persetujuan</span>}
                                        </div>
                                        <div className="text-[12px] sm:text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words border-none transition-colors" dangerouslySetInnerHTML={{ __html: parseMarkdown(comment.content) }} />
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-none">
                                            <button onClick={() => handleReplyClick(comment)} className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-bold hover:text-[#106EBE] dark:hover:text-[#0FFCBE] transition-colors outline-none border-none">Reply</button>
                                        </div>
                                    </div>
                                </div>
                                {replyTo && replyTo.id === comment.id && <div className="ml-10 sm:ml-16 animate-in slide-in-from-top-2 fade-in duration-300 border-none">{renderAuthOrForm(true)}</div>}
                                {getReplies(comment.id).length > 0 && (
                                    <div className="flex flex-col gap-4 mt-1 ml-10 sm:ml-16 border-none">
                                        {getReplies(comment.id).map(reply => {
                                            const replyProfile = userProfiles[reply.email] || {};
                                            const isReplyAdmin = replyProfile.is_admin;
                                            const isReplyPremium = replyProfile.is_premium;
                                            return (
                                                <div key={reply.id} className="flex flex-col gap-3 border-none">
                                                    <div className={`flex gap-2.5 sm:gap-3 group border-none transition-all duration-500 ${reply.status === 'pending' ? 'opacity-50' : ''}`}>
                                                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                                                            <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden shadow-sm border-none transition-colors">
                                                                {reply.avatar_url ? <img src={reply.avatar_url} alt={reply.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="text-zinc-500 dark:text-zinc-300 font-bold text-[10px] sm:text-xs border-none transition-colors">{getInitial(reply.name)}</span>}
                                                            </div>
                                                            {isReplyAdmin ? <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm" title="Verified Admin"><BadgeCheck className="w-3.5 h-3.5 text-[#106EBE] dark:text-[#0FFCBE] fill-white dark:fill-[#106EBE]" /></div> : isReplyPremium ? <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-sm" title="Premium VIP Member"><Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" /></div> : null}
                                                        </div>
                                                        <div className={`flex-1 min-w-0 flex flex-col p-3 sm:p-4 rounded-xl sm:rounded-[1.2rem] border-none transition-colors ${isReplyAdmin ? 'bg-gradient-to-br from-white dark:from-zinc-800/60 to-[#106EBE]/5 dark:to-[#106EBE]/15 shadow-sm dark:shadow-[0_5px_15px_rgba(16,110,190,0.1)]' : isReplyPremium ? 'bg-gradient-to-br from-white dark:from-zinc-800/60 to-amber-500/5 dark:to-amber-500/10 shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800/40 shadow-sm dark:shadow-none'}`}>
                                                            <div className="flex items-center flex-wrap gap-2 mb-2 border-none">
                                                                <span className={`text-[11px] sm:text-[13px] font-bold ${isReplyAdmin ? 'text-[#106EBE] dark:text-[#0FFCBE]' : isReplyPremium ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>{reply.name}</span>
                                                                <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400 dark:text-zinc-400 border-none transition-colors">{timeAgo(reply.created_at)}</span>
                                                                {reply.status === 'pending' && <span className="px-2 py-0.5 rounded-[6px] text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-amber-500 text-white shadow-sm border-none transition-colors animate-pulse">Menunggu Persetujuan</span>}
                                                            </div>
                                                            <div className="text-[11px] sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words border-none transition-colors">
                                                                <span className="text-[#106EBE] font-bold mr-1 border-none">@{comment.name}</span><span dangerouslySetInnerHTML={{ __html: parseMarkdown(reply.content) }} />
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-3 pt-2 border-none"><button onClick={() => handleReplyClick(reply)} className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-bold hover:text-[#106EBE] dark:hover:text-[#0FFCBE] transition-colors outline-none border-none">Reply</button></div>
                                                        </div>
                                                    </div>
                                                    {replyTo && replyTo.id === reply.id && <div className="ml-10 sm:ml-13 animate-in slide-in-from-top-2 fade-in duration-300 border-none">{renderAuthOrForm(true)}</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-800/40 rounded-[1.5rem] border-none transition-colors shadow-sm dark:shadow-none">
                        <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30 dark:opacity-20 border-none" />
                        <p className="text-[12px] sm:text-sm font-medium border-none">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
}