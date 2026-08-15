import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, ThumbsUp, MessageSquare, Unlock, Download, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Tutorial({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen">

                {/* Header Section (Tanpa Garis Pembatas) */}
                <div className="mb-14">
                    <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">How to Unlock Exclusive Contents</h1>
                    <p className="text-zinc-400 text-base sm:text-lg max-w-2xl">A quick step-by-step guide to unlocking premium videos and high-speed download links on ShadowClips.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

                    {/* Sidebar / Menu Kiri (Tanpa Box & Border) */}
                    <div className="w-full md:w-48 flex-shrink-0">
                        <div className="sticky top-32">
                            <button className="flex items-center gap-3 text-left font-bold text-white transition-all group">
                                <HelpCircle className="w-5 h-5 text-[#106EBE] group-hover:scale-110 transition-transform" />
                                <span className="tracking-wide">Access Guide</span>
                            </button>
                        </div>
                    </div>

                    {/* Konten Utama Bahasa Inggris (Desain Tipografi Premium, Tanpa Container) */}
                    <div className="flex-1 relative">
                        <div className="animate-in fade-in duration-500 relative z-10 max-w-3xl">

                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12 flex items-center gap-3">
                                <Unlock className="w-7 h-7 text-[#106EBE]" /> Unlock Tutorial
                            </h2>

                            <div className="flex flex-col gap-12 sm:gap-14">

                                {/* Step 1 */}
                                <div className="flex gap-6 sm:gap-8 group">
                                    <div className="text-5xl sm:text-6xl font-black text-zinc-800 transition-colors duration-500 group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none">
                                        01
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">Sign In Securely</h3>
                                        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                                            To interact with our premium content, you must first log in using your Google account. It's fast, secure, and requires no registration.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-6 sm:gap-8 group">
                                    <div className="text-5xl sm:text-6xl font-black text-zinc-800 transition-colors duration-500 group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none">
                                        02
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center flex-wrap gap-2">
                                            Like & Comment
                                            <span className="flex items-center gap-1.5 ml-1 text-zinc-600"><ThumbsUp className="w-5 h-5" /> <MessageSquare className="w-5 h-5" /></span>
                                        </h3>
                                        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                                            Show some love to the creators! Click the <strong className="text-zinc-200 font-semibold">Like</strong> button and leave a meaningful <strong className="text-zinc-200 font-semibold">Comment</strong> in the discussion section below the locked video.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-6 sm:gap-8 group">
                                    <div className="text-5xl sm:text-6xl font-black text-zinc-800 transition-colors duration-500 group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none">
                                        03
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight flex items-center flex-wrap gap-2">
                                            Enjoy Stream & Downloads
                                            <span className="flex items-center gap-1.5 ml-1 text-zinc-600"><Play className="w-5 h-5" /> <Download className="w-5 h-5" /></span>
                                        </h3>
                                        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                                            Once you have successfully liked and posted a comment, the exclusive video player and the high-speed download links will instantly unlock for you to enjoy.
                                        </p>
                                    </div>
                                </div>

                                {/* Pesan Keamanan (Tanpa Background/Border, Hanya Icon & Text) */}
                                <div className="mt-8 pt-8 flex items-start gap-4 text-zinc-500 border-t border-zinc-800/50">
                                    <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed">
                                        <strong className="text-zinc-300 font-medium">Community First:</strong> We use this system to prevent bots and build a real, active community. Your engagement helps us keep the platform alive!
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}