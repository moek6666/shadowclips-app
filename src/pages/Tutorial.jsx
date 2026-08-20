import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, ThumbsUp, MessageSquare, Unlock, Download, Users, Lightbulb } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Tutorial({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState('guide');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const tabs = [
        { id: 'guide', label: 'Access Guide', icon: <Unlock className="w-5 h-5" /> },
        { id: 'concept', label: 'Why Login?', icon: <Lightbulb className="w-5 h-5" /> }
    ];

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen transition-colors">

                {/* Header Section */}
                <div className="mb-10 sm:mb-14">
                    <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight transition-colors">
                        {activeTab === 'guide' ? 'How to Unlock Exclusive Contents' : 'Our Community Philosophy'}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl transition-colors">
                        {activeTab === 'guide'
                            ? 'A quick step-by-step guide to unlocking premium videos and high-speed download links on ShadowClips.'
                            : 'Understanding why we use an engagement-based unlock system instead of paid subscriptions.'}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-10 lg:gap-20">

                    {/* Sidebar / Menu Kiri (Ultra-Minimalist Tab) */}
                    <div className="w-full md:w-48 flex-shrink-0">
                        <div className="flex flex-row md:flex-col gap-6 md:gap-8 sticky top-32 overflow-x-auto hide-scrollbar pb-2 md:pb-0 border-b border-zinc-200 dark:border-zinc-800/50 md:border-none transition-colors">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 text-left font-bold transition-all group whitespace-nowrap ${activeTab === tab.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    <span className={`${activeTab === tab.id ? 'text-[#106EBE]' : 'text-zinc-500 dark:text-zinc-600 group-hover:text-[#106EBE] dark:group-hover:text-zinc-400'} transition-colors`}>
                                        {tab.icon}
                                    </span>
                                    <span className="tracking-wide text-sm sm:text-base">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Konten Utama */}
                    <div className="flex-1 relative min-h-[400px]">

                        {/* TAB 1: ACCESS GUIDE */}
                        {activeTab === 'guide' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl">
                                <div className="flex flex-col gap-12 sm:gap-14">

                                    <div className="flex gap-6 sm:gap-8 group">
                                        <div className="text-5xl sm:text-6xl font-black text-zinc-200 dark:text-zinc-800 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none">
                                            01
                                        </div>
                                        <div className="pt-2">
                                            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight transition-colors">Sign In Securely</h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors">
                                                To interact with our premium content, you must first log in using your Google account. It's fast, secure, and requires no registration.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 sm:gap-8 group">
                                        <div className="text-5xl sm:text-6xl font-black text-zinc-200 dark:text-zinc-800 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none">
                                            02
                                        </div>
                                        <div className="pt-2">
                                            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight flex items-center flex-wrap gap-2 transition-colors">
                                                Like & Comment
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-500 dark:text-zinc-600"><ThumbsUp className="w-5 h-5" /> <MessageSquare className="w-5 h-5" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors">
                                                Show some love to the creators! Click the <strong className="text-zinc-900 dark:text-zinc-200 font-semibold transition-colors">Like</strong> button and leave a meaningful <strong className="text-zinc-900 dark:text-zinc-200 font-semibold transition-colors">Comment</strong> in the discussion section below the locked video.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 sm:gap-8 group">
                                        <div className="text-5xl sm:text-6xl font-black text-zinc-200 dark:text-zinc-800 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none">
                                            03
                                        </div>
                                        <div className="pt-2">
                                            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight flex items-center flex-wrap gap-2 transition-colors">
                                                Enjoy Stream & Downloads
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-500 dark:text-zinc-600"><Play className="w-5 h-5" /> <Download className="w-5 h-5" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors">
                                                Once you have successfully liked and posted a comment, the exclusive video player and the high-speed download links will instantly unlock for you to enjoy.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB 2: WHY LOGIN / CONCEPT */}
                        {activeTab === 'concept' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl">
                                <div className="flex flex-col gap-10 sm:gap-12 pt-2">

                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight transition-colors">No Paywalls, Just Engagement</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors">
                                            We believe that premium content should be accessible to everyone. Instead of charging monthly subscription fees or forcing you through endless annoying ads, we use an engagement-based system. Your interaction is your currency.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight flex items-center gap-2 transition-colors">
                                            Building an Authentic Community
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors">
                                            By requiring a secure Google login to leave a comment, we effectively filter out bots, spam, and malicious actors. This ensures that every discussion on ShadowClips is authentic, safe, and driven by real human beings.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight transition-colors">Supporting the Ecosystem</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors">
                                            Every like and thoughtful comment you leave directly supports the platform's algorithm. It motivates our curators and creators to keep delivering high-quality, exclusive videos consistently without compromising your experience.
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-8 flex items-start gap-4 text-zinc-500 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors">
                                        <Users className="w-6 h-6 shrink-0 mt-0.5" />
                                        <p className="text-sm leading-relaxed">
                                            <strong className="text-zinc-700 dark:text-zinc-300 font-medium transition-colors">Privacy First:</strong> We only use your Google profile for basic authentication (Name & Avatar). We do not have access to your personal emails, passwords, or private data.
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}