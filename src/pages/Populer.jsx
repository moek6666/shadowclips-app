import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Play, Eye, Clock } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function Populer({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        document.title = "Trending & Populer | ShadowClips";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchPopularVideos = async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase.from('videos').select('*').order('views', { ascending: false, nullsFirst: false }).limit(24);

        if (error) throw new Error(error.message);
        return data || [];
    };

    const { data: videos = [], isLoading: loading } = useSWR(
        supabase ? 'populer_videos' : null,
        fetchPopularVideos,
        { revalidateOnFocus: false, dedupingInterval: 300000, keepPreviousData: true }
    );

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            {/* PENTING: px-0 untuk memaksa card menempel tepi di mobile, sm:px-8 untuk desktop */}
            <main className="max-w-[1440px] mx-auto px-0 sm:px-8 pt-28 pb-20 min-h-screen">
                
                {/* GRID: Menggunakan gap-y-6 di mobile agar jaraknya hanya atas-bawah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-6 sm:gap-6 md:gap-y-8 md:gap-x-6">
                    {loading ? (
                        Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col w-full">
                                {/* Skeleton Gambar: rounded-none di mobile */}
                                <div className="w-full aspect-video bg-zinc-200 dark:bg-zinc-800/50 rounded-none sm:rounded-[4px] transition-colors"></div>
                                {/* Skeleton Teks: Rata tengah dengan ruang px-4 */}
                                <div className="px-4 sm:px-0 mt-3 w-full flex flex-col items-center gap-1.5">
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800/50 rounded w-[90%] transition-colors"></div>
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800/50 rounded w-2/3 transition-colors"></div>
                                </div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((video) => (
                            <div key={video.id} onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer flex flex-col w-full">

                                {/* GAMBAR CARD: Lebar 100%, ujung siku-siku (rounded-none) khusus di mobile */}
                                <div className="relative w-full aspect-video rounded-none sm:rounded-[4px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-none transition-colors">
                                    <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <Play className="w-12 h-12 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                    </div>

                                    {video.duration && video.duration !== 'EMPTY' && (
                                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {video.duration}
                                        </div>
                                    )}
                                </div>

                                {/* JUDUL: Tetap ditengah (text-center) dan diberi ruang kiri-kanan (px-4) */}
                                <div className="px-4 sm:px-1 text-center mt-2.5">
                                    <h3 className="font-bold text-[14px] md:text-[14px] text-zinc-800 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2 leading-snug" title={video.title}>
                                        {video.title}
                                    </h3>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-zinc-500 border-none">Belum ada data populer.</div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}