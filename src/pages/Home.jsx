import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Play, Eye, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { SiOnlyfans, SiTelegram } from 'react-icons/si';
import { FaCrown, FaVideo, FaFire, FaBan, FaRandom, FaFilm, FaMask } from 'react-icons/fa';
import { FaClapperboard } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';
import { MdLiveTv } from 'react-icons/md';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ITEMS_PER_PAGE = 24;

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function Home({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);

    const [currentPage, setCurrentPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const pageParam = parseInt(params.get('page'));
            return pageParam > 0 ? pageParam : 1;
        }
        return 1;
    });

    useEffect(() => {
        document.title = "ShadowClips | Premium Video Streaming";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('page', page);
        window.history.pushState({}, '', newUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchVideos = async ([key, page]) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, count, error } = await supabase
            .from('videos')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw new Error(error.message);
        return {
            data: data || [],
            totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        };
    };

    const { data: swrData, isLoading } = useSWR(
        supabase ? ['home_videos', currentPage] : null,
        fetchVideos,
        { revalidateOnFocus: false, dedupingInterval: 300000, keepPreviousData: true }
    );

    const videos = swrData?.data || [];
    const totalPages = swrData?.totalPages || 0;

    const getPageNumbers = () => {
        const maxVisiblePages = 5;
        const currentBlock = Math.ceil(currentPage / maxVisiblePages);
        const startPage = (currentBlock - 1) * maxVisiblePages + 1;
        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    return (
        <>
            {/* SINKRONISASI NAVBAR TERBARU */}
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 relative z-20 pb-10 pt-32 min-h-screen animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out">

                <div className="mb-10 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
                    {currentPage === 1 ? (
                        <h1 className="text-zinc-400 text-sm md:text-base leading-relaxed">
                            <strong className="text-white font-black text-lg md:text-xl tracking-tight mr-2">Shadow<span className="text-[#106EBE]">Clips</span></strong>
                            is an exclusive, viral, comprehensive, and updated video streaming hub. Enjoy unlimited premium entertainment collections with the best viewing quality every day.
                        </h1>
                    ) : (
                        <h1 className="text-zinc-400 text-sm md:text-base leading-relaxed">
                            <strong className="text-white font-black text-lg md:text-xl tracking-tight mr-2">Shadow<span className="text-[#106EBE]">Clips</span></strong> Page {currentPage}
                        </h1>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-y-8 md:gap-x-6">
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col gap-2">
                                <div className="aspect-video bg-zinc-800/50 rounded-[4px]"></div>
                                <div className="h-4 bg-zinc-800/50 rounded w-full"></div>
                                <div className="h-4 bg-zinc-800/50 rounded w-2/3 mx-auto"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((video) => (
                            <React.Fragment key={video.id}>
                                <div onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer flex flex-col gap-2">

                                    <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-900 border-none">
                                        <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                            <Play className="w-12 h-12 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                        </div>

                                        <div className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                            <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" /> {formatViews(video.views)}
                                        </div>

                                        {video.duration && video.duration !== 'EMPTY' && (
                                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {video.duration}
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-1 text-center">
                                        <h3 className="font-bold text-[13px] md:text-[14px] text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug" title={video.title}>
                                            {video.title}
                                        </h3>
                                    </div>

                                </div>
                            </React.Fragment>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center text-center text-zinc-500">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No results found.</p>
                        </div>
                    )}
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-20">
                        {currentPage > 1 && (
                            <button onClick={() => handlePageChange(currentPage - 1)} className="px-4 h-10 flex items-center justify-center gap-1 rounded-full font-bold text-sm transition-all text-white hover:bg-zinc-800 hover:text-[#0FFCBE]">
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                        )}
                        {getPageNumbers().map((num) => (
                            <button key={num} onClick={() => handlePageChange(num)} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${currentPage === num ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.5)]' : 'text-white hover:bg-zinc-800 hover:text-[#0FFCBE]'}`}>
                                {num}
                            </button>
                        ))}
                        {currentPage < totalPages && (
                            <button onClick={() => handlePageChange(currentPage + 1)} className="px-4 h-10 flex items-center justify-center gap-1 rounded-full font-bold text-sm transition-all text-white hover:bg-zinc-800 hover:text-[#0FFCBE]">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

            </main>
            <Footer />
        </>
    );
}