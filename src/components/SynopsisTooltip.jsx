import React from 'react';
import { Info } from 'lucide-react';

export default function SynopsisTooltip({ text }) {
    // Logika Pintar: Jika sinopsis kosong, null, atau 'EMPTY', komponen ini menghilang sepenuhnya.
    if (!text || text.trim() === '' || text === 'EMPTY') return null;

    return (
        <div className="relative group flex items-center justify-center cursor-help">
            <span className="flex items-center gap-1.5 font-bold text-zinc-400 group-hover:text-[#0FFCBE] transition-colors bg-zinc-800/40 px-3 py-1 rounded-full shadow-sm">
                <Info className="w-4 h-4 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> Synopsis
            </span>

            {/* Kontainer Tooltip: Ekstra Lebar & Efek Kaca Buram (Glassmorphism) */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[320px] md:w-[480px] lg:w-[520px] p-6 bg-zinc-900/60 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-400 z-[100] pointer-events-none transform translate-y-4 group-hover:translate-y-0">

                <h4 className="text-white text-base md:text-lg font-black mb-3 flex items-center gap-2 drop-shadow-md">
                    <Info className="w-5 h-5 text-[#106EBE]" /> Synopsis
                </h4>

                <p className="text-[13.5px] md:text-[14.5px] text-zinc-200 text-left font-medium leading-relaxed whitespace-pre-wrap max-h-[320px] overflow-y-auto custom-scrollbar pr-3">
                    {text}
                </p>

                {/* Segitiga Panah ke Bawah (Transparan menyesuaikan efek kaca) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-zinc-900/60 backdrop-blur-sm"></div>
            </div>
        </div>
    );
}