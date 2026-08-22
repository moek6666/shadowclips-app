import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, ThumbsUp, MessageSquare, Unlock, Download, Users, Lightbulb, Crown, Globe, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Tutorial({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState('guide');

    // STATE UNTUK FITUR DUA BAHASA (BILINGUAL)
    const [lang, setLang] = useState('id'); // 'id' untuk Indonesia, 'en' untuk English

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLang(prev => prev === 'id' ? 'en' : 'id');
    };

    // ==========================================
    // 📚 KAMUS DATA DUA BAHASA (DICTIONARY)
    // ==========================================
    const dict = {
        id: {
            titleGuide: 'Cara Akses & Keuntungan VIP',
            descGuide: 'Panduan singkat langkah demi langkah untuk membuka video premium, tautan unduhan kecepatan tinggi, dan mengenal eksklusivitas member VIP.',
            titleConcept: 'Filosofi Komunitas Kami',
            descConcept: 'Memahami alasan kami menggunakan sistem berbasis interaksi alih-alih biaya langganan bulanan yang mahal.',
            tabGuide: 'Panduan & VIP',
            tabConcept: 'Mengapa Login?',
            langBtn: 'Switch to English',

            // Tab 1: Panduan
            step1Title: 'Login dengan Aman',
            step1Desc: 'Untuk berinteraksi dengan konten premium kami, Anda harus login menggunakan akun Google. Proses ini cepat, aman, dan tanpa perlu mendaftar ribet.',
            step2Title: 'Like & Komentar',
            step2Desc: 'Dukung para kreator! Klik tombol Like dan tinggalkan Komentar yang bermakna di kolom diskusi di bawah video yang terkunci.',
            step3Title: 'Nikmati Streaming & Download',
            step3Desc: 'Setelah Anda berhasil menyukai dan memposting komentar, pemutar video eksklusif dan tautan unduhan berkecepatan tinggi akan langsung terbuka.',
            step4Title: 'Upgrade ke Premium VIP',
            step4Desc: 'Jadilah elit komunitas! Member VIP mendapatkan lencana Mahkota Emas eksklusif di komentar, akses ke bingkai Avatar Animasi spesial (Shadow, Dragon, dll), dan melewati antrean moderasi komentar.',

            // Tab 2: Konsep
            c1Title: 'Tanpa Paywall, Hanya Interaksi',
            c1Desc: 'Kami percaya konten premium harus bisa diakses semua orang. Daripada membebankan biaya langganan bulanan atau memaksa Anda menonton iklan yang mengganggu, kami menggunakan sistem berbasis interaksi. Dukungan Anda adalah mata uang di sini.',
            c2Title: 'Membangun Komunitas Asli',
            c2Desc: 'Dengan mewajibkan login Google yang aman untuk berkomentar, kami menyaring bot, spam, dan akun palsu. Ini memastikan bahwa setiap diskusi di ShadowClips adalah otentik, aman, dan digerakkan oleh manusia sungguhan.',
            c3Title: 'Mendukung Ekosistem',
            c3Desc: 'Setiap like dan komentar bijak yang Anda berikan langsung mendukung algoritma platform. Hal ini memotivasi kurator dan kreator kami untuk terus menghadirkan video eksklusif berkualitas tinggi secara konsisten.',
            c4Title: 'Privasi Terjaga:',
            c4Desc: 'Kami hanya menggunakan profil Google Anda untuk autentikasi dasar (Nama & Avatar). Kami tidak memiliki akses ke kata sandi, email pribadi, atau data rahasia Anda. 100% aman.'
        },
        en: {
            titleGuide: 'How to Unlock & VIP Perks',
            descGuide: 'A quick step-by-step guide to unlocking premium videos, high-speed download links, and exploring VIP exclusive benefits.',
            titleConcept: 'Our Community Philosophy',
            descConcept: 'Understanding why we use an engagement-based unlock system instead of expensive paid monthly subscriptions.',
            tabGuide: 'Access Guide & VIP',
            tabConcept: 'Why Login?',
            langBtn: 'Ganti ke Indonesia',

            // Tab 1: Guide
            step1Title: 'Sign In Securely',
            step1Desc: 'To interact with our premium content, you must first log in using your Google account. It\'s fast, secure, and requires no manual registration.',
            step2Title: 'Like & Comment',
            step2Desc: 'Show some love to the creators! Click the Like button and leave a meaningful Comment in the discussion section below the locked video.',
            step3Title: 'Enjoy Stream & Downloads',
            step3Desc: 'Once you have successfully liked and posted a comment, the exclusive video player and the high-speed download links will instantly unlock.',
            step4Title: 'Upgrade to Premium VIP',
            step4Desc: 'Become the community elite! VIP Members get an exclusive Gold Crown badge in comments, access to special Animated Avatar borders (Shadow, Dragon, etc.), and bypass comment moderation queues.',

            // Tab 2: Concept
            c1Title: 'No Paywalls, Just Engagement',
            c1Desc: 'We believe premium content should be accessible to everyone. Instead of charging monthly fees or forcing you through annoying ads, we use an engagement-based system. Your interaction is your currency.',
            c2Title: 'Building an Authentic Community',
            c2Desc: 'By requiring a secure Google login to leave a comment, we effectively filter out bots, spam, and malicious actors. This ensures that every discussion on ShadowClips is authentic and driven by real humans.',
            c3Title: 'Supporting the Ecosystem',
            c3Desc: 'Every like and thoughtful comment you leave directly supports the platform\'s algorithm. It motivates our curators to keep delivering high-quality, exclusive videos consistently.',
            c4Title: 'Privacy First:',
            c4Desc: 'We only use your Google profile for basic authentication (Name & Avatar). We do not have access to your personal emails, passwords, or private data. 100% safe.'
        }
    };

    const text = dict[lang]; // Pilih kamus berdasarkan bahasa aktif

    const tabs = [
        { id: 'guide', label: text.tabGuide, icon: <Unlock className="w-5 h-5" /> },
        { id: 'concept', label: text.tabConcept, icon: <Lightbulb className="w-5 h-5" /> }
    ];

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen transition-colors duration-300 border-none font-sans">

                {/* Header Section dengan Tombol Toggle Bahasa */}
                <div className="mb-10 sm:mb-14 relative border-none">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-none">
                        <div className="border-none max-w-2xl">
                            <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight transition-colors border-none leading-tight">
                                {activeTab === 'guide' ? text.titleGuide : text.titleConcept}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg transition-colors border-none leading-relaxed">
                                {activeTab === 'guide' ? text.descGuide : text.descConcept}
                            </p>
                        </div>

                        {/* Tombol Toggle Dua Bahasa */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border-none shrink-0"
                        >
                            <Globe className="w-5 h-5 text-[#106EBE] border-none" />
                            {text.langBtn}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-10 lg:gap-20 border-none">

                    {/* Sidebar / Menu Kiri */}
                    <div className="w-full md:w-56 flex-shrink-0 border-none">
                        <div className="flex flex-row md:flex-col gap-4 md:gap-6 sticky top-32 overflow-x-auto hide-scrollbar pb-2 md:pb-0 border-b border-zinc-200 dark:border-zinc-800/50 md:border-none transition-colors">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3.5 px-4 py-3 md:py-4 rounded-xl text-left font-black transition-all group whitespace-nowrap border-none outline-none ${activeTab === tab.id ? 'bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE]' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                        }`}
                                >
                                    <span className={`transition-colors border-none ${activeTab === tab.id ? 'text-[#106EBE] dark:text-[#0FFCBE]' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'}`}>
                                        {tab.icon}
                                    </span>
                                    <span className="tracking-wide text-[13px] sm:text-sm uppercase border-none">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Konten Utama */}
                    <div className="flex-1 relative min-h-[400px] border-none">

                        {/* TAB 1: PANDUAN AKSES & VIP */}
                        {activeTab === 'guide' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl border-none">
                                <div className="flex flex-col gap-10 sm:gap-14 border-none">

                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none border-none">
                                            01
                                        </div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none">{text.step1Title}</h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">
                                                {text.step1Desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none border-none">
                                            02
                                        </div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.step2Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><ThumbsUp className="w-4 h-4 border-none" /> <MessageSquare className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">
                                                {text.step2Desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none border-none">
                                            03
                                        </div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.step3Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Play className="w-4 h-4 border-none" /> <Download className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">
                                                {text.step3Desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 🚀 KEUNTUNGAN VIP KHUSUS 🚀 */}
                                    <div className="flex gap-5 sm:gap-8 group border-none mt-4 p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 dark:from-amber-500/5 to-transparent rounded-[2rem] border border-amber-500/20 dark:border-amber-500/10">
                                        <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] border-none mt-1">
                                            <Crown className="w-6 h-6 text-white border-none" />
                                        </div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-500 mb-2 tracking-tight transition-colors border-none">
                                                {text.step4Title}
                                            </h3>
                                            <p className="text-zinc-700 dark:text-zinc-300 text-[13px] sm:text-sm leading-relaxed transition-colors border-none font-medium">
                                                {text.step4Desc}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB 2: FILOSOFI KOMUNITAS (MENGAPA LOGIN?) */}
                        {activeTab === 'concept' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl border-none">
                                <div className="flex flex-col gap-10 sm:gap-12 pt-2 border-none">

                                    <div className="border-none">
                                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none flex items-center gap-3">
                                            <Star className="w-5 h-5 text-[#106EBE]" /> {text.c1Title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors border-none ml-8">
                                            {text.c1Desc}
                                        </p>
                                    </div>

                                    <div className="border-none">
                                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-[#106EBE]" /> {text.c2Title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors border-none ml-8">
                                            {text.c2Desc}
                                        </p>
                                    </div>

                                    <div className="border-none">
                                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none flex items-center gap-3">
                                            <ThumbsUp className="w-5 h-5 text-[#106EBE]" /> {text.c3Title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors border-none ml-8">
                                            {text.c3Desc}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-8 flex items-start gap-5 text-zinc-500 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors">
                                        <Users className="w-7 h-7 shrink-0 text-teal-500 dark:text-teal-400 border-none" />
                                        <p className="text-sm sm:text-base leading-relaxed border-none">
                                            <strong className="text-zinc-900 dark:text-white font-bold transition-colors border-none">{text.c4Title}</strong> {text.c4Desc}
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