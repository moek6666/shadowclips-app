import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const extractSingleLabel = (rawLabels) => {
    if (!rawLabels) return '';
    let str = typeof rawLabels === 'string' ? rawLabels : JSON.stringify(rawLabels);
    str = str.replace(/[\[\]{}"']/g, '').trim();
    return str && str.toUpperCase() !== 'EMPTY' ? str : '';
};

const createLabelSlug = (labelName) => {
    return labelName.toLowerCase().trim().replace(/\s+/g, '-');
};

export default function Koleksi({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        document.title = "Video Library | ShadowClips";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchCollections = async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
            .from('videos')
            .select('labels, img')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        const grouped = {};
        (data || []).forEach(video => {
            const cleanLabel = extractSingleLabel(video.labels);
            if (cleanLabel) {
                const existingKey = Object.keys(grouped).find(k => k.toLowerCase() === cleanLabel.toLowerCase());
                if (existingKey) {
                    grouped[existingKey].count += 1;
                } else {
                    const displayLabel = cleanLabel.replace(/\b\w/g, c => c.toUpperCase());
                    grouped[displayLabel] = {
                        name: displayLabel,
                        count: 1,
                        coverImage: getImageUrl(video.img),
                    };
                }
            }
        });

        return Object.values(grouped).sort((a, b) => b.count - a.count);
    };

    const { data: collections = [], isLoading } = useSWR(
        supabase ? 'koleksi_videos' : null,
        fetchCollections,
        { revalidateOnFocus: false, dedupingInterval: 300000 }
    );

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <main className="min-h-screen pb-20 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800/50 border-none rounded-[4px] animate-pulse transition-colors"></div>
                            ))
                        ) : collections.length > 0 ? (
                            collections.map((col, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        window.location.href = `/koleksi/${createLabelSlug(col.name)}`;
                                    }}
                                    className="group relative aspect-[4/3] rounded-[4px] overflow-hidden cursor-pointer shadow-md dark:shadow-lg transition-transform duration-300 hover:-translate-y-1 bg-zinc-100 dark:bg-zinc-900 border-none"
                                >
                                    <img
                                        src={col.coverImage || '/placeholder-image.jpg'}
                                        alt={col.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-500"></div>

                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-[#106EBE] text-white px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md dark:shadow-[0_0_10px_rgba(16,110,190,0.4)] border-none">
                                                <FolderOpen className="w-3 h-3" />
                                                {col.count} Videos
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white group-hover:text-[#0FFCBE] transition-colors drop-shadow-md">
                                            {col.name}
                                        </h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500 border-none">
                                <FolderOpen className="w-12 h-12 mb-4 opacity-30 dark:opacity-20" />
                                <p className="text-lg font-medium">No collections found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}