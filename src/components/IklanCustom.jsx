import React from 'react';
import { ExternalLink } from 'lucide-react'; // 🔥 Ikon Sparkles sudah dihapus 🔥

export default function IklanCustom({
    imgUrl = "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Cover/Banner.webp",
    targetUrl = "https://tevi.com/@Bytesun-TigerSlot/s/tQ5axR",
    altText = "Premium Sponsor",
    className = ""
}) {
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ad-breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                }
                .animate-ad-breathe {
                    animation: ad-breathe 4s ease-in-out infinite;
                }
                
                @keyframes ad-shine {
                    0% { transform: translateX(-150%) skewX(-15deg); }
                    15% { transform: translateX(250%) skewX(-15deg); }
                    100% { transform: translateX(250%) skewX(-15deg); }
                }
                .animate-ad-shine {
                    animation: ad-shine 5s ease-in-out infinite;
                }
                `
            }} />

            <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative block w-full max-w-[320px] mx-auto overflow-hidden rounded-2xl shadow-sm dark:shadow-none hover:shadow-[0_10px_30px_rgba(16,110,190,0.2)] transition-all duration-300 transform hover:-translate-y-1 border border-zinc-200 dark:border-zinc-800/80 group bg-zinc-100 dark:bg-zinc-900 ${className}`}
            >
                {/* ✨ EFEK KILAUAN CAHAYA LEWAT (SHINE) ✨ */}
                <div className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none animate-ad-shine mix-blend-overlay"></div>

                {/* 📸 GAMBAR IKLAN UTAMA (ANIMASI BERNAPAS) 📸 */}
                <img
                    src={imgUrl}
                    alt={altText}
                    className="w-full h-auto object-cover border-none animate-ad-breathe group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                />

                {/* 🖱️ OVERLAY MUNCUL SAAT DI-HOVER 🖱️ */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center border-none pointer-events-none z-20 opacity-0 group-hover:opacity-100">
                    <div className="bg-[#106EBE] text-white px-4 py-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl border border-white/10">
                        Kunjungi Sponsor <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                </div>
            </a>
        </>
    );
}