import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AgeVerification() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isVerified = localStorage.getItem('shadowclips_age_verified');
        if (!isVerified) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('shadowclips_age_verified', 'true');
        document.body.style.overflow = 'unset';
        setIsVisible(false);
    };

    const handleDecline = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 max-w-md w-full relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] text-center">

                {/* Ambient Glow Biru Halus */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#106EBE]/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#106EBE]/10 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">

                    {/* --- LOGO BARU (SVG + TEKS) IDENTIK NAVBAR --- */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 w-full">
                        <svg
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(16,110,190,0.5)]"
                        >
                            <polygon points="20,2 36,10 36,30 20,38 4,30 4,10" stroke="#106EBE" strokeWidth="3.5" strokeLinejoin="round" />
                            <path d="M16 13L27 20L16 27V13Z" fill="#106EBE" />
                        </svg>
                        <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                            Shadow<span className="text-[#106EBE]">Clips</span>
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        Verifikasi Umur
                    </h2>

                    <p className="text-zinc-400 mb-8 text-sm sm:text-base leading-relaxed">
                        Situs web ini berisi konten eksklusif yang dibatasi usia. Dengan masuk, Anda mengonfirmasi bahwa Anda berusia <strong>18 tahun atau lebih</strong>.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAccept}
                            className="w-full bg-[#106EBE] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(16,110,190,0.4)] hover:shadow-[0_0_30px_rgba(16,110,190,0.6)] hover:bg-[#0e5c9f]"
                        >
                            Saya Berusia 18+ (Masuk)
                        </button>

                        <button
                            onClick={handleDecline}
                            className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-[#0FFCBE] font-bold py-3.5 px-6 rounded-xl transition-colors border border-transparent hover:border-zinc-700"
                        >
                            Saya di Bawah 18 Tahun (Keluar)
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                        <AlertTriangle className="w-3 h-3" /> 18 U.S.C. 2257 Compliant
                    </div>
                </div>
            </div>
        </div>
    );
}