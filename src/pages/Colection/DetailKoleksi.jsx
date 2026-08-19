import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Play, Eye, Clock, Search } from 'lucide-react';

// IMPORT NAIK DUA TINGKAT KARENA BERADA DI DALAM FOLDER BARU
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

const extractSingleLabel = (rawLabels) => {
    if (!rawLabels) return '';
    let str = typeof rawLabels === 'string' ? rawLabels : JSON.stringify(rawLabels);
    str = str.replace(/[\[\]{}"']/g, '').trim();
    return str && str.toUpperCase() !== 'EMPTY' ? str : '';
};

export default function DetailKoleksi({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [labelName, setLabelName] = useState('');
    const [targetLabelSearch, setTargetLabelSearch] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        let rawUrlLabel = decodeURIComponent(pathParts[2] || '');

        if (!rawUrlLabel) { window.location.href = '/koleksi'; return; }

        // PERBAIKAN SEO: Mengubah tanda hubung (-) dari URL kembali menjadi spasi untuk pencarian DB
        rawUrlLabel = rawUrlLabel.replace(/-/g, ' ');

        const cleanUrlLabel = extractSingleLabel(rawUrlLabel);

        // Kapitalisasi awal kata untuk SEO title
        const displayTitle = cleanUrlLabel.replace(/\b\w/g, c => c.toUpperCase());

        setLabelName(displayTitle);
        setTargetLabelSearch(cleanUrlLabel.toLowerCase());

        document.title = `${displayTitle} | ShadowClips`;
    }, []);

    const fetchLabelVideos = async (targetLabel) => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);

        if (data) {
            return data.filter(video => {
                const cleanDbLabel = extractSingleLabel(video.labels);
                return cleanDbLabel.toLowerCase() === targetLabel;
            });
        }
        return [];
    };

    const { data: videos = [], isLoading: loading } = useSWR(
        targetLabelSearch && supabase ? ['koleksi_videos', targetLabelSearch] : null,
        () => fetchLabelVideos(targetLabelSearch),
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000,
            keepPreviousData: true,
        }
    );

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen flex flex-col">

                {/* TAMPILAN POLOSAN (HANYA GRID) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-y-8 md:gap-x-6 flex-grow">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col gap-2">
                                <div className="aspect-video bg-zinc-800/50 rounded-[4px]"></div>
                                <div className="h-4 bg-zinc-800/50 rounded w-full"></div>
                                <div className="h-4 bg-zinc-800/50 rounded w-2/3 mx-auto"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((item) => (
                            <div key={item.id} onClick={() => window.location.href = `/streaming/${item.slug || item.id}`} className="group cursor-pointer flex flex-col gap-2">

                                <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-900 border-none">
                                    <img src={getImageUrl(item.img)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <Play className="w-12 h-12 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                    </div>

                                    {/* VIEWS DI-HIDDEN
                                    <div className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                        <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" /> {formatViews(item.views)}
                                    </div>
                                    */}

                                    {item.duration && item.duration !== 'EMPTY' && (
                                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.duration}
                                        </div>
                                    )}
                                </div>

                                <div className="px-1 text-center">
                                    <h3 className="font-bold text-[13px] md:text-[14px] text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug" title={item.title}>
                                        {item.title}
                                    </h3>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-zinc-500 flex flex-col items-center border-none">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg">Belum ada video di dalam koleksi ini.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}