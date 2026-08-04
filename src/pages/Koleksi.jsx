import React, { useState, useEffect } from 'react';
import { FolderOpen, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

export default function Koleksi({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        document.title = "Koleksi Video | ShadowClips";
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCollections = async () => {
            if (!supabase) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('videos')
                .select('labels, img')
                .order('created_at', { ascending: false });

            if (!error && data) {
                const grouped = {};

                data.forEach(video => {
                    if (!video.labels) return;

                    let labelsArray = [];
                    if (Array.isArray(video.labels)) {
                        labelsArray = video.labels;
                    } else if (typeof video.labels === 'string') {
                        try {
                            labelsArray = JSON.parse(video.labels);
                            if (!Array.isArray(labelsArray)) labelsArray = [video.labels];
                        } catch (e) {
                            labelsArray = video.labels.split(',').map(l => l.trim());
                        }
                    }

                    labelsArray.forEach(label => {
                        const labelName = label?.toString().trim();
                        if (!labelName || labelName.toUpperCase() === 'EMPTY') return;

                        if (!grouped[labelName]) {
                            grouped[labelName] = {
                                name: labelName,
                                count: 0,
                                coverImage: getImageUrl(video.img),
                            };
                        }
                        grouped[labelName].count += 1;
                    });
                });

                const sortedCollections = Object.values(grouped).sort((a, b) => b.count - a.count);
                setCollections(sortedCollections);
            }
            setLoading(false);
        };

        fetchCollections();
    }, [supabase]);

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} />

            {/* HAPUS bg-zinc-950 di sini agar transparan dan menyatu dengan background global */}
            <main className="min-h-screen pb-20 relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-32 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[4/3] bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"></div>
                            ))
                        ) : filteredCollections.length > 0 ? (
                            filteredCollections.map((col, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        window.location.href = `/koleksi/${encodeURIComponent(col.name)}`;
                                    }}
                                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-transform duration-300 hover:-translate-y-1 bg-zinc-900 border border-zinc-800"
                                >
                                    <img
                                        src={col.coverImage || '/placeholder-image.jpg'}
                                        alt={col.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    {/* Gradasi Normal Tanpa Selimut Biru */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90 transition-opacity duration-500"></div>

                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-[#106EBE] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,110,190,0.4)]">
                                                <FolderOpen className="w-3 h-3" />
                                                {col.count} Konten
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white group-hover:text-[#0FFCBE] transition-colors drop-shadow-md">
                                            {col.name}
                                        </h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Koleksi tidak ditemukan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}