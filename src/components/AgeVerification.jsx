import React, { useState, useEffect } from 'react';

export default function AgeVerification() {
    const [isVisible, setIsVisible] = useState(false);

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
        const daysToKeep = 3; 
        const expiryDate = new Date().getTime() + (daysToKeep * 24 * 60 * 60 * 1000);

        localStorage.setItem('shadowclips_age_verified', JSON.stringify({ verified: true, expiry: expiryDate }));

        document.body.style.overflow = 'unset';
        setIsVisible(false);
    };

    const handleDecline = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 font-sans bg-white dark:bg-zinc-900 transition-colors duration-300">
            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16 animate-in fade-in duration-500">
                
                {/* Bagian Gambar Kiri (Layout Menyamping) */}
                <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                    <img 
                        src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/Original%20Shadowclips/shadowclips.webp" // Masukkan file PNG Anda di sini
                        alt="18+ Warning" 
                        className="w-full h-full object-contain drop-shadow-xl"
                    />
                </div>

                {/* Bagian Teks & Tombol Kanan */}
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-zinc-900 dark:text-white transition-colors duration-300">
                        This site is for adults only!
                    </h1>
                    
                    <p className="text-sm md:text-base mb-8 leading-relaxed text-zinc-600 dark:text-zinc-400 transition-colors duration-300">
                        This website contains explicit material intended for adults aged 18 and over. If you are under 18 or it is illegal for you to access this content in your location, please leave the site now. By continuing, you confirm that you are at least 18 years old.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full max-w-md mx-auto md:mx-0">
                        {/* Tombol Accept (Natural tanpa glow) */}
                        <button 
                            onClick={handleAccept}
                            className="flex-1 font-bold text-base py-3.5 px-6 rounded-xl transition-all cursor-pointer bg-[#106EBE] text-white hover:bg-[#0e5c9f]"
                        >
                            I'm 18 or older
                        </button>
                        
                        {/* Tombol Decline Outline */}
                        <button 
                            onClick={handleDecline}
                            className="flex-1 font-bold text-base py-3.5 px-6 rounded-xl border-2 transition-all cursor-pointer bg-transparent text-zinc-600 border-zinc-300 hover:bg-zinc-100 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}