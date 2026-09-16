import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { FolderOpen, Loader2, ArrowUpRight } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

// Palet warna Pastel Soft & Muted dengan kontras teks tajam
const cardThemes = [
    { bg: 'bg-[#A8C3DA]', text: 'text-[#0F2338]', subtext: 'text-[#1E3A58]', btn: 'text-[#0F2338]' }, // Soft Steel Blue
    { bg: 'bg-[#A2E8DD]', text: 'text-[#044E3B]', subtext: 'text-[#067857]', btn: 'text-[#044E3B]' }, // Soft Mint
    { bg: 'bg-[#FAD7A0]', text: 'text-[#68320F]', subtext: 'text-[#884214]', btn: 'text-[#68320F]' }, // Soft Peach
    { bg: 'bg-[#D8B4F8]', text: 'text-[#3B0764]', subtext: 'text-[#581C87]', btn: 'text-[#3B0764]' }, // Soft Lavender
    { bg: 'bg-[#F8C4B4]', text: 'text-[#7C1235]', subtext: 'text-[#9F1239]', btn: 'text-[#7C1235]' }, // Soft Coral / Rose
    { bg: 'bg-[#C5E1A5]', text: 'text-[#14532D]', subtext: 'text-[#15803D]', btn: 'text-[#14532D]' }, // Soft Sage Green
];

export default function Jelajahi({ supabase }) {
    const [visibleCategories, setVisibleCategories] = useState(6);

    useEffect(() => {
        document.title = "Explore Categories | ShadowClips";
    }, []);

    const fetchSemuaKategori = async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(500);

        if (error) throw new Error(error.message);

        if (data) {
            const grouped = {};
            data.forEach(video => {
                let cats = [];
                if (!video.category) cats = ['Others'];
                else if (Array.isArray(video.category)) cats = video.category;
                else if (typeof video.category === 'string') cats = video.category.split(',').map(c => c.trim());

                cats.forEach(cat => {
                    if (!cat) return;
                    const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                    if (!grouped[formattedCat]) grouped[formattedCat] = [];
                    grouped[formattedCat].push(video);
                });
            });
            return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
        }
        return [];
    };

    const { data: kategoriData = [], isLoading: loading } = useSWR(
        supabase ? 'jelajahi_kategori' : null,
        fetchSemuaKategori,
        { revalidateOnFocus: false, dedupingInterval: 300000, keepPreviousData: true }
    );

    const handleLoadMore = () => {
        setVisibleCategories(prev => prev + 6);
    };

    const displayedCategories = kategoriData.slice(0, visibleCategories);
    const hasMore = visibleCategories < kategoriData.length;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#0E1116] transition-colors duration-300">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-[#106EBE] rounded-full animate-spin"></div>
                    </div>
                ) : displayedCategories.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        
                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {displayedCategories.map(([kategori, videos], index) => {
                                const heroVideo = videos[0];
                                const theme = cardThemes[index % cardThemes.length];

                                return (
                                    <a
                                        key={kategori}
                                        href={`/category/${encodeURIComponent(kategori)}`}
                                        className={`relative flex flex-col justify-between w-full min-h-[200px] md:min-h-[220px] rounded-[24px] lg:rounded-[28px] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 ${theme.bg} border-0 outline-none`}
                                    >
                                        {/* Container Gambar Kanan dengan Smooth Fade Masking */}
                                        {heroVideo && (
                                            <div className="absolute top-0 right-0 w-[65%] md:w-[60%] h-full z-0 pointer-events-none">
                                                <div 
                                                    className="w-full h-full"
                                                    style={{ 
                                                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
                                                        maskImage: 'linear-gradient(to right, transparent 0%, black 45%)'
                                                    }}
                                                >
                                                    <img
                                                        src={getImageUrl(heroVideo.img)}
                                                        alt={kategori}
                                                        className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Container Teks Kiri - Kontras Tinggi Agar Jelas */}
                                        <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-8 w-[60%] md:w-[55%]">
                                            <div>
                                                <h2 className={`text-2xl md:text-[28px] font-extrabold leading-tight break-words line-clamp-2 ${theme.text}`}>
                                                    {kategori}
                                                </h2>
                                                <p className={`text-xs md:text-sm font-bold mt-2 tracking-wide ${theme.subtext}`}>
                                                    {videos.length} KONTEN
                                                </p>
                                            </div>

                                            <div className={`flex items-center gap-2 text-[11px] md:text-xs font-black tracking-[0.2em] uppercase mt-6 ${theme.btn} group-hover:translate-x-1.5 transition-all duration-300`}>
                                                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
                                                EXPLORE
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>

                        {/* Tombol Load More */}
                        {hasMore && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={handleLoadMore}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold rounded-full transition-colors outline-none border-0 cursor-pointer"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500 hidden" />
                                    Tampilkan Lebih Banyak
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 py-32 bg-zinc-100 dark:bg-zinc-900/40 rounded-[28px] mx-4 transition-colors">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">Belum ada kategori tersedia.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}