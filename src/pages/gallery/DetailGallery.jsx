import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ArrowLeft, Calendar, Images } from 'lucide-react';
import Navbar from '../../components/Navbar'; // Perhatikan path mundur 2 folder (../../)
import Footer from '../../components/Footer';

// Fungsi untuk memformat tanggal (Opsional: agar tampilan lebih profesional)
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function DetailGallery({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Mengambil slug dari URL (contoh: /gallery/judul-postingan)
    const slug = window.location.pathname.split('/')[2];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🚀 SCRIPT IKLAN (Sama dengan halaman utama) 🚀
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

    // Fungsi Fetching untuk SWR
    const fetchGalleryDetail = async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        if (!slug) throw new Error("Slug not found");

        const { data, error } = await supabase
            .from('galeries')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw new Error(error.message);
        
        // Memecah string koma menjadi array URL gambar
        const imagesArray = data.images ? data.images.split(',').map(url => url.trim()).filter(url => url !== '') : [];
        
        return { ...data, imagesArray };
    };

    // Menerapkan SWR dengan Key unik berdasarkan slug
    const { data: gallery, isLoading, error } = useSWR(
        (supabase && slug) ? `galeri_detail_${slug}` : null,
        fetchGalleryDetail,
        { 
            revalidateOnFocus: false, // Tidak fetch ulang setiap kali tab aktif (hemat bandwidth)
            dedupingInterval: 600000 // Cache disimpan selama 10 menit
        }
    );

    // Update Title Dokumen setelah data dimuat
    useEffect(() => {
        if (gallery) {
            document.title = `${gallery.title} | ShadowClips Gallery`;
        }
    }, [gallery]);

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

                    {/* Navigasi Kembali */}
                    <button 
                        onClick={() => window.location.href = '/gallery'}
                        className="group mb-8 flex items-center gap-2 text-zinc-500 hover:text-[#106EBE] dark:text-zinc-400 dark:hover:text-[#106EBE] transition-colors font-medium border-none"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 border-none" />
                        Kembali ke Galeri
                    </button>

                    {isLoading ? (
                        /* SKELETON LOADING */
                        <div className="animate-pulse border-none">
                            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 md:w-1/3 mb-4 border-none"></div>
                            <div className="flex gap-4 mb-10 border-none">
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-24 border-none"></div>
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-24 border-none"></div>
                            </div>
                            {/* Skeleton Masonry */}
                            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 border-none">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className={`bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full border-none ${i % 2 === 0 ? 'h-64' : 'h-96'}`}></div>
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        /* TAMPILAN ERROR / TIDAK DITEMUKAN */
                        <div className="py-20 flex flex-col items-center justify-center text-center border-none">
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-4 border-none">
                                <Images className="w-10 h-10 border-none" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 border-none">Galeri Tidak Ditemukan</h2>
                            <p className="text-zinc-500 border-none">Mungkin postingan ini sudah dihapus atau URL tidak valid.</p>
                        </div>
                    ) : gallery ? (
                        /* KONTEN UTAMA */
                        <>
                            {/* Header Galeri TANPA BORDER BAWAH */}
                            <div className="mb-10 border-none pb-8">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-4 border-none">
                                    {gallery.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400 border-none">
                                    <span className="flex items-center gap-1.5 border-none">
                                        <Calendar className="w-4 h-4 text-[#106EBE] border-none" />
                                        {formatDate(gallery.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1.5 border-none">
                                        <Images className="w-4 h-4 text-[#106EBE] border-none" />
                                        {gallery.imagesArray.length} Foto
                                    </span>
                                </div>
                            </div>

                            {/* MASONRY GRID UNTUK FOTO (STYLISH & RAPIH) */}
                            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 border-none">
                                {gallery.imagesArray.map((imgUrl, index) => (
                                    <div 
                                        key={index} 
                                        className="group relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 break-inside-avoid shadow-sm hover:shadow-xl dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 border-none"
                                    >
                                        <img 
                                            src={imgUrl} 
                                            alt={`${gallery.title} - Foto ${index + 1}`} 
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 border-none" 
                                            loading="lazy"
                                        />
                                        
                                        {/* Overlay tipis saat di-hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors duration-300 pointer-events-none border-none"></div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </main>
            <Footer />
        </>
    );
}