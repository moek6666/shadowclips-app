import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Images, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Fungsi bantuan untuk menghitung jumlah gambar dari string yang dipisah koma
const getImageCount = (imagesString) => {
    if (!imagesString) return 0;
    return imagesString.split(',').filter(url => url.trim() !== '').length;
};

// Fungsi pembantu untuk menghasilkan pola grid Bento dinamis berdasarkan urutan (Index)
const getBentoSpan = (index) => {
    const patterns = [
        'col-span-1 md:col-span-2 row-span-2', // 0: Hero (Besar 2x2)
        'col-span-1 md:col-span-1 row-span-1', // 1: Kotak Standar
        'col-span-1 md:col-span-1 row-span-2', // 2: Tinggi Vertikal
        'col-span-1 md:col-span-1 row-span-1', // 3: Kotak Standar
        'col-span-1 md:col-span-2 row-span-1', // 4: Lebar Horizontal
        'col-span-1 md:col-span-1 row-span-1', // 5: Kotak Standar
    ];
    return patterns[index % patterns.length];
};

export default function Gallery({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        document.title = "Galeri Gambar | ShadowClips";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetching data dari tabel 'galleries'
    const fetchGalleries = async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
            .from('galleries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching from Supabase:", error.message);
            throw new Error(error.message);
        }
        return data || [];
    };

    const { data: galleries = [], isLoading, error: swrError } = useSWR(
        supabase ? 'galeri_postingan' : null,
        fetchGalleries,
        { revalidateOnFocus: false, dedupingInterval: 300000 }
    );

    if (swrError) {
        console.error("SWR Error:", swrError);
    }

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <main className="min-h-screen pb-20 relative overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-out border-none">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-24 md:pt-32 relative z-10 border-none">
                    
                    {/* Grid Galeri (Bento Style dengan ukuran bervariasi dan grid-flow-row-dense) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[250px] grid-flow-row-dense border-none">
                        {isLoading ? (
                            // Skeleton Bento Loading agar pas dengan ukuran grid yang sesungguhnya
                            Array.from({ length: 8 }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm animate-pulse border-none ${getBentoSpan(i)}`}
                                ></div>
                            ))
                        ) : galleries.length > 0 ? (
                            galleries.map((item, index) => (
                                /* KARTU BENTO DINAMIS */
                                <div
                                    key={item.id || index}
                                    onClick={() => window.location.href = `/gallery/${item.slug}`}
                                    className={`group relative cursor-pointer rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:z-10 transition-all duration-500 border-none ${getBentoSpan(index)}`}
                                >
                                    {/* Gambar Cover (Resolusi Besar akan tetap tajam di sini) */}
                                    <img
                                        src={item.cover_image || '/placeholder-image.jpg'}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 border-none"
                                        loading="lazy"
                                    />
                                    
                                    {/* Gradient Gelap di bagian bawah agar teks mudah dibaca */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 border-none"></div>

                                    {/* Badge Jumlah Foto (Kanan Atas) */}
                                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-lg border-none z-10">
                                        <Images className="w-3.5 h-3.5 border-none" />
                                        {getImageCount(item.images)}
                                    </div>

                                    {/* Area Teks Judul (Kiri Bawah) */}
                                    <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full border-none z-10 flex flex-col justify-end">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-[#106EBE] transition-colors line-clamp-2 leading-snug border-none drop-shadow-md">
                                            {item.title}
                                        </h3>
                                        
                                        <p className="text-sm font-medium text-white/80 group-hover:text-[#106EBE] mt-3 flex items-center gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 border-none">
                                            Lihat Album <ArrowRight className="w-4 h-4 border-none" />
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