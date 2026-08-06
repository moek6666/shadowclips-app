import React, { useState, useEffect } from 'react';
import { Play, MonitorPlay, ChevronRight, LayoutGrid, Crown, Radio, TrendingUp, Shuffle, Send, Heart, Ban, Wand2, FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    // Ukuran ikon disesuaikan agar dinamis (w-6 di HP, w-8 di PC) agar presisi
    const iconClasses = "w-7 h-7 md:w-8 md:h-8 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors drop-shadow-md";

    if (name.includes('exclusive')) return <Crown className={iconClasses} />;
    if (name.includes('live')) return <Radio className={iconClasses} />;
    if (name.includes('viral')) return <TrendingUp className={iconClasses} />;
    if (name.includes('random')) return <Shuffle className={iconClasses} />;
    if (name.includes('telegram')) return <Send className={iconClasses} />;
    if (name.includes('onlyfans')) return <Heart className={iconClasses} />;
    if (name.includes('banned')) return <Ban className={iconClasses} />;
    if (name.includes('deepfake')) return <Wand2 className={iconClasses} />;
    return <LayoutGrid className={iconClasses} />;
};

export default function Jelajahi({ supabase }) {
    const [kategoriData, setKategoriData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        document.title = "Jelajahi Kategori | ShadowClips";

        const fetchSemuaKategori = async () => {
            if (!supabase) return;
            setLoading(true);

            const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(300);

            if (!error && data) {
                const grouped = {};
                data.forEach(video => {
                    let cats = [];
                    if (!video.category) cats = ['Lainnya'];
                    else if (Array.isArray(video.category)) cats = video.category;
                    else if (typeof video.category === 'string') cats = video.category.split(',').map(c => c.trim());

                    cats.forEach(cat => {
                        if (!cat) return;
                        const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                        if (!grouped[formattedCat]) grouped[formattedCat] = [];
                        grouped[formattedCat].push(video);
                    });
                });
                const sortedKategori = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
                setKategoriData(sortedKategori);
            }
            setLoading(false);
        };
        fetchSemuaKategori();
    }, [supabase]);

    return (
        <div className="bg-zinc-950 min-h-screen font-sans">
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={true} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 pb-24 overflow-hidden">

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
                                    <div
                                        onClick={() => window.location.href = `/kategori/${encodeURIComponent(kategori)}`}
                                        className="flex items-center justify-between mb-5 md:mb-6 group cursor-pointer"
                                    >
                                        {/* BORDER DAN BACKGROUND ICON DIHAPUS, GAP DISESUAIKAN UNTUK MOBILE */}
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {getCategoryIcon(kategori)}
                                            <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-[#0FFCBE] transition-colors">{kategori}</h2>
                                        </div>

                                        <div className="flex items-center gap-1 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors">
                                            <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">Lihat Semua ({videos.length})</span>
                                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                                        {/* BAGIAN KIRI: SOROTAN UTAMA */}
                                        {heroVideo && (
                                            <div
                                                onClick={() => window.location.href = `/streaming/${heroVideo.slug || heroVideo.id}`}
                                                className="lg:col-span-7 group cursor-pointer relative aspect-video md:aspect-[16/10] lg:aspect-auto rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl"
                                            >
                                                <img
                                                    src={getImageUrl(heroVideo.img)}
                                                    alt={heroVideo.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300"></div>

                                                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                                    <div className="w-20 h-20 bg-[#106EBE]/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(16,110,190,0.8)] border border-white/10">
                                                        <Play className="w-8 h-8 fill-current ml-2" />
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-30 transform transition-transform duration-300 group-hover:-translate-y-2">
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3 text-[10px] md:text-xs font-bold">
                                                        <span className="bg-[#106EBE] text-white px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(16,110,190,0.5)]">
                                                            KONTEN TERBARU
                                                        </span>
                                                        <span className="flex items-center gap-1 text-zinc-300 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-lg">
                                                            <MonitorPlay className="w-3.5 h-3.5 text-[#0FFCBE]" /> {formatViews(heroVideo.views)}x Ditonton
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-white group-hover:text-[#0FFCBE] transition-colors line-clamp-2 drop-shadow-lg leading-tight md:leading-tight">
                                                        {heroVideo.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        )}

                                        {/* BAGIAN KANAN: GRID KECIL */}
                                        {subVideos.length > 0 && (
                                            <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-6">
                                                {subVideos.map((video) => (
                                                    <div
                                                        key={video.id}
                                                        onClick={() => window.location.href = `/streaming/${video.slug || video.id}`}
                                                        className="group cursor-pointer flex flex-col"
                                                    >
                                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-2 md:mb-3 bg-zinc-900 border border-zinc-800 shadow-md">
                                                            <img
                                                                src={getImageUrl(video.img)}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#106EBE] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(16,110,190,0.5)]">
                                                                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-1" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="px-1 text-center mt-auto">
                                                            <h4 className="font-bold text-[13px] md:text-sm text-zinc-100 group-hover:text-[#0FFCBE] transition-colors line-clamp-2 mb-1.5 md:mb-2 leading-snug">
                                                                {video.title}
                                                            </h4>
                                                            <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-medium text-zinc-400">
                                                                <MonitorPlay className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#106EBE]" /> {formatViews(video.views)}x views
                                                            </div>
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
                    <div className="text-center text-zinc-500 py-32 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 mx-4">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg md:text-xl font-medium">Belum ada kategori yang tersedia.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}