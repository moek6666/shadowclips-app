import React, { useState, useEffect } from 'react';
import { Download, ShieldAlert, ArrowDownCircle, Settings, CheckCircle2, Globe, FileDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DownloadApk({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [lang, setLang] = useState('id');

    const apkDownloadLink = "https://1024terabox.com/s/1bOrSuhTJuuUgbJlE4pk45g";
    const logoUrl = "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Cover/Logo%20APK/shadowclips_apk.webp";
    const bannerUrl = "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Cover/Archu%20TT%20.webp";

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLang(prev => prev === 'id' ? 'en' : 'id');
    };

    const dict = {
        id: {
            title: 'Unduh ShadowClips Mobile',
            desc: 'Nikmati pengalaman streaming video eksklusif tanpa batas, kecepatan tinggi, dan akses bebas blokir langsung dari genggaman Anda.',
            langBtn: 'Switch to English',
            btnInstall: 'Download',
            version: 'Versi 1.0.0',
            release: 'Dirilis: September 2026',
            alertTitle: 'Informasi Keamanan (Play Protect)',
            alertDesc: 'Karena aplikasi ini didistribusikan secara independen, sistem Android mungkin menampilkan peringatan standar. Sistem kami terverifikasi aman dan bersih.',
            tutorialTitle: 'Panduan Pemasangan Cepat',
            step1Title: 'Unduh File APK',
            step1Desc: 'Ketuk tombol unduh dan tunggu file tersimpan sempurna di penyimpanan perangkat Anda.',
            step2Title: 'Izinkan Instalasi',
            step2Desc: 'Buka pengaturan perangkat Anda, lalu aktifkan opsi pemasangan aplikasi dari sumber tidak dikenal jika diminta.',
            step3Title: 'Lewati Peringatan',
            step3Desc: 'Jika layar peringatan muncul saat instalasi, cukup ketuk "Detail selengkapnya", lalu pilih "Tetap instal".',
            step4Title: 'Selesai & Masuk',
            step4Desc: 'Buka aplikasi ShadowClips, masuk dengan akun Google Anda, dan nikmati seluruh konten eksklusif.'
        },
        en: {
            title: 'Download ShadowClips Mobile',
            desc: 'Experience unlimited exclusive video streaming, lightning-fast speed, and restriction-free access right from your device.',
            langBtn: 'Ganti ke Indonesia',
            btnInstall: 'Download',
            version: 'Version 1.0.0',
            release: 'Released: September 2026',
            alertTitle: 'Security Information (Play Protect)',
            alertDesc: 'Since this app is distributed independently, Android may show a standard warning. Our system is verified safe and clean.',
            tutorialTitle: 'Quick Setup Guide',
            step1Title: 'Download APK File',
            step1Desc: 'Tap the download button and wait for the file to save completely to your device storage.',
            step2Title: 'Allow Installation',
            step2Desc: 'Open your device settings and enable app installation from unknown sources if prompted.',
            step3Title: 'Bypass Warning',
            step3Desc: 'If a warning screen appears during installation, simply tap "More details" and select "Install anyway".',
            step4Title: 'Done & Sign In',
            step4Desc: 'Open the ShadowClips app, log in with your Google account, and enjoy all exclusive contents.'
        }
    };

    const text = dict[lang];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0E1116] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-blue-500/30">
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-36 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8">

                {/* Header Section */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight text-zinc-900 dark:text-white">
                                {text.title}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl">
                                {text.desc}
                            </p>
                        </div>
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2.5 bg-zinc-100 dark:bg-[#161921] hover:bg-zinc-200 dark:hover:bg-[#1f232e] text-zinc-700 dark:text-zinc-300 px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 cursor-pointer"
                        >
                            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                            {text.langBtn}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row-reverse gap-10 lg:gap-16 items-start">

                    {/* Kolom Kanan: Download Card & Alert (Tanpa Border) */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-6 sticky top-32">

                        {/* Play Store Style Card */}
                        <div className="bg-zinc-50 dark:bg-[#161921] rounded-[1.5rem] overflow-hidden flex flex-col group">

                            {/* Card Header / Banner Atas dengan Gambar Custom */}
                            <div className="w-full aspect-[16/9] relative bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                                <img src={bannerUrl} alt="ShadowClips Banner" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#161921] dark:via-transparent dark:to-transparent z-10 pointer-events-none"></div>
                            </div>

                            {/* Card Body / Info App & Tombol */}
                            <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-20">

                                <div className="flex items-center gap-4 flex-1">
                                    {/* Logo Aplikasi */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white dark:bg-[#0E1116] rounded-2xl p-1.5 overflow-hidden shadow-sm">
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                                    </div>

                                    {/* Teks Informasi */}
                                    <div className="flex flex-col justify-center">
                                        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white leading-tight mb-1">ShadowClips</h2>
                                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{text.version}</p>
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-0.5">{text.release}</p>
                                    </div>
                                </div>

                                {/* Tombol Download */}
                                <a
                                    href={apkDownloadLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-7 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto shadow-md shadow-blue-500/20"
                                >
                                    <Download className="w-4 h-4" />
                                    {text.btnInstall}
                                </a>

                            </div>
                        </div>

                        {/* Security Alert */}
                        <div className="bg-amber-50 dark:bg-amber-500/5 p-5 rounded-[1.5rem] flex items-start gap-4">
                            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-500 mb-1.5">{text.alertTitle}</h4>
                                <p className="text-[13px] text-amber-800/80 dark:text-amber-200/70 leading-relaxed font-medium">
                                    {text.alertDesc}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Kolom Kiri: Tutorial */}
                    <div className="flex-1 w-full pt-4">
                        <div className="mb-10 pb-4">
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-zinc-900 dark:text-white">
                                <FileDown className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                {text.tutorialTitle}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-10">
                            <div className="flex gap-6 group relative">
                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 leading-none select-none w-14 transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-300">01</div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step1Title} <ArrowDownCircle className="w-5 h-5 text-blue-500" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{text.step1Desc}</p>
                                </div>
                            </div>

                            <div className="flex gap-6 group relative">
                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 leading-none select-none w-14 transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-300">02</div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step2Title} <Settings className="w-5 h-5 text-blue-500" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{text.step2Desc}</p>
                                </div>
                            </div>

                            <div className="flex gap-6 group relative">
                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 leading-none select-none w-14 transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-300">03</div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step3Title} <ShieldAlert className="w-5 h-5 text-blue-500" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">{text.step3Desc}</p>

                                    <div className="bg-transparent border border-zinc-200 dark:border-[#272A35] rounded-xl p-5 max-w-sm">
                                        <div className="flex flex-col gap-3">
                                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prompt Example:</div>
                                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between bg-zinc-50 dark:bg-[#161921] p-3 rounded-lg">
                                                More details <ChevronDownIcon />
                                            </div>
                                            <div className="text-blue-600 dark:text-blue-400 py-2.5 px-4 text-center text-sm font-bold hover:underline cursor-pointer">
                                                Install anyway
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 group relative">
                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-600 dark:to-zinc-800 leading-none select-none w-14 transition-all duration-300 group-hover:from-emerald-500 group-hover:to-emerald-300">04</div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step4Title} <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{text.step4Desc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);