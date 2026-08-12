import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Heart, User, X } from 'lucide-react';

export default function Komentar({ videoId, onCommentSuccess }) {
    const [comments, setComments] = useState([]);

    const [formData, setFormData] = useState(() => {
        return {
            name: typeof window !== 'undefined' ? localStorage.getItem('shadowclips_user_name') || '' : '',
            email: typeof window !== 'undefined' ? localStorage.getItem('shadowclips_user_email') || '' : '',
            content: ''
        };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
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
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'content' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleReplyClick = (comment) => {
        setReplyTo(comment);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }, 50);
    };

    const cancelReply = () => {
        setReplyTo(null);
        setFormData(prev => ({ ...prev, content: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.content) return;

        // ==========================================
        // VALIDASI GMAIL KETAT (ANTI SPAM)
        // ==========================================
        if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
            setNotification({ type: 'error', message: 'Please use a valid Gmail address.' });
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
                content: formData.content,
                parent_id: targetParentId
            });

        setIsSubmitting(false);

        if (error) {
            console.error("Supabase Error:", error.message);
            setNotification({ type: 'error', message: 'Failed to send. Try again.' });
        } else {
            const newPendingComment = {
                id: `temp-${Date.now()}`,
                name: formData.name,
                content: formData.content,
                created_at: new Date().toISOString(),
                status: 'pending',
                parent_id: targetParentId
            };

            setComments(prev => [newPendingComment, ...prev]);
            setNotification({ type: 'success', message: 'Sent! Awaiting moderation.' });

            localStorage.setItem('shadowclips_user_name', formData.name);
            localStorage.setItem('shadowclips_user_email', formData.email);

            const existingPending = JSON.parse(localStorage.getItem(`shadowclips_pending_${videoId}`) || '[]');
            localStorage.setItem(`shadowclips_pending_${videoId}`, JSON.stringify([newPendingComment, ...existingPending]));

            setFormData(prev => ({ ...prev, content: '' }));
            setReplyTo(null);

            localStorage.setItem(`shadowclips_commented_${videoId}`, 'true');
            if (onCommentSuccess) onCommentSuccess();

            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '';

    const mainComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => {
        return comments
            .filter(c => c.parent_id === parentId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    };

    const renderForm = (isInline = false) => (
        <form onSubmit={handleSubmit} className={`flex gap-3 sm:gap-4 relative ${isInline ? 'mt-3 mb-2' : 'mb-10'}`}>
            <div className={`rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 ${isInline ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-8 h-8 sm:w-9 sm:h-9'}`}>
                <User className={`${isInline ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} text-zinc-300`} />
            </div>

            <div className="flex-1 min-w-0 bg-zinc-900/50 p-3 sm:p-4 rounded-xl border-none focus-within:bg-zinc-800/80 transition-colors shadow-lg">

                {replyTo && (
                    <div className="flex items-center justify-between bg-[#106EBE]/10 text-[#106EBE] px-3 py-1.5 rounded-md text-[12px] font-bold mb-3 border-none">
                        <span>Replying to @{replyTo.name}</span>
                        <button type="button" onClick={cancelReply} className="hover:bg-[#106EBE]/20 p-1 rounded-full transition-colors border-none">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <textarea
                    ref={textareaRef}
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder={replyTo ? `Write a reply to ${replyTo.name}...` : "Add a comment..."}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-transparent text-[13px] sm:text-[14px] text-white placeholder-zinc-500 focus:outline-none resize-none overflow-hidden transition-colors border-none"
                    rows="1"
                    required
                />

                <div className={`overflow-hidden transition-all duration-500 ease-in-out border-none ${formData.content.length > 0 || replyTo ? 'max-h-40 opacity-100 mt-3 pt-3' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4 border-none">
                        <div className="w-full sm:flex-1 flex flex-col sm:flex-row gap-3 border-none">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your Name"
                                style={{ colorScheme: 'dark' }}
                                className="w-full bg-zinc-950/50 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-zinc-500 focus:outline-none transition-colors border-none"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email (Required)"
                                style={{ colorScheme: 'dark' }}
                                className="w-full bg-zinc-950/50 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-zinc-500 focus:outline-none transition-colors border-none"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-end w-full sm:w-auto mt-1 sm:mt-0 border-none">
                            {notification && (
                                <span className={`text-[11px] sm:text-[12px] mr-3 font-medium animate-in fade-in ${notification.type === 'success' ? 'text-[#0FFCBE]' : 'text-red-400'}`}>
                                    {notification.message}
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.name || !formData.email}
                                className="bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-800 text-white text-[12px] sm:text-[13px] font-bold py-2 px-5 rounded-lg transition-all flex items-center justify-center min-w-[70px] border-none"
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );

    return (
        <div className="w-full mt-4 mb-10 px-2 sm:px-0">
            <h3 className="text-[14px] font-bold text-white mb-5">
                {comments.length} Comments
            </h3>

            {!replyTo && renderForm(false)}

            <div className="space-y-6 border-none">
                {mainComments.length > 0 && mainComments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-3 border-none">
                        <div className={`flex gap-3 sm:gap-4 group border-none ${comment.status === 'pending' ? 'opacity-70' : ''}`}>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 border-none">
                                <span className="text-zinc-200 font-bold text-[12px] sm:text-[13px]">{getInitial(comment.name)}</span>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col border-none">
                                <span className="text-[12px] sm:text-[13px] font-bold text-zinc-300 flex items-center flex-wrap border-none">
                                    {comment.name}
                                    <span className="font-normal text-zinc-500 ml-1">· {timeAgo(comment.created_at)}</span>
                                    {comment.status === 'pending' && (
                                        <span className="ml-2 px-1.5 py-[1px] rounded text-[9px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-500 border-none">Pending</span>
                                    )}
                                </span>
                                <p className="text-[13px] sm:text-[14px] text-white mt-0.5 leading-relaxed whitespace-pre-wrap break-words pr-2 border-none">
                                    {comment.content}
                                </p>
                                <div className="flex items-center gap-4 mt-1.5 border-none">
                                    <button onClick={() => handleReplyClick(comment)} className="text-[11px] sm:text-[12px] text-zinc-500 font-bold hover:text-white transition-colors border-none">Reply</button>
                                </div>
                            </div>
                        </div>
                        {replyTo && replyTo.id === comment.id && (
                            <div className="ml-11 sm:ml-13 animate-in fade-in slide-in-from-top-2 duration-300 border-none">
                                {renderForm(true)}
                            </div>
                        )}
                        {getReplies(comment.id).length > 0 && (
                            <div className="flex flex-col gap-4 mt-1 ml-11 sm:ml-13 border-l-2 border-zinc-800 pl-4 sm:pl-5">
                                {getReplies(comment.id).map(reply => (
                                    <div key={reply.id} className="flex flex-col gap-3 border-none">
                                        <div className={`flex gap-3 group border-none ${reply.status === 'pending' ? 'opacity-70' : ''}`}>
                                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 border-none">
                                                <span className="text-zinc-200 font-bold text-[10px] sm:text-[11px]">{getInitial(reply.name)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col border-none">
                                                <span className="text-[11px] sm:text-[12px] font-bold text-zinc-300 flex items-center flex-wrap border-none">
                                                    {reply.name}
                                                    <span className="font-normal text-zinc-500 ml-1">· {timeAgo(reply.created_at)}</span>
                                                    {reply.status === 'pending' && (
                                                        <span className="ml-2 px-1.5 py-[1px] rounded text-[8px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-500 border-none">Pending</span>
                                                    )}
                                                </span>
                                                <p className="text-[12px] sm:text-[13px] text-white mt-0.5 leading-relaxed whitespace-pre-wrap break-words pr-2 border-none">
                                                    <span className="text-[#106EBE] font-semibold mr-1">@{comment.name}</span>
                                                    {reply.content}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1.5 border-none">
                                                    <button onClick={() => handleReplyClick(reply)} className="text-[10px] sm:text-[11px] text-zinc-500 font-bold hover:text-white transition-colors border-none">Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                        {replyTo && replyTo.id === reply.id && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-none">
                                                {renderForm(true)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}