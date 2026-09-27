import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Calendar, Images, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function DetailGallery({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [imageSpans, setImageSpans] = useState({});
    
    // State untuk fitur Modal / Lightbox
    const [selectedIndex, setSelectedIndex] = useState(null);
    
    const slug = window.location.pathname.split('/')[2];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mengunci scroll background saat modal terbuka
    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedIndex]);

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
        
        const imagesArray = data.images ? data.images.split(',').map(url => url.trim()).filter(url => url !== '') : [];
        return { ...data, imagesArray };
    };

    const { data: gallery, isLoading, error: swrError } = useSWR(
        (supabase && slug) ? `galeri_detail_${slug}` : null,
        fetchGalleryDetail,
        { revalidateOnFocus: false, dedupingInterval: 600000 }
    );

    useEffect(() => {
        if (gallery) {
            document.title = `${gallery.title} | ShadowClips Gallery`;
        }
    }, [gallery]);

    useEffect(() => {
        if (gallery?.imagesArray) {
            gallery.imagesArray.forEach((url, index) => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    const ratio = img.width / img.height;
                    let spanClass = 'col-span-1 row-span-1'; 
                    
                    if (ratio > 1.2) {
                        spanClass = 'col-span-2 row-span-1';
                    } else if (ratio < 0.8) {
                        spanClass = 'col-span-1 row-span-2';
                    }
                    
                    setImageSpans(prev => ({ ...prev, [index]: spanClass }));
                };
            });
        }
    }, [gallery]);

    // Fungsi navigasi Modal
    const closeModal = () => setSelectedIndex(null);
    
    const nextImage = (e) => {
        e.stopPropagation();
        if (gallery) {
            setSelectedIndex((prev) => (prev + 1) % gallery.imagesArray.length);
        }
    };
    
    const prevImage = (e) => {
        e.stopPropagation();
        if (gallery) {
            setSelectedIndex((prev) => (prev === 0 ? gallery.imagesArray.length - 1 : prev - 1));
        }
    };

    if (swrError) {
        console.error("SWR Error di Detail:", swrError);
    }

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <main className="min-h-screen pb-20 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border-none">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 relative z-10 border-none">
                    
                    {isLoading ? (
                        <div className="animate-pulse border-none flex flex-col items-center w-full">
                            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-2/3 md:w-1/3 mb-4 border-none"></div>
                            <div className="flex justify-center gap-4 mb-10 border-none">
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24 border-none"></div>
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24 border-none"></div>
                            </div>
                            
                            {/* Ukuran skeleton diperkecil menyesuaikan grid baru */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px] grid-flow-row-dense border-none w-full">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl w-full h-full border-none ${i % 4 === 0 ? 'col-span-2' : 'col-span-1'}`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ) : swrError ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center border-none">
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-full mb-5 border-none">
                                <Images className="w-10 h-10 border-none" />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 border-none text-zinc-900 dark:text-zinc-100">Galeri Tidak Ditemukan</h2>
                            <p className="text-zinc-500 border-none text-lg">Mungkin postingan ini sudah dihapus atau URL tidak valid.</p>
                        </div>
                    ) : gallery ? (
                        <>
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

                            {/* BENTO GRID FOTO (Ukuran Diperkecil & Rapat) */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[180px] grid-flow-row-dense border-none">
                                {gallery.imagesArray.map((imgUrl, index) => {
                                    const spanClass = imageSpans[index] || 'col-span-1 row-span-1';
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            onClick={() => setSelectedIndex(index)}
                                            className={`group relative cursor-pointer rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:z-10 transition-all duration-300 border-none animate-in fade-in zoom-in duration-500 ${spanClass}`}
                                        >
                                            <img 
                                                src={imgUrl} 
                                                alt={`${gallery.title} - Foto ${index + 1}`} 
                                                className="w-full h-full object-cover border-none" 
                                                loading="lazy"
                                            />
                                            
                                            {/* Overlay & Icon Zoom saat di hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center border-none">
                                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 drop-shadow-md border-none" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                </div>
            </main>

            {/* MODAL FULLSCREEN LIGHTBOX */}
            {selectedIndex !== null && gallery && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 border-none"
                    onClick={closeModal}
                >
                    {/* Tombol Close */}
                    <button 
                        onClick={closeModal} 
                        className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-[110] border-none"
                    >
                        <X className="w-8 h-8 border-none" />
                    </button>

                    {/* Tombol Previous */}
                    <button 
                        onClick={prevImage} 
                        className="absolute left-4 md:left-8 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-[110] border-none"
                    >
                        <ChevronLeft className="w-8 h-8 border-none" />
                    </button>

                    {/* Gambar Full */}
                    <div className="relative max-w-[90vw] max-h-[90vh] border-none">
                        <img 
                            src={gallery.imagesArray[selectedIndex]} 
                            alt={`Full View - ${selectedIndex + 1}`} 
                            className="max-w-[90vw] max-h-[90vh] object-contain animate-in zoom-in-95 duration-300 border-none shadow-2xl"
                        />
                        {/* Indikator halaman foto di bawah gambar */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium border-none tracking-widest">
                            {selectedIndex + 1} / {gallery.imagesArray.length}
                        </div>
                    </div>

                    {/* Tombol Next */}
                    <button 
                        onClick={nextImage} 
                        className="absolute right-4 md:right-8 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-[110] border-none"
                    >
                        <ChevronRight className="w-8 h-8 border-none" />
                    </button>
                </div>
            )}

            <Footer />
        </>
    );
}