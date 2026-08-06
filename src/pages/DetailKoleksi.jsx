import React, { useState, useEffect } from 'react';
import { Play, MonitorPlay, Clock, Search, FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

// FUNGSI PEMBERSIH MUTLAK: Harus 100% sama dengan Koleksi.jsx agar nyambung!
const extractSingleLabel = (rawLabels) => {
    if (!rawLabels) return '';
    let str = typeof rawLabels === 'string' ? rawLabels : JSON.stringify(rawLabels);
    str = str.replace(/[\[\]{}"']/g, '').trim();
    return str && str.toUpperCase() !== 'EMPTY' ? str : '';
};

export default function DetailKoleksi({ supabase }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [labelName, setLabelName] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchLabelVideos = async () => {
            if (!supabase) return;
            setLoading(true);

            const pathParts = window.location.pathname.split('/');
            // Ambil "Indo" dari URL
            const rawUrlLabel = decodeURIComponent(pathParts[2] || '');

            if (!rawUrlLabel) { window.location.href = '/koleksi'; return; }

            // Bersihkan nama URL barangkali ada sisa karakter aneh
            const cleanUrlLabel = extractSingleLabel(rawUrlLabel);

            // Format ulang untuk UI Judul
            const displayTitle = cleanUrlLabel.replace(/\b\w/g, c => c.toUpperCase());
            setLabelName(displayTitle);
            document.title = `${displayTitle} | ShadowClips`;

            // Ubah ke huruf kecil semua untuk dicocokkan dengan database
            const targetLabelSearch = cleanUrlLabel.toLowerCase();

            const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                const filtered = data.filter(video => {
                    // Bersihkan data dari database (mengubah ["Indo"] menjadi "Indo")
                    const cleanDbLabel = extractSingleLabel(video.labels);
                    // Bandingkan "indo" dengan "indo"
                    return cleanDbLabel.toLowerCase() === targetLabelSearch;
                });

                setVideos(filtered);
            }
            setLoading(false);
        };
        fetchLabelVideos();
    }, [supabase]);

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} />

            <div className="pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 flex-grow">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div className="animate-pulse" key={i}>
                                <div className="aspect-video bg-zinc-900 rounded-xl mb-3"></div>
                                <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
                            </div>
                        ))
                    ) : videos.length > 0 ? (
                        videos.map((item) => (
                            <div key={item.id} onClick={() => window.location.href = `/streaming/${item.slug || item.id}`} className="group cursor-pointer">

                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-zinc-800 shadow-lg">
                                    <img src={getImageUrl(item.img)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <div className="w-14 h-14 bg-[#106EBE] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_30px_rgba(16,110,190,0.6)]">
                                            <Play className="w-6 h-6 fill-current ml-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2 text-center">
                                    <h4 className="font-bold text-sm md:text-base mb-1.5 text-white group-hover:text-[#0FFCBE] transition-colors truncate" title={item.title}>
                                        {item.title}
                                    </h4>

                                    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white group-hover:text-[#0FFCBE] transition-colors">
                                            <FolderOpen className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {item.category}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-white group-hover:text-[#0FFCBE] transition-colors">
                                            <MonitorPlay className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {formatViews(item.views)}x
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-zinc-500 flex flex-col items-center">
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