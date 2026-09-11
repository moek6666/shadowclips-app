import React from 'react';
import { Info } from 'lucide-react';

export default function SynopsisTooltip({ text }) {
    if (!text || text.trim() === '' || text === 'EMPTY') return null;

    return (
        <div className="relative group flex items-center justify-center cursor-help">
            <span className="flex items-center gap-1.5 font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#0FFCBE] transition-colors bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-transparent px-3 py-1 rounded-full shadow-sm">
                <Info className="w-4 h-4 text-[#106EBE] group-hover:text-[#106EBE] dark:group-hover:text-[#0FFCBE] transition-colors" /> Synopsis
            </span>

            <div className="
                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-400 z-[120] pointer-events-none transform

                /* 🔥 MOBILE: Fixed persis di tengah layar + Efek Glassmorphism (Blur/Transparan) Elegan */
                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-[90vw] max-w-[340px] p-6 rounded-3xl
                bg-white/40 dark:bg-black/50 backdrop-blur-2xl border border-white/50 dark:border-zinc-600/30
                shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)]

                /* 💻 DESKTOP: Dikembalikan 100% sama seperti aslinya (Tooltip Absolute) */
                sm:absolute sm:top-auto sm:bottom-full sm:mb-3 sm:left-1/2 
                sm:translate-y-4 sm:group-hover:translate-y-0
                sm:w-[480px] lg:w-[520px] sm:p-6
                sm:bg-white/90 sm:dark:bg-zinc-900/60 sm:border-zinc-100 sm:dark:border-transparent
                sm:shadow-[0_20px_40px_rgba(0,0,0,0.1)] sm:dark:shadow-[0_30px_60px_rgba(0,0,0,0.9)]
            ">

                <h4 className="text-zinc-900 dark:text-white text-base md:text-lg font-black mb-3 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-md transition-colors">
                    <Info className="w-5 h-5 text-[#106EBE]" /> Synopsis
                </h4>

                {/* Teks diberi sedikit drop-shadow agar tetap terbaca jelas di atas background transparan */}
                <p className="text-[13.5px] md:text-[14.5px] text-zinc-900 dark:text-zinc-100 text-left font-medium leading-relaxed whitespace-pre-wrap max-h-[40vh] sm:max-h-[320px] overflow-y-auto custom-scrollbar pr-2 sm:pr-3 transition-colors drop-shadow-sm">
                    {text}
                </p>

                {/* Segitiga hanya ditampilkan di Desktop, disembunyikan di Mobile agar pop-up tengah terlihat rapi */}
                <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-white/90 dark:border-t-zinc-900/60 backdrop-blur-sm transition-colors"></div>
            </div>
        </div>
    );
}