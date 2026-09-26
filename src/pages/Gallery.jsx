import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Images } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Fungsi bantuan untuk menghitung jumlah gambar dari string yang dipisah koma
const getImageCount = (imagesString) => {
    if (!imagesString) return 0;
    return imagesString.split(',').filter(url => url.trim() !== '').length;
};

export default function Gallery({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        document.title = "Galeri Gambar | ShadowClips";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🚀 SCRIPT IKLAN DIEKSEKUSI DI SINI
    useEffect(() => {
        if (!document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.type = 'application/javascript';
            script.src = 'https://a.magsrv.com/ad-provider.js';
            document.head.appendChild(script);
        }

        const serveScript = document.createElement('script');
        serveScript.text = '(window.AdProvider = window.AdProvider || []).push({"serve": {}});';
        document.body.appendChild(serveScript);

        return () => {
            if (document.body.contains(serveScript)) {
                document.body.removeChild(serveScript);
            }
        };
    }, []);

    // Fetching data dari tabel 'galeries'
    const fetchGalleries = async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
            .from('galeries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    };

    const { data: galleries = [], isLoading } = useSWR(
        supabase ? 'galeri_postingan' : null,
        fetchGalleries,
        { revalidateOnFocus: false, dedupingInterval: 300000 }
    );

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <main className="min-h-screen pb-20 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border-none">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 relative z-10 border-none">
                    
                    {/* 🚀 AREA IKLAN BANNER 900x250 🚀 */}
                    <div className="w-full flex justify-center mb-10 overflow-hidden border-none relative z-20">
                        <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl flex items-center justify-center min-h-[90px] md:min-h-[250px] w-full max-w-[900px] border-none">
                            <ins 
                                className="eas6a97888e2 block border-none" 
                                data-zoneid="6036458" 
                                data-sub="123450000" 
                                data-block-ad-types="0"
                            ></ins>
                        </div>
                    </div>

                    {/* Judul dan Deskripsi telah dihapus total. Langsung menampilkan Grid. */}

                    {/* Grid Galeri */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 border-none mt-4">
                        {isLoading ? (
                            // Skeleton tanpa border
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-zinc-800/40 rounded-xl overflow-hidden shadow-sm animate-pulse border-none">
                                    <div className="aspect-[3/2] bg-zinc-200 dark:bg-zinc-700 border-none"></div>
                                    <div className="p-5 space-y-3 border-none">
                                        <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 border-none"></div>
                                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 border-none"></div>
                                    </div>
                                </div>
                            ))
                        ) : galleries.length > 0 ? (
                            galleries.map((item, index) => (
                                /* DESAIN KARTU BARU: Tanpa border line sama sekali */
                                <div
                                    key={item.id || index}
                                    onClick={() => window.location.href = `/gallery/${item.slug}`}
                                    className="group cursor-pointer bg-white dark:bg-[#18181b] rounded-xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1.5 border-none"
                                >
                                    <div className="relative aspect-[3/2] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-none">
                                        <img
                                            src={item.cover_image || '/placeholder-image.jpg'}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 border-none"
                                            loading="lazy"
                                        />
                                        
                                        {/* Badge Jumlah Foto tanpa garis putih (border-none) */}
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-lg border-none">
                                            <Images className="w-3.5 h-3.5 border-none" />
                                            {getImageCount(item.images)} FOTO
                                        </div>
                                    </div>

                                    {/* Area Teks Solid tanpa border-t */}
                                    <div className="p-5 border-none">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors line-clamp-2 border-none">
                                            {item.title}
                                        </h3>
                                        
                                        <p className="text-sm font-medium text-[#106EBE] mt-3 flex items-center gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 border-none">
                                            Lihat Galeri <span className="border-none">&rarr;</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500 border-none">
                                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-full mb-4 border-none">
                                    <Images className="w-12 h-12 opacity-40 dark:opacity-50 border-none" />
                                </div>
                                <p className="text-lg font-medium border-none">Belum ada galeri yang diunggah.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}