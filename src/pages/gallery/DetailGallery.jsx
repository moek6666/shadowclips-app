import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Calendar, Images } from 'lucide-react'; // ArrowLeft dihapus karena tidak dipakai lagi
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Fungsi untuk memformat tanggal
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function DetailGallery({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    
    // State untuk menyimpan perhitungan ukuran grid setiap gambar (Berdasarkan index)
    const [imageSpans, setImageSpans] = useState({});
    
    // Mengambil slug dari URL
    const slug = window.location.pathname.split('/')[2];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fungsi Fetching untuk SWR
    const fetchGalleryDetail = async () => {
        if (!supabase) throw new Error("Supabase not initialized");
        if (!slug) throw new Error("Slug not found");

        const { data, error } = await supabase
            .from('galleries')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error("Error fetching detail dari Supabase:", error.message);
            throw new Error(error.message);
        }
        
        // Memecah string koma menjadi array URL gambar
        const imagesArray = data.images ? data.images.split(',').map(url => url.trim()).filter(url => url !== '') : [];
        
        return { ...data, imagesArray };
    };

    const { data: gallery, isLoading, error: swrError } = useSWR(
        (supabase && slug) ? `galeri_detail_${slug}` : null,
        fetchGalleryDetail,
        { 
            revalidateOnFocus: false,
            dedupingInterval: 600000
        }
    );

    // Update Title Dokumen
    useEffect(() => {
        if (gallery) {
            document.title = `${gallery.title} | ShadowClips Gallery`;
        }
    }, [gallery]);

    // 🚀 LOGIKA BENTO GRID DINAMIS BERDASARKAN RASIO GAMBAR 🚀
    useEffect(() => {
        if (gallery?.imagesArray) {
            gallery.imagesArray.forEach((url, index) => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    const ratio = img.width / img.height;
                    let spanClass = 'col-span-1 row-span-1'; // Default (Kotak/Square)
                    
                    if (ratio > 1.2) {
                        // Jika gambar lebar (Landscape) -> Ambil 2 Kolom
                        spanClass = 'col-span-2 row-span-1 md:col-span-2 md:row-span-1';
                    } else if (ratio < 0.8) {
                        // Jika gambar tinggi (Portrait) -> Ambil 2 Baris
                        spanClass = 'col-span-1 row-span-2 md:col-span-1 md:row-span-2';
                    }
                    
                    // Update state spesifik untuk index gambar ini
                    setImageSpans(prev => ({ ...prev, [index]: spanClass }));
                };
            });
        }
    }, [gallery]);

    if (swrError) {
        console.error("SWR Error di Detail:", swrError);
    }

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <main className="min-h-screen pb-20 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border-none">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 relative z-10 border-none">
                    
                    {isLoading ? (
                        /* SKELETON LOADING BENTO (Dibuat Center) */
                        <div className="animate-pulse border-none flex flex-col items-center w-full">
                            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-2/3 md:w-1/3 mb-4 border-none"></div>
                            <div className="flex justify-center gap-4 mb-10 border-none">
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24 border-none"></div>
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24 border-none"></div>
                            </div>
                            
                            {/* Skeleton Grid Standar */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px] grid-flow-row-dense border-none w-full">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl w-full h-full border-none ${i % 3 === 0 ? 'col-span-2' : 'col-span-1'}`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ) : swrError ? (
                        /* TAMPILAN ERROR / TIDAK DITEMUKAN */
                        <div className="py-24 flex flex-col items-center justify-center text-center border-none">
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-full mb-5 border-none">
                                <Images className="w-10 h-10 border-none" />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 border-none text-zinc-900 dark:text-zinc-100">Galeri Tidak Ditemukan</h2>
                            <p className="text-zinc-500 border-none text-lg">Mungkin postingan ini sudah dihapus atau URL tidak valid.</p>
                        </div>
                    ) : gallery ? (
                        /* KONTEN UTAMA */
                        <>
                            {/* Header Galeri (Posisi Center) */}
                            <div className="mb-10 border-none pb-4 flex flex-col items-center text-center">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-5 border-none">
                                    {gallery.title}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 border-none">
                                    <span className="flex items-center gap-2 border-none bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg">
                                        <Calendar className="w-4 h-4 text-[#106EBE] border-none" />
                                        {formatDate(gallery.created_at)}
                                    </span>
                                    <span className="flex items-center gap-2 border-none bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg">
                                        <Images className="w-4 h-4 text-[#106EBE] border-none" />
                                        {gallery.imagesArray.length} Foto
                                    </span>
                                </div>
                            </div>

                            {/* BENTO GRID FOTO (Dinamis & Anti Potong Ekstrem) */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[250px] grid-flow-row-dense border-none">
                                {gallery.imagesArray.map((imgUrl, index) => {
                                    // Ambil class span dari state yang sudah dihitung, jika belum selesai hitung pakai kotak standar
                                    const spanClass = imageSpans[index] || 'col-span-1 row-span-1 md:col-span-1 md:row-span-1';
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`group relative rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:z-10 transition-all duration-500 border-none animate-in fade-in zoom-in duration-500 ${spanClass}`}
                                        >
                                            <img 
                                                src={imgUrl} 
                                                alt={`${gallery.title} - Foto ${index + 1}`} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 border-none" 
                                                loading="lazy"
                                            />
                                            
                                            {/* Gradient Overlay saat di-hover untuk memberikan kesan elegan */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-none"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                </div>
            </main>
            <Footer />
        </>
    );
}