import React, { useState, useEffect } from 'react';
import { Play, Loader2, Clock, Bot } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper untuk mengambil gambar pertama jika ada banyak link
const getImageUrl = (imgString) => (imgString ? imgString.split(',')[0].trim() : '');

export default function Ai({ supabase }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAiVideos = async () => {
            if (!supabase) return;
            try {
                // Logika: Memanggil video yang kolom 'category'-nya mengandung kata 'AI'
                const { data, error } = await supabase
                    .from('videos')
                    .select('*')
                    .ilike('category', '%AI%') 
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setVideos(data);
                }
            } catch (err) {
                console.error("Gagal memuat video AI:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAiVideos();
    }, [supabase]);

    const timeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((new Date() - date) / 1000);
        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}j`;
        return `${Math.floor(diffInSeconds / 86400)}h`;
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0E1116] text-zinc-900 dark:text-zinc-200 transition-colors duration-300">
            <Navbar isScrolled={true} supabase={supabase} />
            
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
                
                {/* Grid Konten */}
                {loading ? (
                    <div className="flex justify-center items-center h-[60vh] border-none">
                        <Loader2 className="w-8 h-8 animate-spin text-[#106EBE] border-none" />
                    </div>
                ) : videos.length > 0 ? (
                    /* PERBAIKAN: Mengurangi jumlah maksimal kolom (dari 6 ke 5) agar card lebih lebar secara horizontal */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 border-none mt-4">
                        {videos.map(vid => (
                            /* PERBAIKAN: Mengubah aspect-[9/16] menjadi aspect-[3/4] agar card tidak terlalu panjang ke bawah dan lebih proporsional */
                            <a href={`/streaming/${vid.slug || vid.id}`} key={vid.id} className="group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-[3/4] shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 outline-none border-none">
                                
                                {/* Gambar Cover Vertikal */}
                                <img src={getImageUrl(vid.img)} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 border-none" loading="lazy" />
                                
                                {/* Gradient Gelap di Bawah untuk teks */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 border-none pointer-events-none z-10"></div>
                                
                                {/* Tombol Play Hover */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                                    <Play className="w-12 h-12 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300 border-none" />
                                </div>

                                {/* Informasi Judul */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-none pointer-events-none z-30">
                                    <h3 className="text-[13px] sm:text-[14px] font-bold text-white line-clamp-2 leading-snug mb-2 drop-shadow-md border-none">{vid.title}</h3>
                                    
                                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-bold text-zinc-300 border-none">
                                        <span className="flex items-center gap-1 border-none">
                                            <Play className="w-3.5 h-3.5 border-none fill-zinc-300" /> 
                                            {vid.duration && vid.duration !== 'EMPTY' ? vid.duration : '--:--'}
                                        </span>
                                        
                                        <span className="flex items-center gap-1 border-none">
                                            <Clock className="w-3.5 h-3.5 border-none" /> 
                                            {timeAgo(vid.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-400 dark:text-zinc-500 border-none">
                        <Bot className="w-12 h-12 mb-3 opacity-20 border-none" />
                        <p className="font-bold text-[13px] border-none">Belum ada karya AI saat ini.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}