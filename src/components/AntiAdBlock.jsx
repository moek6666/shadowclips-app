import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Info } from 'lucide-react';

export default function AntiAdBlock() {
    const [isAdBlockActive, setIsAdBlockActive] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let hasChecked = false;
        let checkTimer;
        let fallbackTimer;

        const checkAdBlocker = () => {
            const script = document.createElement('script');
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
            script.async = true;

            script.onerror = () => {
                if (isMounted) {
                    setIsAdBlockActive(true);
                    document.body.style.overflow = 'hidden';
                }
            };

            script.onload = () => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };

            document.head.appendChild(script);
        };

        const triggerCheck = () => {
            if (hasChecked) return;
            hasChecked = true;

            checkTimer = setTimeout(checkAdBlocker, 500);

            ['click', 'scroll', 'touchstart'].forEach(event => {
                document.removeEventListener(event, triggerCheck);
            });
        };

        ['click', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, triggerCheck, { passive: true });
        });

        fallbackTimer = setTimeout(triggerCheck, 3000);

        return () => {
            isMounted = false;
            clearTimeout(checkTimer);
            clearTimeout(fallbackTimer);
            ['click', 'scroll', 'touchstart'].forEach(event => {
                document.removeEventListener(event, triggerCheck);
            });
        };
    }, []);

    if (!isAdBlockActive) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in fade-in duration-500">
            <div className="relative bg-zinc-950 border border-zinc-800 p-8 sm:p-10 rounded-[2rem] max-w-md w-full shadow-[0_20px_60px_-15px_rgba(16,110,190,0.15)] overflow-hidden">

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 mb-6 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center transform rotate-3 shadow-lg">
                        <Heart className="w-10 h-10 text-[#106EBE] animate-pulse" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Dukung ShadowClips
                    </h2>

                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                        Kami berusaha menyajikan tayangan gratis dan berkualitas untuk Anda.
                        Namun, biaya <span className="text-[#106EBE] font-bold">server dan pemeliharaan</span> kami sangat bergantung pada dukungan iklan.
                        <br /><br />
                        Mohon <strong className="text-zinc-200">matikan AdBlocker</strong> khusus untuk situs kami agar Anda bisa lanjut menonton. Terima kasih atas pengertiannya!
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="group relative w-full flex items-center justify-center gap-2 bg-[#106EBE] hover:bg-[#0c5c9f] text-white font-bold py-3.5 sm:py-4 px-8 rounded-xl transition-all duration-300 shadow-lg"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Saya Sudah Mematikannya
                        </span>
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                        <Info className="w-3.5 h-3.5" />
                        Membantu menjaga server tetap hidup
                    </div>
                </div>
            </div>
        </div>
    );
}