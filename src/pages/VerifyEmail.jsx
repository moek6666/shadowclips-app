import React from 'react';
import { X, Sparkles, ArrowLeft } from 'lucide-react';

export default function VerifyEmail() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">

            {/* ========================================== */}
            {/* 1. DEKORASI BACKGROUND (FLAT DESIGN CONFETTI) */}
            {/* ========================================== */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                {/* Pola Silang (Cross) */}
                <div className="absolute top-[20%] left-[15%] text-[#106EBE]/30 dark:text-[#106EBE]/50 transform -rotate-12"><X className="w-8 h-8" strokeWidth={4} /></div>
                <div className="absolute bottom-[25%] right-[15%] text-teal-400/40 dark:text-teal-400/60 transform rotate-12"><X className="w-6 h-6" strokeWidth={4} /></div>
                <div className="absolute top-[30%] right-[20%] text-zinc-300 dark:text-zinc-700 transform rotate-45"><X className="w-5 h-5" strokeWidth={4} /></div>
                <div className="absolute bottom-[20%] left-[25%] text-zinc-300 dark:text-zinc-700 transform -rotate-45"><X className="w-7 h-7" strokeWidth={4} /></div>

                {/* Pola Sparkles */}
                <div className="absolute top-[40%] left-[15%] text-teal-400/40 dark:text-teal-400/60 animate-pulse"><Sparkles className="w-6 h-6" /></div>
                <div className="absolute top-[20%] right-[25%] text-[#106EBE]/40 dark:text-[#106EBE]/60 animate-pulse delay-150"><Sparkles className="w-8 h-8" /></div>
                <div className="absolute bottom-[35%] left-[20%] text-zinc-300 dark:text-zinc-700 animate-pulse delay-300"><Sparkles className="w-5 h-5" /></div>

                {/* Pola Lingkaran */}
                <div className="absolute top-[45%] right-[15%] w-4 h-4 rounded-full border-4 border-zinc-200 dark:border-zinc-700"></div>
                <div className="absolute bottom-[40%] right-[25%] w-3 h-3 rounded-full bg-[#106EBE]/30 dark:bg-[#106EBE]/50"></div>
                <div className="absolute bottom-[15%] left-[35%] w-5 h-5 rounded-full border-4 border-teal-400/30 dark:border-teal-400/50"></div>
            </div>

            {/* ========================================== */}
            {/* 2. KONTEN UTAMA HALAMAN */}
            {/* ========================================== */}
            <div className="relative z-10 flex flex-col items-center max-w-3xl w-full text-center">

                {/* Ilustrasi Amplop Adaptif Terang & Gelap Tanpa Glow */}
                <div className="relative transform hover:scale-105 transition-transform duration-500 mb-8 sm:mb-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-56 h-56 sm:w-72 sm:h-72 drop-shadow-2xl">
                        {/* Amplop Belakang */}
                        <path d="M20,90 l80,-60 l80,60" className="fill-[#e0f2fe] dark:fill-zinc-700 stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />

                        {/* Kertas Surat */}
                        <path d="M40,50 h120 v90 h-120 z" className="fill-white dark:fill-zinc-800 stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />

                        {/* Ikon Jam (Menunggu Verifikasi) */}
                        <circle cx="100" cy="90" r="22" className="fill-[#2dd4bf] dark:fill-teal-500 stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" />
                        <path d="M100,78 v12 l8,8" className="stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Garis-garis tulisan di kertas */}
                        <path d="M55,65 h30 M115,120 h30 M55,130 h80" className="stroke-zinc-400 dark:stroke-zinc-500 transition-colors" strokeWidth="4" strokeLinecap="round" />

                        {/* Amplop Badan Utama */}
                        <path d="M20,90 v70 a10,10 0 0,0 10,10 h140 a10,10 0 0,0 10,-10 v-70 l-80,55 z" className="fill-[#106EBE] stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />

                        {/* Amplop Flap Bawah */}
                        <path d="M20,170 l80,-55 l80,55 z" className="fill-[#38bdf8] stroke-zinc-900 dark:stroke-white transition-colors" strokeWidth="6" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Teks Judul */}
                <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight drop-shadow-sm">
                    Cek Kotak Masuk Anda!
                </h1>

                {/* Teks Digabung Tanpa Container Terpisah */}
                <p className="text-[14px] sm:text-[15px] font-medium text-zinc-500 dark:text-zinc-400 mb-10 max-w-lg leading-relaxed px-4">
                    Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan klik tautan tersebut untuk mengaktifkan akun <strong className="text-[#106EBE] dark:text-[#38bdf8]">ShadowClips</strong> Anda. Jangan lupa periksa juga folder Spam atau Junk jika tidak menemukannya di kotak masuk utama.
                </p>

                {/* Tombol Kembali Tanpa Border Line */}
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-4 bg-zinc-200/60 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-[13px] sm:text-[14px] font-bold tracking-wide transition-all outline-none border-none cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> KEMBALI KE BERANDA
                </button>

            </div>

            {/* Copyright */}
            <p className="absolute bottom-6 text-zinc-400 dark:text-zinc-600 text-[11px] font-medium">
                © {new Date().getFullYear()} ShadowClips. All rights reserved.
            </p>
        </div>
    );
}