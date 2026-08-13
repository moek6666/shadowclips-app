import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Play, Eye, Clock, FolderOpen } from 'lucide-react';
// TAMBAHAN: Kembalikan import ikon React Icons yang sempat terhapus
import { SiOnlyfans, SiTelegram } from 'react-icons/si';
import { FaCrown, FaVideo, FaFire, FaBan, FaRandom, FaFilm, FaMask } from 'react-icons/fa';
import { FaClapperboard } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';
import { MdLiveTv } from 'react-icons/md';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

// KEMBALIKAN FUNGSI ICON KATEGORI UTAMA DI SINI
const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    const iconClasses = "w-7 h-7 md:w-8 md:h-8 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors drop-shadow-md shrink-0";

    if (name.includes('onlyfans')) return <SiOnlyfans className={iconClasses} />;
    if (name.includes('telegram')) return <SiTelegram className={iconClasses} />;
    if (name.includes('movie') || name.includes('scene')) return <FaClapperboard className={iconClasses} />;
    if (name.includes('live')) return <MdLiveTv className={iconClasses} />;
    if (name.includes('deepfake')) return <FaMask className={iconClasses} />;

    if (name.includes('kbj') || name.includes('korean')) {
        return (
            <div className="relative shrink-0 flex items-center justify-center">
                <FaVideo className={iconClasses} />
                <span className="absolute -bottom-1 -right-2 bg-zinc-800 border-none text-white text-[8px] md:text-[9px] font-black px-1 rounded-sm shadow-md group-hover:text-[#0FFCBE] transition-colors">
                    KR
                </span>
            </div>
        );
    }

    if (name.includes('jav') || name.includes('jepang') || name.includes('film')) {
        return (
            <div className="relative shrink-0 flex items-center justify-center">
                <FaFilm className={iconClasses} />
                <span className="absolute -bottom-1 -right-2 bg-zinc-800 border-none text-white text-[8px] md:text-[9px] font-black px-1 rounded-sm shadow-md group-hover:text-[#0FFCBE] transition-colors">
                    JP
                </span>
            </div>
        );
    }

    if (name.includes('exclusive') || name.includes('eksklusif')) return <FaCrown className={iconClasses} />;
    if (name.includes('viral')) return <FaFire className={iconClasses} />;
    if (name.includes('random') || name.includes('acak')) return <FaRandom className={iconClasses} />;
    if (name.includes('banned') || name.includes('banned')) return <FaBan className={iconClasses} />;

    return <BiSolidCategory className={iconClasses} />;
};


export default function Jelajahi({ supabase }) {
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => { document.title = "Explore Categories | ShadowClips"; }, []);

    const fetchSemuaKategori = async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(300);
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

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={true} />
            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 pb-24 overflow-hidden min-h-screen font-sans">
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-14 h-14 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin shadow-[0_0_20px_rgba(16,110,190,0.5)]"></div>
                    </div>
                ) : kategoriData.length > 0 ? (
                    <div className="flex flex-col gap-20">
                        {kategoriData.map(([kategori, videos]) => {
                            const heroVideo = videos[0];
                            const subVideos = videos.slice(1, 5);

                            return (
                                <section key={kategori} className="relative">
                                    <div onClick={() => window.location.href = `/kategori/${encodeURIComponent(kategori)}`} className="flex items-center justify-between mb-5 md:mb-6 group cursor-pointer">

                                        {/* KEMBALIKAN ICON KATEGORI DI SINI */}
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {getCategoryIcon(kategori)}
                                            <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-[#0FFCBE] transition-colors">{kategori}</h2>
                                        </div>

                                        <div className="flex items-center gap-1 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors">
                                            <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">View All ({videos.length})</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                                        {heroVideo && (
                                            <div onClick={() => window.location.href = `/streaming/${heroVideo.slug || heroVideo.id}`} className="lg:col-span-7 group cursor-pointer flex flex-col gap-2">
                                                <div className="relative aspect-video md:aspect-[16/10] lg:aspect-auto h-full rounded-[4px] overflow-hidden bg-zinc-900 border-none shadow-2xl">
                                                    <img src={getImageUrl(heroVideo.img)} alt={heroVideo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                        <Play className="w-16 h-16 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                                    </div>
                                                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-[3px] flex items-center gap-1.5 z-30 pointer-events-none">
                                                        <Eye className="w-4 h-4" /> {formatViews(heroVideo.views)}
                                                    </div>
                                                    {heroVideo.duration && heroVideo.duration !== 'EMPTY' && (
                                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-[3px] flex items-center gap-1.5 z-30 pointer-events-none">
                                                            <Clock className="w-4 h-4" /> {heroVideo.duration}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-1 text-center lg:text-left mt-1">
                                                    <h3 className="text-xl md:text-2xl font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                                        {heroVideo.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        )}

                                        {subVideos.length > 0 && (
                                            <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-6">
                                                {subVideos.map((video) => (
                                                    <div key={video.id} onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer flex flex-col gap-2">
                                                        <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-900 border-none shadow-md">
                                                            <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                                <Play className="w-10 h-10 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                                            </div>
                                                            <div className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                                                <Eye className="w-3 h-3" /> {formatViews(video.views)}
                                                            </div>
                                                            {video.duration && video.duration !== 'EMPTY' && (
                                                                <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                                                    <Clock className="w-3 h-3" /> {video.duration}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="px-1 text-center">
                                                            <h4 className="font-bold text-[11px] sm:text-xs text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                                                                {video.title}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 py-32 bg-zinc-800/30 rounded-[4px] border-none mx-4">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg md:text-xl font-medium">No categories available yet.</p>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}