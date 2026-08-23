import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function VerifiedSuccess() {

    // 🔥 PENTING: Mencegah auto-login setelah klik email secara total
    useEffect(() => {
        // 1. Hapus jejak token rahasia dari URL agar Supabase tidak sempat membacanya
        if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
        }

        // 2. Fungsi untuk memaksa sistem keluar (logout)
        const forceLogout = async () => {
            if (window.supabase) {
                await window.supabase.auth.signOut();
            }
            // Sapu bersih sisa sesi di penyimpanan browser
            for (let key in localStorage) {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                }
            }
        };

        // 3. Eksekusi dengan jeda sedikit agar tidak bentrok dengan loading awal
        setTimeout(forceLogout, 500);
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">

            {/* DEKORASI BACKGROUND (FLAT DESIGN CONFETTI) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                <div className="absolute top-[15%] left-[20%] text-[#106EBE]/30 dark:text-[#106EBE]/50 transform rotate-45"><X className="w-8 h-8" strokeWidth={4} /></div>
                <div className="absolute bottom-[20%] right-[20%] text-teal-400/40 dark:text-teal-400/60 transform rotate-45"><X className="w-6 h-6" strokeWidth={4} /></div>
                <div className="absolute top-[25%] right-[15%] text-zinc-300 dark:text-zinc-700 transform rotate-45"><X className="w-5 h-5" strokeWidth={4} /></div>
                <div className="absolute bottom-[25%] left-[15%] text-zinc-300 dark:text-zinc-700 transform rotate-45"><X className="w-7 h-7" strokeWidth={4} /></div>

                <div className="absolute top-[35%] left-[10%] text-teal-400/40 dark:text-teal-400/60 animate-pulse"><Sparkles className="w-6 h-6" /></div>
                <div className="absolute top-[15%] right-[30%] text-[#106EBE]/40 dark:text-[#106EBE]/60 animate-pulse delay-150"><Sparkles className="w-8 h-8" /></div>
                <div className="absolute bottom-[30%] left-[30%] text-zinc-300 dark:text-zinc-700 animate-pulse delay-300"><Sparkles className="w-5 h-5" /></div>

                <div className="absolute top-[40%] right-[10%] w-4 h-4 rounded-full border-4 border-zinc-200 dark:border-zinc-700"></div>
                <div className="absolute bottom-[35%] right-[30%] w-3 h-3 rounded-full bg-[#106EBE]/30 dark:bg-[#106EBE]/50"></div>
                <div className="absolute bottom-[15%] left-[40%] w-5 h-5 rounded-full border-4 border-teal-400/30 dark:border-teal-400/50"></div>
            </div>

            {/* KONTEN UTAMA HALAMAN */}
            <div className="relative z-10 flex flex-col items-center max-w-3xl w-full text-center">

                {/* Ilustrasi Amplop Flat Design Adaptif */}
                <div className="relative transform hover:-translate-y-2 transition-transform duration-500 mb-8 sm:mb-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-56 h-56 sm:w-72 sm:h-72 drop-shadow-2xl">
                        <path d="M20,90 l80,-60 l80,60" className="fill-[#e0f2fe] dark:fill-zinc-700 stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />
                        <path d="M40,50 h120 v90 h-120 z" className="fill-white dark:fill-zinc-800 stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />
                        <path d="M75,90 l20,20 l40,-40" stroke="#106EBE" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M55,115 h50 M55,130 h80" className="stroke-zinc-400 dark:stroke-zinc-500 transition-colors" strokeWidth="4" strokeLinecap="round" />
                        <path d="M20,90 v70 a10,10 0 0,0 10,10 h140 a10,10 0 0,0 10,-10 v-70 l-80,55 z" className="fill-[#106EBE] stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />
                        <path d="M20,170 l80,-55 l80,55 z" className="fill-[#38bdf8] stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#106EBE] mb-2 sm:mb-4 tracking-tight drop-shadow-sm">
                    Congratulations!
                </h1>
                <h2 className="text-lg sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-10">
                    Email Verified!!
                </h2>

                <button
                    onClick={() => window.location.href = '/'}
                    className="px-10 sm:px-14 py-4 sm:py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-[14px] sm:text-[15px] font-black tracking-wide transition-all hover:scale-105 active:scale-95 shadow-xl dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] outline-none border-none cursor-pointer"
                >
                    SIGN IN TO ACCOUNT
                </button>

            </div>

            <p className="absolute bottom-6 text-zinc-400 dark:text-zinc-600 text-[11px] font-medium">
                © {new Date().getFullYear()} ShadowClips. All rights reserved.
            </p>
        </div>
    );
}