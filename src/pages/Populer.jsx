import React, { useState, useEffect } from 'react';
import { Play, MonitorPlay, FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function Populer({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        document.title = "Trending & Populer | ShadowClips";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchPopularVideos = async () => {
            if (!supabase) return;
            setLoading(true);

            const { data, error } = await supabase.from('videos').select('*').order('views', { ascending: false, nullsFirst: false }).limit(16);
            if (!error && data) setVideos(data);
            setLoading(false);
        };
        fetchPopularVideos();
    }, [supabase]);

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-28 pb-20 min-h-screen">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {loading ? (
                        Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-video bg-zinc-900 rounded-xl mb-3"></div>
                                <div className="h-5 bg-zinc-900 rounded w-3/4 mb-2"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((video) => (
                            <div key={video.id} onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer">

                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-zinc-800 shadow-lg">
                                    <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <div className="w-14 h-14 bg-[#106EBE] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_25px_rgba(16,110,190,0.6)]">
                                            <Play className="w-6 h-6 fill-current ml-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* ALIGN CENTER & TRUNCATE */}
                                <div className="px-2 text-center">
                                    <h3 className="font-bold text-sm md:text-base mb-1.5 text-white group-hover:text-[#0FFCBE] transition-colors truncate" title={video.title}>
                                        {video.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white group-hover:text-[#0FFCBE] transition-colors">
                                            <FolderOpen className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {video.category}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-white group-hover:text-[#0FFCBE] transition-colors">
                                            <MonitorPlay className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {formatViews(video.views)}x diputar
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-zinc-500">Belum ada data populer.</div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}