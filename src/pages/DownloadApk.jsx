import React, { useState, useEffect } from 'react';
import { Download, ShieldAlert, Smartphone, ArrowDownCircle, Settings, CheckCircle2, Globe, FileDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DownloadApk({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [lang, setLang] = useState('id');

    const apkDownloadLink = "https://1024terabox.com/s/1oJPSjmAggbE5ViURIUGgTQ";

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
            btnDownload: 'Unduh APK Sekarang',
            versionInfo: 'Versi 1.0.0 • Android 8.0+ • Diperbarui 2026',

            alertTitle: 'Informasi Keamanan (Play Protect)',
            alertDesc: 'Karena aplikasi ini didistribusikan secara independen, sistem Android mungkin menampilkan peringatan standar. Sistem kami terverifikasi 100% aman dan bersih.',

            tutorialTitle: 'Panduan Pemasangan Cepat',
            step1Title: 'Unduh File APK',
            step1Desc: 'Ketuk tombol unduh di sebelah kiri dan tunggu file tersimpan sempurna di penyimpanan perangkat Anda.',
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
            btnDownload: 'Download APK Now',
            versionInfo: 'Version 1.0.0 • Android 8.0+ • Updated 2026',

            alertTitle: 'Security Information (Play Protect)',
            alertDesc: 'Since this app is distributed independently, Android may show a standard warning. Our system is verified 100% safe and clean.',

            tutorialTitle: 'Quick Setup Guide',
            step1Title: 'Download APK File',
            step1Desc: 'Tap the download button on the left and wait for the file to save completely to your device storage.',
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
        <div className="min-h-screen bg-white dark:bg-[#0E1116] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-36 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8">

                {/* Header Section */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight text-zinc-900 dark:text-white">
                                {text.title}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
                                {text.desc}
                            </p>
                        </div>
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 cursor-pointer"
                        >
                            <Globe className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                            {text.langBtn}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

                    {/* Left Column: Download Card & Alert */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-6 sticky top-32">

                        <div className="bg-zinc-50 dark:bg-[#13161D] p-8 sm:p-10 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden">
                            <div className="w-20 h-20 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-2xl flex items-center justify-center mb-6">
                                <Smartphone className="w-10 h-10 text-zinc-700 dark:text-zinc-300" />
                            </div>

                            <h2 className="text-2xl font-black mb-1 text-zinc-900 dark:text-white">ShadowClips</h2>
                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-8 tracking-wide">{text.versionInfo}</p>

                            <a
                                href={apkDownloadLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <Download className="w-5 h-5" />
                                {text.btnDownload}
                            </a>
                        </div>

                        <div className="bg-zinc-50 dark:bg-[#13161D] p-6 sm:p-8 rounded-[1.5rem] flex items-start gap-4">
                            <ShieldAlert className="w-6 h-6 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-1">{text.alertTitle}</h4>
                                <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                    {text.alertDesc}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Installation Tutorial */}
                    <div className="flex-1 w-full bg-zinc-50 dark:bg-[#13161D] p-8 sm:p-12 rounded-[2rem]">
                        <div className="mb-10 pb-4">
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-zinc-900 dark:text-white">
                                <FileDown className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                                {text.tutorialTitle}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-10">
                            <div className="flex gap-5 sm:gap-6 group">
                                <div className="text-3xl sm:text-4xl font-black text-zinc-300 dark:text-zinc-800 transition-colors leading-none select-none">01</div>
                                <div>
                                    <h4 className="text-base font-bold mb-1 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step1Title} <ArrowDownCircle className="w-4 h-4 text-zinc-400" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">{text.step1Desc}</p>
                                </div>
                            </div>

                            <div className="flex gap-5 sm:gap-6 group">
                                <div className="text-3xl sm:text-4xl font-black text-zinc-300 dark:text-zinc-800 transition-colors leading-none select-none">02</div>
                                <div>
                                    <h4 className="text-base font-bold mb-1 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step2Title} <Settings className="w-4 h-4 text-zinc-400" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">{text.step2Desc}</p>
                                </div>
                            </div>

                            <div className="flex gap-5 sm:gap-6 group">
                                <div className="text-3xl sm:text-4xl font-black text-zinc-300 dark:text-zinc-800 transition-colors leading-none select-none">03</div>
                                <div>
                                    <h4 className="text-base font-bold mb-1 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step3Title} <ShieldAlert className="w-4 h-4 text-zinc-400" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-3">{text.step3Desc}</p>

                                    <div className="bg-white dark:bg-[#0E1116] rounded-xl p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="text-[11px] font-semibold text-zinc-400">Android Prompt Example:</div>
                                            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">More details ▾</div>
                                            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-1.5 px-3 rounded-lg text-center text-xs font-bold">
                                                Install anyway
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-5 sm:gap-6 group">
                                <div className="text-3xl sm:text-4xl font-black text-zinc-300 dark:text-zinc-800 transition-colors leading-none select-none">04</div>
                                <div>
                                    <h4 className="text-base font-bold mb-1 flex items-center gap-2 text-zinc-900 dark:text-white">
                                        {text.step4Title} <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                                    </h4>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">{text.step4Desc}</p>
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