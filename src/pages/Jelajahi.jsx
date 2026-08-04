import React, { useState, useEffect } from 'react';
import { Play, MonitorPlay, ChevronRight, ChevronLeft, LayoutGrid, Crown, Radio, TrendingUp, Shuffle, Send, Heart, Ban, Wand2, FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    const iconClasses = "w-6 h-6 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors";
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

    const scrollSlider = (id, direction) => {
        const slider = document.getElementById(id);
        if (slider) {
            const scrollAmount = direction === 'left' ? -slider.offsetWidth + 100 : slider.offsetWidth - 100;
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-zinc-900 min-h-screen">
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={true} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-28 pb-20 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin"></div>
                    </div>
                ) : kategoriData.length > 0 ? (
                    <div className="flex flex-col gap-12 mt-4">
                        {kategoriData.map(([kategori, videos], index) => {
                            const sliderId = `slider-${index}`;
                            return (
                                <section key={kategori} className="relative group/row">
                                    <div className="flex items-center justify-between mb-5 cursor-pointer w-max pl-2 group">
                                        <div className="flex items-center gap-3">
                                            {getCategoryIcon(kategori)}
                                            <h2 className="text-xl md:text-2xl font-black text-white group-hover:text-[#0FFCBE] transition-colors drop-shadow-md">{kategori}</h2>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-transparent group-hover:text-[#0FFCBE] transition-all transform translate-x-[-15px] group-hover:translate-x-2 ml-2" />
                                    </div>

                                    <div className="relative w-full">
                                        <button onClick={() => scrollSlider(sliderId, 'left')} className="absolute left-0 top-0 bottom-0 w-12 z-30 bg-black/60 hover:bg-black/90 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-sm -ml-4 rounded-r-xl">
                                            <ChevronLeft className="w-8 h-8 text-white" />
                                        </button>

                                        <div id={sliderId} className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 px-2 hide-scrollbar snap-x relative z-20">
                                            {videos.map((video) => (
                                                <div key={video.id} onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer min-w-[240px] w-[240px] md:min-w-[280px] md:w-[280px] snap-start shrink-0 transition-transform duration-300 hover:-translate-y-1.5">

                                                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-zinc-800/50 shadow-lg border border-white/5">
                                                        <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                            <div className="w-12 h-12 bg-[#106EBE] rounded-full flex items-center justify-center text-white scale-50 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_30px_rgba(16,110,190,0.6)]">
                                                                <Play className="w-5 h-5 fill-current ml-1" />
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
                                                                <MonitorPlay className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {formatViews(video.views)}x
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button onClick={() => scrollSlider(sliderId, 'right')} className="absolute right-0 top-0 bottom-0 w-12 z-30 bg-black/60 hover:bg-black/90 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-sm -mr-4 rounded-l-xl">
                                            <ChevronRight className="w-8 h-8 text-white" />
                                        </button>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 py-20 bg-zinc-900/10 rounded-2xl">Belum ada kategori yang tersedia.</div>
                )}
            </main>
            <Footer />
        </div>
    );
}