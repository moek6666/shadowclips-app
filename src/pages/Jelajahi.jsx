import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { FolderOpen, Loader2 } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

export default function Jelajahi({ supabase }) {
    const [visibleCategories, setVisibleCategories] = useState(9);

    useEffect(() => {
        document.title = "Explore Categories | ShadowClips";
    }, []);

    const fetchSemuaKategori = async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(500);

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

    const handleLoadMore = () => {
        setVisibleCategories(prev => prev + 9);
    };

    const displayedCategories = kategoriData.slice(0, visibleCategories);
    const hasMore = visibleCategories < kategoriData.length;

    return (
        <div className="min-h-screen bg-[#090C10] text-zinc-200 transition-colors duration-300">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="w-10 h-10 text-[#106EBE] animate-spin" />
                    </div>
                ) : displayedCategories.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        
                        {/* Grid 16:9 Editorial/Database Tanpa Border */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {displayedCategories.map(([kategori, videos]) => {
                                const heroVideo = videos[0];
                                const imgUrl = getImageUrl(heroVideo?.img);

                                // Logika Navigasi Khusus Kategori AI
                                const isAiCategory = kategori.toLowerCase() === 'ai';
                                const categoryHref = isAiCategory ? '/ai' : `/category/${encodeURIComponent(kategori)}`;

                                return (
                                    <a
                                        key={kategori}
                                        href={categoryHref}
                                        className="relative group block w-full aspect-video rounded-md overflow-hidden bg-[#12161F] cursor-pointer outline-none border-0 shadow-md hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Background Thumbnail 16:9 */}
                                        {imgUrl ? (
                                            <img
                                                src={imgUrl}
                                                alt={kategori}
                                                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[#161B26] flex items-center justify-center text-zinc-600">
                                                <FolderOpen className="w-10 h-10" />
                                            </div>
                                        )}

                                        {/* Gradient Dark Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 transition-opacity duration-300" />

                                        {/* Detail Info Kategori */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
                                            
                                            {/* Jumlah Konten */}
                                            <p className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-[0.15em] mb-1">
                                                {videos.length} Konten
                                            </p>

                                            {/* Nama Kategori */}
                                            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-[#38BDF8] transition-colors duration-300">
                                                {kategori}
                                            </h2>

                                            {/* Info Judul Konten Terbaru */}
                                            {heroVideo && (
                                                <p className="mt-1.5 text-xs text-zinc-400 line-clamp-1 font-normal">
                                                    <span className="text-zinc-500">Terbaru:</span> {heroVideo.title || "Koleksi diperbarui"}
                                                </p>
                                            )}
                                        </div>
                                    </a>
                                );
                            })}
                        </div>

                        {/* Tombol Load More */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="group flex items-center gap-3 px-10 py-3.5 bg-[#161B26] hover:bg-[#1E2536] text-zinc-300 hover:text-white font-semibold rounded-md transition-all cursor-pointer outline-none border-0"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin text-[#106EBE] hidden group-hover:block" />
                                    Tampilkan Lebih Banyak
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-zinc-600 py-32 bg-[#12161F] rounded-md mx-2 border-0">
                        <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-base font-medium">Belum ada kategori tersedia.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}