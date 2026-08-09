import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Play, MonitorPlay, ChevronLeft, ChevronRight, Search } from 'lucide-react';

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

const getCategoryIcon = (category) => {
    if (!category) return <BiSolidCategory className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors shrink-0" />;

    const name = category.toString().toLowerCase();
    const iconClasses = "w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors shrink-0";

    if (name.includes('onlyfans')) return <SiOnlyfans className={iconClasses} />;
    if (name.includes('telegram')) return <SiTelegram className={iconClasses} />;
    if (name.includes('movie') || name.includes('scene')) return <FaClapperboard className={iconClasses} />;
    if (name.includes('live')) return <MdLiveTv className={iconClasses} />;
    if (name.includes('deepfake')) return <FaMask className={iconClasses} />;

    if (name.includes('kbj') || name.includes('korean')) {
        return (
            <div className="relative shrink-0 flex items-center justify-center">
                <FaVideo className={iconClasses} />
                <span className="absolute -bottom-1 -right-1 bg-zinc-800 border border-zinc-600 text-white text-[5px] font-black px-[2px] rounded-[1px] shadow-sm group-hover:border-[#0FFCBE] group-hover:text-[#0FFCBE] transition-colors leading-none">KR</span>
            </div>
        );
    }

    if (name.includes('jav') || name.includes('jepang') || name.includes('film')) {
        return (
            <div className="relative shrink-0 flex items-center justify-center">
                <FaFilm className={iconClasses} />
                <span className="absolute -bottom-1 -right-1 bg-zinc-800 border border-zinc-600 text-white text-[5px] font-black px-[2px] rounded-[1px] shadow-sm group-hover:border-[#0FFCBE] group-hover:text-[#0FFCBE] transition-colors leading-none">JP</span>
            </div>
        );
    }

    if (name.includes('exclusive') || name.includes('eksklusif')) return <FaCrown className={iconClasses} />;
    if (name.includes('viral')) return <FaFire className={iconClasses} />;
    if (name.includes('random') || name.includes('acak')) return <FaRandom className={iconClasses} />;
    if (name.includes('banned')) return <FaBan className={iconClasses} />;

    return <BiSolidCategory className={iconClasses} />;
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

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const hilltopMiddleAdRef = useRef(null);
    const hilltopBottomAdRef = useRef(null);
    const isFirstMount = useRef(true);

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

    const fetchVideos = async ([key, page, search]) => {
        if (!supabase) throw new Error("Supabase not initialized");
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase.from('videos').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (search) query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);

        query = query.range(from, to);
        const { data, count, error } = await query;

        if (error) throw new Error(error.message);
        return {
            data: data || [],
            totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
        };
    };

    const { data: swrData, isLoading } = useSWR(
        supabase ? ['home_videos', currentPage, debouncedSearch] : null,
        fetchVideos,
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000,
            keepPreviousData: true,
        }
    );

    const videos = swrData?.data || [];
    const totalPages = swrData?.totalPages || 0;

    useEffect(() => {
        const currentAdRef = hilltopMiddleAdRef.current;
        if (videos.length > 0 && currentAdRef && !currentAdRef.querySelector('script')) {
            const s = document.createElement('script');
            s.settings = {};
            s.src = "//winding-hurt.com/b/XCVrsQd.Gkl/0OYTWFcb/hevma9Pu/ZNUrlOkVPuTSYB4KMNT/MV1UOQTzMDtwNQj/gzxhM/zBUn5BNswG";
            s.async = true;
            s.referrerPolicy = "no-referrer-when-downgrade";
            currentAdRef.appendChild(s);
        }
        return () => { if (currentAdRef) currentAdRef.innerHTML = ''; };
    }, [videos]);

    useEffect(() => {
        const currentAdRef = hilltopBottomAdRef.current;
        if (currentAdRef && !currentAdRef.querySelector('script')) {
            const s = document.createElement('script');
            s.settings = {};
            s.src = "//winding-hurt.com/b/XKVzsJd.G/lP0bY/WYcS/zexm/9cuhZhU-lskGPNTDcZyQOVDkg/x/MFjmUJtaNnz/IY4HOTD_E/y/OKQL";
            s.async = true;
            s.referrerPolicy = "no-referrer-when-downgrade";
            currentAdRef.appendChild(s);
        }
        return () => { if (currentAdRef) currentAdRef.innerHTML = ''; };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);

            if (isFirstMount.current) {
                isFirstMount.current = false;
            } else {
                setCurrentPage(1);
                const newUrl = new URL(window.location);
                newUrl.searchParams.delete('page');
                window.history.pushState({}, '', newUrl);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const getPageNumbers = () => {
        const maxVisiblePages = 5;
        const currentBlock = Math.ceil(currentPage / maxVisiblePages);
        const startPage = (currentBlock - 1) * maxVisiblePages + 1;
        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 relative z-20 pb-10 pt-32 min-h-screen animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out">

                <div className="mb-10 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
                    {debouncedSearch ? (
                        <h1 className="text-zinc-400 text-sm md:text-base leading-relaxed">
                            <strong className="text-white font-black text-lg md:text-xl tracking-tight mr-2">Search Results: <span className="text-[#106EBE]">"{debouncedSearch}"</span></strong>
                            Displaying all content relevant to your search keywords.
                        </h1>
                    ) : currentPage === 1 ? (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-video bg-zinc-800/50 rounded-xl mb-3"></div>
                                <div className="h-5 bg-zinc-800/50 rounded w-3/4 mb-2"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((video, index) => (
                            <React.Fragment key={video.id}>
                                {index === 12 && (
                                    <div className="col-span-full w-full flex justify-center my-4 overflow-hidden min-h-[90px]">
                                        <div ref={hilltopMiddleAdRef}></div>
                                    </div>
                                )}
                                <div onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer">

                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800/30 border border-zinc-800/80 shadow-lg">
                                        <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                            <div className="w-14 h-14 bg-[#106EBE] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_30px_rgba(16,110,190,0.6)]">
                                                <Play className="w-6 h-6 fill-current ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-2 text-center">
                                        <h3 className="font-bold text-sm md:text-base mb-1.5 text-white group-hover:text-[#0FFCBE] transition-colors truncate" title={video.title}>
                                            {video.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                                            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white group-hover:text-[#0FFCBE] transition-colors">
                                                {getCategoryIcon(video.category)} {video.category}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium text-white group-hover:text-[#0FFCBE] transition-colors">
                                                <MonitorPlay className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {formatViews(video.views)} views
                                            </span>
                                        </div>
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
                            <button onClick={() => handlePageChange(currentPage - 1)} className="px-4 h-10 flex items-center justify-center gap-1 rounded-full font-bold text-sm transition-all border border-zinc-800 text-white hover:bg-zinc-800 hover:text-[#0FFCBE]">
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                        )}
                        {getPageNumbers().map((num) => (
                            <button key={num} onClick={() => handlePageChange(num)} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${currentPage === num ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.5)] border-transparent' : 'border border-zinc-800 text-white hover:bg-zinc-800 hover:text-[#0FFCBE]'}`}>
                                {num}
                            </button>
                        ))}
                        {currentPage < totalPages && (
                            <button onClick={() => handlePageChange(currentPage + 1)} className="px-4 h-10 flex items-center justify-center gap-1 rounded-full font-bold text-sm transition-all border border-zinc-800 text-white hover:bg-zinc-800 hover:text-[#0FFCBE]">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                <div className="w-full flex justify-center mt-16 mb-4 overflow-hidden min-h-[90px]">
                    <div ref={hilltopBottomAdRef}></div>
                </div>

            </main>
            <Footer />
        </>
    );
}