import React, { useState, useEffect } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

export default function AgeVerification() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const storedData = localStorage.getItem('shadowclips_age_verified');
        let needsVerification = true;

        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                const currentTime = new Date().getTime();

                // Cek apakah data masih valid (belum kedaluwarsa)
                if (parsedData.verified && currentTime < parsedData.expiry) {
                    needsVerification = false;
                } else {
                    localStorage.removeItem('shadowclips_age_verified');
                }
            } catch {
                localStorage.removeItem('shadowclips_age_verified');
            }
        }

        if (needsVerification) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleAccept = () => {
        const daysToKeep = 3; // Verifikasi bertahan selama 3 hari
        const expiryDate = new Date().getTime() + (daysToKeep * 24 * 60 * 60 * 1000);

        const dataToStore = {
            verified: true,
            expiry: expiryDate
        };

        localStorage.setItem('shadowclips_age_verified', JSON.stringify(dataToStore));

        document.body.style.overflow = 'unset';
        setIsVisible(false);
    };

    const handleDecline = () => {
        // Jika menolak, langsung lempar ke Google
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white/95 dark:bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500 transition-colors">

            <div className="bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 sm:p-10 max-w-md w-full relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] text-center transition-all">

                {/* Efek Cahaya Kosmetik */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#106EBE]/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#106EBE]/10 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">

                    {/* Header Logo */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 w-full">

                        {/* 🔥 LOGO SVG TANPA EFEK GLOW 🔥 */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border-none">
                            <defs>
                                <clipPath id="play-clip-age">
                                    <path d="M22 25.5C22 18.5 29.5 14 35.5 17.5L82.5 44.5C88.5 48 88.5 57 82.5 60.5L35.5 87.5C29.5 91 22 86.5 22 79.5V25.5Z" />
                                </clipPath>
                                <linearGradient id="grad-top-age" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#32ADFF" />
                                    <stop offset="100%" stopColor="#007AFF" />
                                </linearGradient>
                                <linearGradient id="grad-left-age" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#007AFF" />
                                    <stop offset="100%" stopColor="#0052CC" />
                                </linearGradient>
                                <linearGradient id="grad-bottom-age" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#003D82" />
                                    <stop offset="100%" stopColor="#001233" />
                                </linearGradient>
                            </defs>
                            <g clipPath="url(#play-clip-age)">
                                <polygon points="0,0 100,0 100,52.5 45,52.5" fill="url(#grad-top-age)" />
                                <polygon points="0,100 45,52.5 100,52.5 100,100" fill="url(#grad-bottom-age)" />
                                <polygon points="0,0 45,52.5 0,100" fill="url(#grad-left-age)" />
                            </g>
                        </svg>

                        <div className="flex flex-col justify-center text-left">
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none mb-1 transition-colors">
                                Shadow<span className="text-[#106EBE]">Clips</span>
                            </span>
                            <span className="text-[10px] sm:text-[12px] font-bold tracking-[0.22em] text-[#106EBE] dark:text-[#A0B3C6] uppercase ml-[1px] leading-none transition-colors">
                                www.shadowclips.asia
                            </span>
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center justify-center gap-2 transition-colors">
                        Age Verification
                    </h2>

                    <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm sm:text-base leading-relaxed transition-colors">
                        This site contains exclusive age-restricted content. Please verify that you are <strong className="text-zinc-900 dark:text-white">18 years of age or older</strong>.
                    </p>

                    {/* Tombol Aksi */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAccept}
                            className="w-full font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-[#106EBE] text-white shadow-[0_0_20px_rgba(16,110,190,0.4)] hover:shadow-[0_0_30px_rgba(16,110,190,0.6)] hover:bg-[#0e5c9f] hover:scale-[1.02] cursor-pointer outline-none border-none"
                        >
                            <LogIn className="w-5 h-5 border-none" />
                            I am 18+ (Enter)
                        </button>

                        <button
                            onClick={handleDecline}
                            className="w-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-900/40 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#0FFCBE] font-bold py-3.5 px-6 rounded-xl transition-colors cursor-pointer outline-none border-none"
                        >
                            I am under 18 (Exit)
                        </button>
                    </div>

                    {/* Footer Peringatan */}
                    <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-bold border-none">
                        <AlertTriangle className="w-3 h-3 border-none" /> 18 U.S.C. 2257 Compliant
                    </div>
                </div>
            </div>
        </div>
    );
}