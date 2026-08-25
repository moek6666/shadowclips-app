import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Play, Eye, Clock, Search, ChevronDown } from 'lucide-react';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import IklanCustom from '../../components/IklanCustom';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function DetailCategory({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [categoryName, setCategoryName] = useState('');

    const [visibleCount, setVisibleCount] = useState(24);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        let currentCategory = decodeURIComponent(pathParts[2] || '');

        if (!currentCategory) {
            window.location.href = '/';
            return;
        }

        currentCategory = currentCategory.replace(/-/g, ' ');
        setCategoryName(currentCategory);

        const displayTitle = currentCategory.replace(/\b\w/g, char => char.toUpperCase());
        document.title = `${displayTitle} | ShadowClips`;
    }, []);

    const fetchCategoryVideos = async (catName) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase.from('videos').select('*').ilike('category', `%${catName}%`).order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data || [];
    };

    const { data: videos = [], isLoading: loading } = useSWR(
        categoryName && supabase ? ['category_videos', categoryName] : null,
        () => fetchCategoryVideos(categoryName),
        { revalidateOnFocus: false, dedupingInterval: 300000, keepPreviousData: true }
    );

    const displayedVideos = videos.slice(0, visibleCount);

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen flex flex-col transition-colors border-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-y-8 md:gap-x-6 flex-grow border-none">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col gap-2 border-none">
                                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800/50 rounded-[4px] transition-colors border-none"></div>
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800/50 rounded w-full transition-colors border-none"></div>
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800/50 rounded w-2/3 mx-auto transition-colors border-none"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        <>
                            {displayedVideos.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <div onClick={() => window.location.href = `/streaming/${item.slug || item.id}`} className="group cursor-pointer flex flex-col gap-2 border-none">

                                        <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-none transition-colors shadow-sm">
                                            <img src={getImageUrl(item.img)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 border-none" loading="lazy" />

                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 border-none">
                                                <Play className="w-12 h-12 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300 border-none" />
                                            </div>

                                            {item.duration && item.duration !== 'EMPTY' && (
                                                <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none border-none">
                                                    <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 border-none" /> {item.duration}
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-1 text-center border-none">
                                            {/* 🔥 PERBAIKAN: Hover warna teks dihapus agar tetap rapi karena sudah ada efek zoom pada gambar 🔥 */}
                                            <h3 className="font-bold text-[13px] md:text-[14px] text-zinc-800 dark:text-zinc-300 transition-colors line-clamp-2 leading-snug border-none" title={item.title}>
                                                {item.title}
                                            </h3>
                                        </div>

                                    </div>

                                    {/* 🔥 IKLAN BANNER (HANYA TAMPIL 1 KALI SETELAH VIDEO KE-8) 🔥 */}
                                    {index === 7 && (
                                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 flex items-center justify-center py-4 sm:py-6 border-none w-full">
                                            <IklanCustom
                                                imgUrl="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/Tiger.webp"
                                                className="!max-w-[500px] w-full"
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}

                            {visibleCount < videos.length && (
                                <div className="col-span-full flex justify-center mt-6 mb-4 border-none">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 8)}
                                        className="bg-white dark:bg-zinc-800/80 hover:bg-[#106EBE] dark:hover:bg-[#106EBE] text-zinc-600 dark:text-zinc-300 hover:text-white text-sm font-bold py-3 px-8 rounded-full transition-all duration-300 flex items-center gap-2 border-none outline-none shadow-md dark:shadow-lg hover:shadow-[0_0_15px_rgba(16,110,190,0.5)] cursor-pointer"
                                    >
                                        Load More <ChevronDown className="w-4 h-4 border-none" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="col-span-full py-20 text-center text-zinc-400 dark:text-zinc-500 flex flex-col items-center border-none transition-colors">
                            <Search className="w-12 h-12 mb-4 opacity-30 dark:opacity-20 border-none" />
                            <p className="text-lg border-none">Belum ada video di dalam kategori ini.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}