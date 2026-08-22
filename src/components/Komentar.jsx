import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Send, MessageSquare, ChevronDown, Bold, Italic, Code, Link as LinkIcon, Quote, X, BadgeCheck, Crown, LogIn } from 'lucide-react';
import ModalLogin from './ModalLogin';
import Avatar from './Avatar';

// ==========================================
// 🔥 DATABASE EMOJI 3D (STABIL & ANTI-BROKEN) 🔥
// ==========================================
const animatedEmojis = {
    ':love:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Heart-Eyes.png',
    ':api:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fire.png',
    ':ketawa:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Rolling%20on%20the%20Floor%20Laughing.png',
    ':jempol:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Thumbs%20Up.png',
    ':marah:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Angry%20Face.png',
    ':mahkota:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Crown.png',
};

const topEmojis = [
    { code: ':love:', url: animatedEmojis[':love:'] },
    { code: ':api:', url: animatedEmojis[':api:'] },
    { code: ':ketawa:', url: animatedEmojis[':ketawa:'] },
    { code: ':jempol:', url: animatedEmojis[':jempol:'] },
    { code: ':marah:', url: animatedEmojis[':marah:'] },
    { code: ':mahkota:', url: animatedEmojis[':mahkota:'] },
];

// 🔥 DATABASE SENSOR KATA KASAR / SENSITIF (Bisa Bos tambah sendiri nanti) 🔥
const BAD_WORDS = [
    'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot',
    'goblok', 'tolol', 'bajingan', 'pepek', 'asu', 'jembut', 'peler', 'lonte'
];

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
            const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
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
            if (animatedEmojis[match]) return `<img src="${animatedEmojis[match]}" alt="${match}" title="${match}" class="inline-block w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] object-contain shrink-0 align-middle drop-shadow-sm hover:scale-125 transition-transform duration-300 border-none select-none mx-0.5" draggable="false" />`;
            return match;
        });
        return html;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user || !content.trim()) return;

        setIsSubmitting(true);
        setNotification(null);

        const targetParentId = replyTo ? (replyTo.parent_id || replyTo.id) : null;
        const isAdmin = profile?.is_admin || false;
        const userEmail = session.user.email;
        const userName = profile?.name || userEmail.split('@')[0];

        // 🔥 SISTEM AUTO-FILTER & AUTO-APPROVE KELAS DEWA 🔥
        const contentLower = content.toLowerCase();
        const isContentSensitive = BAD_WORDS.some(word => contentLower.includes(word));

        let statusKomentar = 'pending';
        let notifMessage = '';
        let isErrorNotif = false;

        if (isAdmin) {
            // Admin kebal filter, langsung tayang
            statusKomentar = 'approved';
            notifMessage = 'Komentar Admin berhasil ditayangkan!';
        } else if (isContentSensitive) {
            // User menggunakan kata kotor/sensitif, masuk antrean pending
            statusKomentar = 'pending';
            notifMessage = '⚠️ Mengandung kata sensitif. Menunggu moderasi Admin.';
            isErrorNotif = true; // Menggunakan warna merah/peringatan
        } else {
            // User baik-baik, langsung AUTO-APPROVE! Bos tidak perlu repot.
            statusKomentar = 'approved';
            notifMessage = 'Komentar berhasil ditayangkan!';
        }

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

            // Masukkan ke state UI (Jika statusnya pending, UI akan memberinya efek buram sementara)
            setComments(prev => [insertedData, ...(prev || [])]);

            setUserProfiles(prev => ({
                ...prev,
                [userEmail]: {
                    email: userEmail,
                    is_admin: profile?.is_admin || false,
                    is_premium: profile?.is_premium || false,
                    active_frame: profile?.active_frame || 'none'
                }
            }));

            // Tambah Poin jika bukan admin
            if (!isAdmin) {
                await supabase.rpc('increment_user_points', { p_email: userEmail, p_points: 5 }).catch(() => { });
            }

            // Tampilkan Notifikasi Sesuai Kondisi Filter
            setNotification({ type: isErrorNotif ? 'error' : 'success', message: notifMessage });
            setTimeout(() => setNotification(null), 4000);

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
                            <div className="flex items-center gap-4 border-none">
                                {/* AVATAR FORM INPUT */}
                                <div className="relative shrink-0 flex items-center justify-center border-none">
                                    <Avatar url={profile?.avatar_url} frameId={profile?.active_frame} containerClass="w-12 h-12 sm:w-14 sm:h-14" scale={0.56} />
                                </div>
                                <div className="flex flex-col border-none">
                                    <span className="text-[13px] sm:text-[15px] font-bold text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5 transition-colors border-none">
                                        {userName}
                                        {isMeAdmin && (
                                            <span className="flex items-center gap-1 bg-[#106EBE] text-white text-[9px] font-black pl-1.5 pr-1 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-sm border-none">
                                                ADMIN <BadgeCheck className="w-[11px] h-[11px] text-[#106EBE] fill-white border-none" />
                                            </span>
                                        )}
                                        {isMePremium && !isMeAdmin && (
                                            <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-[9px] font-black pl-1.5 pr-1 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-sm border-none">
                                                VIP <Crown className="w-[11px] h-[11px] text-amber-950 fill-amber-950/20 border-none" />
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] sm:max-w-none transition-colors border-none">{session.user.email}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-none">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shadow-md border-none transition-colors">
                                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 border-none" />
                                </div>
                                <div className="flex flex-col border-none">
                                    <span className="text-[13px] sm:text-[15px] font-bold text-zinc-800 dark:text-zinc-300 leading-tight transition-colors border-none">Guest Mode</span>
                                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 transition-colors border-none">Sign in is required to post a comment</span>
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

                        <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-600 mx-1 shrink-0 transition-colors border-none"></div>

                        <div className="flex items-center gap-3 ml-1 flex-1 border-none">
                            {topEmojis.map((emoji) => (
                                <button key={emoji.code} type="button" onClick={() => insertEmoji(emoji.code)} className="hover:scale-125 transition-transform duration-300 outline-none border-none shrink-0" title={emoji.code.replace(/:/g, '')}>
                                    <img src={emoji.url} className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] object-contain shrink-0 drop-shadow-sm border-none select-none" alt={emoji.code} draggable="false" />
                                </button>
                            ))}
                        </div>

                        {replyTo && (
                            <div className="ml-auto flex items-center gap-2 bg-[#106EBE]/10 dark:bg-[#106EBE]/20 text-[#106EBE] px-3 py-1 rounded-lg border-none shrink-0">
                                <span className="text-[10px] sm:text-[11px] font-bold truncate max-w-[100px] sm:max-w-[150px] border-none">Replying to @{replyTo.name}</span>
                                <button type="button" onClick={cancelReply} className="hover:bg-[#106EBE]/20 dark:hover:bg-[#106EBE]/30 rounded-full p-0.5 outline-none border-none"><X className="w-3.5 h-3.5 border-none" /></button>
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
                                    {notification && <span className={`text-[11px] sm:text-[12px] font-bold animate-in fade-in border-none text-center ${notification.type === 'success' ? 'text-[#106EBE] dark:text-[#0FFCBE]' : 'text-red-500 dark:text-red-400'}`}>{notification.message}</span>}
                                </div>
                                <button type="submit" disabled={isSubmitting || !content.trim()} className="w-full sm:w-auto bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] transition-all shadow-sm outline-none border-none shrink-0 cursor-pointer">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin border-none" /> : <Send className="w-4 h-4 border-none" />} Post Comment
                                </button>
                            </>
                        ) : (
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-none">
                                <span className="text-[11px] sm:text-[12px] font-medium text-zinc-500 dark:text-zinc-400 text-center sm:text-left flex-1 border-none">Sign in safely with Google to post your comment.</span>
                                <button type="button" onClick={() => setIsLoginModalOpen(true)} className="w-full sm:w-auto bg-white dark:bg-white hover:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-xl flex items-center justify-center gap-2.5 font-bold text-[13px] transition-all shadow-sm outline-none border border-zinc-200 dark:border-transparent shrink-0 cursor-pointer">
                                    <LogIn className="w-4 h-4 border-none" /> Sign in to Post
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="w-full mt-6 mb-8 font-sans border-none">
            <ModalLogin isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} supabase={supabase} />
            {!replyTo && renderAuthOrForm(false)}
            <div className="flex items-center justify-between mb-8 pb-2 border-none">
                <div className="flex items-center gap-2 border-none">
                    <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-white transition-colors border-none" />
                    <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight transition-colors border-none">Comments</h3>
                    <span className="bg-zinc-200 dark:bg-zinc-800/60 text-[#106EBE] dark:text-[#0FFCBE] text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full border-none transition-colors">{safeComments.length}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors border-none">
                    Newest First <ChevronDown className="w-4 h-4 border-none" />
                </div>
            </div>

            <div className="flex flex-col gap-6 border-none">
                {mainComments.length > 0 ? (
                    mainComments.map((comment) => {
                        const userProfile = userProfiles[comment.email] || {};
                        const isAdmin = userProfile.is_admin;
                        const isPremium = userProfile.is_premium;
                        const frameId = userProfile.active_frame || 'none';

                        return (
                            <div key={comment.id} className="flex flex-col gap-3 border-none">
                                <div className={`flex gap-3 sm:gap-4 group border-none transition-all duration-500 ${comment.status === 'pending' ? 'opacity-50' : ''}`}>

                                    <div className="relative shrink-0 flex items-start sm:items-center justify-center border-none">
                                        <Avatar url={comment.avatar_url} frameId={frameId} containerClass="w-12 h-12 sm:w-14 sm:h-14 mt-1 sm:mt-0" scale={0.56} />
                                    </div>

                                    <div className={`flex-1 min-w-0 flex flex-col p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] border-none transition-colors ${isAdmin ? 'bg-[#106EBE]/5 dark:bg-[#106EBE]/10 border border-[#106EBE]/20 dark:border-transparent shadow-sm dark:shadow-[0_5px_20px_rgba(16,110,190,0.15)]' : isPremium ? 'bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-transparent shadow-sm dark:shadow-[0_5px_15px_rgba(245,158,11,0.1)]' : 'bg-white dark:bg-zinc-800/60 shadow-sm dark:shadow-none border border-transparent'}`}>
                                        <div className="flex items-center flex-wrap gap-2 mb-2 border-none">
                                            <span className={`text-[13px] sm:text-[15px] font-bold flex items-center flex-wrap gap-1.5 border-none ${isAdmin ? 'text-[#106EBE] dark:text-[#0FFCBE]' : isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>
                                                {comment.name}
                                                {isAdmin && (
                                                    <span className="flex items-center gap-1 bg-[#106EBE] text-white text-[9px] font-black pl-1.5 pr-1 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-sm border-none">
                                                        ADMIN <BadgeCheck className="w-[11px] h-[11px] text-[#106EBE] fill-white border-none" />
                                                    </span>
                                                )}
                                                {isPremium && !isAdmin && (
                                                    <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-[9px] font-black pl-1.5 pr-1 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-sm border-none">
                                                        VIP <Crown className="w-[11px] h-[11px] text-amber-950 fill-amber-950/20 border-none" />
                                                    </span>
                                                )}
                                            </span>

                                            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-400 border-none transition-colors">{timeAgo(comment.created_at)}</span>
                                            {comment.status === 'pending' && <span className="px-2 py-0.5 rounded-[6px] text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-amber-500 text-white shadow-sm border-none transition-colors animate-pulse">Menunggu Persetujuan</span>}
                                        </div>
                                        <div className="text-[12px] sm:text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words border-none transition-colors" dangerouslySetInnerHTML={{ __html: parseMarkdown(comment.content) }} />
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-none">
                                            <button onClick={() => handleReplyClick(comment)} className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-bold hover:text-[#106EBE] dark:hover:text-[#0FFCBE] transition-colors outline-none border-none cursor-pointer">Reply</button>
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
                                            const replyFrameId = replyProfile.active_frame || 'none';

                                            return (
                                                <div key={reply.id} className="flex flex-col gap-3 border-none">
                                                    <div className={`flex gap-2.5 sm:gap-3 group border-none transition-all duration-500 ${reply.status === 'pending' ? 'opacity-50' : ''}`}>

                                                        <div className="relative shrink-0 flex items-start sm:items-center justify-center border-none">
                                                            <Avatar url={reply.avatar_url} frameId={replyFrameId} containerClass="w-10 h-10 sm:w-12 sm:h-12 mt-0.5 sm:mt-0" scale={0.48} />
                                                        </div>

                                                        <div className={`flex-1 min-w-0 flex flex-col p-3 sm:p-4 rounded-xl sm:rounded-[1.2rem] border-none transition-colors ${isReplyAdmin ? 'bg-[#106EBE]/5 dark:bg-[#106EBE]/10 border border-[#106EBE]/20 dark:border-transparent shadow-sm dark:shadow-[0_5px_15px_rgba(16,110,190,0.1)]' : isReplyPremium ? 'bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-transparent shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800/40 shadow-sm dark:shadow-none border border-transparent'}`}>
                                                            <div className="flex items-center flex-wrap gap-2 mb-2 border-none">
                                                                <span className={`text-[11px] sm:text-[14px] font-bold flex items-center flex-wrap gap-1.5 border-none ${isReplyAdmin ? 'text-[#106EBE] dark:text-[#0FFCBE]' : isReplyPremium ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>
                                                                    {reply.name}
                                                                    {isReplyAdmin && (
                                                                        <span className="flex items-center gap-1 bg-[#106EBE] text-white text-[9px] font-black pl-1.5 pr-1 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-sm border-none">
                                                                            ADMIN <BadgeCheck className="w-[11px] h-[11px] text-[#106EBE] fill-white border-none" />
                                                                        </span>
                                                                    )}
                                                                    {isReplyPremium && !isReplyAdmin && (
                                                                        <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-[9px] font-black pl-1.5 pr-1 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-sm border-none">
                                                                            VIP <Crown className="w-[11px] h-[11px] text-amber-950 fill-amber-950/20 border-none" />
                                                                        </span>
                                                                    )}
                                                                </span>

                                                                <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400 dark:text-zinc-400 border-none transition-colors">{timeAgo(reply.created_at)}</span>
                                                                {reply.status === 'pending' && <span className="px-2 py-0.5 rounded-[6px] text-[9px] sm:text-[10px] uppercase tracking-widest font-black bg-amber-500 text-white shadow-sm border-none transition-colors animate-pulse">Menunggu Persetujuan</span>}
                                                            </div>
                                                            <div className="text-[11px] sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words border-none transition-colors">
                                                                <span className="text-[#106EBE] font-bold mr-1 border-none">@{comment.name}</span> <span dangerouslySetInnerHTML={{ __html: parseMarkdown(reply.content) }} />
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-3 pt-2 border-none"><button onClick={() => handleReplyClick(reply)} className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-bold hover:text-[#106EBE] dark:hover:text-[#0FFCBE] transition-colors outline-none border-none cursor-pointer">Reply</button></div>
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