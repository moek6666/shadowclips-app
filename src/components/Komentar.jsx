import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Heart, User } from 'lucide-react';

export default function Komentar({ videoId }) {
    const [comments, setComments] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
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
                setComments(data);
            }
        };
        fetchComments();
    }, [videoId]);

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}mnt`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}j`;
        return `${Math.floor(diffInSeconds / 86400)}h`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'content' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.content) return;

        setIsSubmitting(true);
        setNotification(null);

        // PERBAIKAN: Menggunakan format Object { } langsung, tanpa kurung siku [ ]
        // dan menghapus status (dibiarkan default 'pending' dari database)
        const { error } = await supabase
            .from('comments')
            .insert({
                video_id: String(videoId),
                name: formData.name,
                email: formData.email ? formData.email : null,
                content: formData.content
            });

        setIsSubmitting(false);

        if (error) {
            console.error("Supabase Error:", error.message);
            setNotification({ type: 'error', message: 'Gagal mengirim. Coba lagi.' });
        } else {
            setNotification({ type: 'success', message: 'Terkirim! Menunggu moderasi.' });
            setFormData({ name: '', email: '', content: '' });
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '';

    return (
        <div className="w-full mt-4 mb-10 px-2 sm:px-0">

            <h3 className="text-[14px] font-bold text-white mb-5">
                {comments.length} Komentar
            </h3>

            {/* Form Komentar */}
            <form onSubmit={handleSubmit} className="mb-8 flex gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
                </div>

                <div className="flex-1 min-w-0">
                    <textarea
                        ref={textareaRef}
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Tambahkan komentar..."
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-transparent text-[13px] sm:text-[14px] text-white placeholder-zinc-500 border-b border-zinc-700 focus:border-zinc-400 focus:outline-none pb-2 resize-none overflow-hidden transition-colors"
                        rows="1"
                        required
                    />

                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${formData.content.length > 0 ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4">
                            <div className="w-full sm:flex-1 flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nama Anda"
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full bg-transparent border-b border-zinc-700 text-[13px] text-white placeholder-zinc-500 focus:border-[#106EBE] focus:outline-none pb-1.5 transition-colors autofill:bg-transparent"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email (Opsional)"
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full bg-transparent border-b border-zinc-700 text-[13px] text-white placeholder-zinc-500 focus:border-[#106EBE] focus:outline-none pb-1.5 transition-colors"
                                />
                            </div>

                            <div className="flex items-center justify-end w-full sm:w-auto mt-1 sm:mt-0">
                                {notification && (
                                    <span className={`text-[11px] sm:text-[12px] mr-3 font-medium animate-in fade-in ${notification.type === 'success' ? 'text-[#0FFCBE]' : 'text-red-400'}`}>
                                        {notification.message}
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.name}
                                    className="bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-800 text-white text-[12px] sm:text-[13px] font-bold py-1.5 px-4 sm:px-5 rounded-full transition-all flex items-center justify-center min-w-[70px]"
                                >
                                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Kirim'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Daftar Komentar */}
            <div className="space-y-5">
                {comments.length > 0 && comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 sm:gap-4 group">

                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-zinc-200 font-bold text-[12px] sm:text-[13px]">{getInitial(comment.name)}</span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-[12px] sm:text-[13px] font-bold text-zinc-300">
                                {comment.name} <span className="font-normal text-zinc-500 ml-1">· {timeAgo(comment.created_at)}</span>
                            </span>

                            <p className="text-[13px] sm:text-[14px] text-white mt-0.5 leading-relaxed whitespace-pre-wrap break-words pr-2">
                                {comment.content}
                            </p>

                            <div className="flex items-center gap-4 mt-1.5">
                                <button className="text-[11px] sm:text-[12px] text-zinc-500 font-semibold hover:text-white transition-colors">
                                    Balas
                                </button>
                            </div>
                        </div>

                        <div className="shrink-0 pt-2 px-1 cursor-pointer text-zinc-500 hover:text-red-500 transition-colors">
                            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}