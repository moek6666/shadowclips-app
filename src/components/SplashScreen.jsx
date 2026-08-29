import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
    const [fade, setFade] = useState(false);

    useEffect(() => {
        // Mulai transisi memudar setelah 2.5 detik
        const timer = setTimeout(() => {
            setFade(true);
        }, 2500);

        // Hilangkan komponen dari DOM (selesai)
        const removeTimer = setTimeout(() => {
            if (onFinish) onFinish();
        }, 3200);

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-700 ease-in-out ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            <div className="relative flex flex-col items-center z-10 select-none">

                {/* LOGO SVG ASLI DARI NAVBAR BOS (Diperbesar) */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 drop-shadow-md">
                    <defs>
                        <clipPath id="splash-play-clip">
                            <path d="M22 25.5C22 18.5 29.5 14 35.5 17.5L82.5 44.5C88.5 48 88.5 57 82.5 60.5L35.5 87.5C29.5 91 22 86.5 22 79.5V25.5Z" />
                        </clipPath>
                        <linearGradient id="splash-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#32ADFF" />
                            <stop offset="100%" stopColor="#007AFF" />
                        </linearGradient>
                        <linearGradient id="splash-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#007AFF" />
                            <stop offset="100%" stopColor="#0052CC" />
                        </linearGradient>
                        <linearGradient id="splash-grad-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#003D82" />
                            <stop offset="100%" stopColor="#001233" />
                        </linearGradient>
                    </defs>
                    <g clipPath="url(#splash-play-clip)">
                        <polygon points="0,0 100,0 100,52.5 45,52.5" fill="url(#splash-grad-top)" />
                        <polygon points="0,100 45,52.5 100,52.5 100,100" fill="url(#splash-grad-bottom)" />
                        <polygon points="0,0 45,52.5 0,100" fill="url(#splash-grad-left)" />
                    </g>
                </svg>

                {/* Teks Merek */}
                <div className="flex flex-col items-center mt-6">
                    <span className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none mb-1">
                        Shadow<span className="text-[#106EBE]">Clips</span>
                    </span>
                    <span className="text-[11px] sm:text-[13px] font-bold tracking-[0.22em] text-[#A0B3C6] uppercase ml-[1px] leading-none">
                        www.shadowclips.asia
                    </span>
                </div>
            </div>
        </div>
    );
}