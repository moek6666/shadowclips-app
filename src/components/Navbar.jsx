import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Menu, X, Home, Compass, Flame, FolderOpen, Play, Eye } from 'lucide-react';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function Navbar({ isScrolled, supabase }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    // Effect to lock body scroll when search modal is open
    useEffect(() => {
        if (showSearchModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showSearchModal]);

    // Debounce effect to prevent spamming database queries
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(localSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    // Independent Fetching Function for Search Modal
    const fetchSearchResults = async (query) => {
        if (!supabase || !query) return [];
        const { data, error } = await supabase.from('videos')
            .select('*')
            .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(24);

        if (error) throw new Error(error.message);
        return data || [];
    };

    const { data: searchResults = [], isLoading: isSearching } = useSWR(
        (showSearchModal && debouncedSearch && supabase) ? ['navbar_search', debouncedSearch] : null,
        () => fetchSearchResults(debouncedSearch),
        { revalidateOnFocus: false }
    );

    const closeAndClearSearch = () => {
        setShowSearchModal(false);
        setLocalSearch('');
        setDebouncedSearch('');
    };

    return (
        <>
            <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-gradient-to-r from-zinc-950 via-zinc-950 to-[#106EBE]/10 backdrop-blur-md py-3' : 'bg-gradient-to-b from-zinc-950/90 to-transparent py-5'}`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex justify-between items-center">

                    {/* LEFT SIDE: Logo & Main Menu */}
                    <div className="flex items-center gap-8 lg:gap-12">
                        {/* LOGO BARU DARI SUPABASE (Ukuran Lebih Besar Lagi) */}
                        <a href="/" className="flex items-center gap-2.5 z-50">
                            <img
                                src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                                alt="ShadowClips Logo"
                                className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 object-contain"
                            />

                            <div className="flex flex-col justify-center">
                                <span className="text-xl sm:text-[22px] font-black tracking-tighter text-white leading-none mb-1">
                                    Shadow<span className="text-[#106EBE]">Clips</span>
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] text-[#A0B3C6] uppercase ml-[1px] leading-none">
                                    www.shadowclips.asia
                                </span>
                            </div>
                        </a>

                        {/* DESKTOP MENU */}
                        <div className="hidden md:flex gap-6 text-sm font-bold z-50">
                            <a href="/" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                                <Home className={`w-4 h-4 transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Home
                            </a>
                            <a href="/jelajahi" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                                <Compass className={`w-4 h-4 transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Explore
                            </a>
                            <a href="/populer" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                                <Flame className={`w-4 h-4 transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Trending
                            </a>
                            <a href="/koleksi" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                                <FolderOpen className={`w-4 h-4 transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Library
                            </a>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Search & Mobile Controls */}
                    <div className="flex items-center gap-3">
                        {/* Fake Input to Trigger Search Modal (Desktop) */}
                        <div
                            className="hidden md:flex relative group cursor-text z-50"
                            onClick={() => setShowSearchModal(true)}
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-[#0FFCBE] transition-colors w-4 h-4" />
                            <div className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2 pl-11 pr-5 w-72 transition-all text-sm text-zinc-500 backdrop-blur-sm group-hover:border-[#106EBE] flex items-center select-none">
                                Search exclusive videos...
                            </div>
                        </div>

                        {/* MOBILE MENU CONTROLS */}
                        <div className="flex items-center gap-3 md:hidden z-50">
                            <button
                                onClick={() => setShowSearchModal(true)}
                                className="p-2 text-zinc-400 hover:text-[#0FFCBE] transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-zinc-300"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6 hover:text-[#0FFCBE] transition-colors" /> : <Menu className="w-6 h-6 hover:text-[#0FFCBE] transition-colors" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE DROPDOWN */}
                <div className={`md:hidden absolute top-0 left-0 w-full bg-gradient-to-r from-zinc-950 via-zinc-950 to-[#106EBE]/10 backdrop-blur-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] pt-24 pb-6 px-4 shadow-[0_10px_30px_rgba(16,110,190,0.1)]' : 'max-h-0'}`}>
                    <div className="flex flex-col gap-4 text-base font-bold px-2 mt-2">
                        <a href="/" className={`flex items-center gap-2 group transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <Home className={`w-5 h-5 transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Home
                        </a>
                        <a href="/jelajahi" className={`flex items-center gap-2 group transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <Compass className={`w-5 h-5 transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Explore
                        </a>
                        <a href="/populer" className={`flex items-center gap-2 group transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <Flame className={`w-5 h-5 transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Trending
                        </a>
                        <a href="/koleksi" className={`flex items-center gap-2 group transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <FolderOpen className={`w-5 h-5 transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Library
                        </a>
                    </div>
                </div>
            </nav>

            {/* FULL PAGE SEARCH MODAL WITH LIVE PREVIEW */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
                    <div className="min-h-screen px-4 sm:px-8 py-10 md:py-16 flex flex-col items-center">

                        {/* Close Button */}
                        <button
                            onClick={closeAndClearSearch}
                            className="fixed top-6 right-6 md:top-10 md:right-10 p-2 text-zinc-400 hover:text-[#0FFCBE] transition-colors bg-zinc-900 rounded-full border border-zinc-800 z-50 shadow-lg"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>

                        {/* Floating Search Input */}
                        <div className="w-full max-w-4xl relative animate-in slide-in-from-top-8 duration-500 mb-10 sticky top-0 z-40 pt-4">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-zinc-500 mt-2" />
                            <input
                                autoFocus
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                placeholder="Type keywords to search..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-5 md:py-6 pl-16 md:pl-20 pr-8 text-lg md:text-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#106EBE] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all"
                            />
                        </div>

                        {/* SEARCH RESULTS AREA */}
                        <div className="w-full max-w-[1440px] animate-in fade-in duration-700">
                            {isSearching ? (
                                <div className="flex justify-center py-32">
                                    <div className="w-14 h-14 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin shadow-[0_0_20px_rgba(16,110,190,0.5)]"></div>
                                </div>
                            ) : debouncedSearch && searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-y-8 md:gap-x-6 pb-20">
                                    {searchResults.map((video) => (
                                        <div key={video.id} onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer flex flex-col gap-2">

                                            <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-900 border-none">
                                                <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                    <Play className="w-12 h-12 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                                </div>
                                                <div className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                                    <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" /> {formatViews(video.views)}
                                                </div>
                                            </div>

                                            <div className="px-1 text-center">
                                                <h3 className="font-bold text-[13px] md:text-[14px] text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug" title={video.title}>
                                                    {video.title}
                                                </h3>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ) : debouncedSearch && searchResults.length === 0 ? (
                                <div className="text-center py-32 text-zinc-500">
                                    <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-xl">No results found for "{debouncedSearch}"</p>
                                </div>
                            ) : (
                                <div className="text-center py-32 text-zinc-600">
                                    <p className="text-lg">Type something to start searching for videos.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}