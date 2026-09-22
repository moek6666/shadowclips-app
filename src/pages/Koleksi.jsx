import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { FolderOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

// 🔥 Hanya mengekstrak index pertama secara paksa, sisa label diabaikan 🔥
const extractFirstLabel = (rawLabels) => {
    if (!rawLabels) return '';
    let firstLabel = '';
    
    if (Array.isArray(rawLabels)) {
        firstLabel = rawLabels[0];
    } else if (typeof rawLabels === 'string') {
        try {
            const parsed = JSON.parse(rawLabels);
            if (Array.isArray(parsed)) {
                firstLabel = parsed[0];
            } else {
                firstLabel = rawLabels.split(',')[0];
            }
        } catch {
            firstLabel = rawLabels.split(',')[0];
        }
    }
    
    if (!firstLabel) return '';
    
    firstLabel = String(firstLabel).replace(/[\[\]{}"']/g, '').trim();
    return firstLabel && firstLabel.toUpperCase() !== 'EMPTY' ? firstLabel : '';
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

    // 🔥 SCRIPT IKLAN DIEKSEKUSI DI SINI 🔥
    useEffect(() => {
        // Muat script Magsrv jika belum ada di dokumen
        if (!document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.type = 'application/javascript';
            script.src = 'https://a.magsrv.com/ad-provider.js';
            document.head.appendChild(script);
        }

        // Jalankan trigger iklan
        const serveScript = document.createElement('script');
        serveScript.text = '(window.AdProvider = window.AdProvider || []).push({"serve": {}});';
        document.body.appendChild(serveScript);

        return () => {
            if (document.body.contains(serveScript)) {
                document.body.removeChild(serveScript);
            }
        };
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
            const cleanLabel = extractFirstLabel(video.labels);
            
            // 🔥 PERBAIKAN: Abaikan label jika itu adalah "AI Generated" (tidak peduli huruf besar/kecil)
            if (cleanLabel && cleanLabel.toLowerCase() !== 'ai generated') {
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

            <main className="min-h-screen pb-20 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border-none">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 relative z-10 border-none">
                    
                    {/* 🔥 AREA IKLAN BANNER 900x250 🔥 */}
                    <div className="w-full flex justify-center mb-10 overflow-hidden border-none relative z-20">
                        <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl flex items-center justify-center min-h-[90px] md:min-h-[250px] w-full max-w-[900px]">
                            <ins 
                                className="eas6a97888e2 block" 
                                data-zoneid="6036458" 
                                data-sub="123450000" 
                                data-block-ad-types="0"
                            ></ins>
                        </div>
                    </div>
                    {/* =============================== */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 border-none">
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
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 border-none"
                                        loading="lazy"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-500 border-none"></div>

                                    <div className="absolute inset-0 p-6 flex flex-col justify-end border-none">
                                        <div className="flex items-center gap-2 mb-2 border-none">
                                            <span className="bg-[#106EBE] text-white px-2.5 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md dark:shadow-[0_0_10px_rgba(16,110,190,0.4)] border-none">
                                                <FolderOpen className="w-3 h-3 border-none" />
                                                {col.count} Videos
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors drop-shadow-md border-none">
                                            {col.name}
                                        </h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500 border-none">
                                <FolderOpen className="w-12 h-12 mb-4 opacity-30 dark:opacity-20 border-none" />
                                <p className="text-lg font-medium border-none">No collections found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}