import { useState, useEffect } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function AgeVerification() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHuman, setIsHuman] = useState(false);

    useEffect(() => {
        const storedData = localStorage.getItem('shadowclips_age_verified');
        let needsVerification = true;

        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                const currentTime = new Date().getTime();

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
        if (!isHuman) return;

        const daysToKeep = 3;
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
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-8 sm:p-10 max-w-md w-full relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] text-center">

                <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#106EBE]/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#106EBE]/10 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">

                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 w-full">
                        {/* LOGO BARU (SVG HEXAGON) KONSISTEN DENGAN NAVBAR */}
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_0_12px_rgba(16,110,190,0.8)] shrink-0">
                            <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" stroke="#106EBE" strokeWidth="8" strokeLinejoin="round" />
                            <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" stroke="#106EBE" strokeWidth="3.5" strokeLinejoin="round" opacity="0.9" />
                            <polygon points="43,36 64,50 43,64" stroke="#106EBE" strokeWidth="3" strokeLinejoin="round" fill="rgba(16, 110, 190, 0.3)" />
                        </svg>

                        <div className="flex flex-col justify-center text-left">
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter text-white leading-none mb-1">
                                Shadow<span className="text-[#106EBE]">Clips</span>
                            </span>
                            <span className="text-[10px] sm:text-[12px] font-bold tracking-[0.22em] text-[#A0B3C6] uppercase ml-[1px] leading-none">
                                www.shadowclips.asia
                            </span>
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        Age Verification
                    </h2>

                    <p className="text-zinc-400 mb-6 text-sm sm:text-base leading-relaxed">
                        This site contains exclusive age-restricted content. Please verify that you are human and <strong>18 years of age or older</strong>.
                    </p>

                    <div className="flex justify-center mb-6 min-h-[65px]">
                        <Turnstile
                            siteKey="0x4AAAAAAEI8owBAGHjSd7E5"
                            onSuccess={() => setIsHuman(true)}
                            onError={() => setIsHuman(false)}
                            onExpire={() => setIsHuman(false)}
                            options={{ theme: 'dark' }}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAccept}
                            disabled={!isHuman}
                            className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isHuman
                                ? 'bg-[#106EBE] text-white shadow-[0_0_20px_rgba(16,110,190,0.4)] hover:shadow-[0_0_30px_rgba(16,110,190,0.6)] hover:bg-[#0e5c9f] hover:scale-[1.02] cursor-pointer'
                                : 'bg-zinc-800/50 text-zinc-600 shadow-none cursor-not-allowed'
                                }`}
                        >
                            {isHuman && <LogIn className="w-5 h-5" />}
                            I am 18+ (Enter)
                        </button>

                        <button
                            onClick={handleDecline}
                            className="w-full bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-[#0FFCBE] font-bold py-3.5 px-6 rounded-xl transition-colors"
                        >
                            I am under 18 (Exit)
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