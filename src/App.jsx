import React, { useState, useEffect } from 'react';

export default function App() {
    const TARGET_URL = "https://dutaklip.click";
    const [countdown, setCountdown] = useState(10);

    // Hitung mundur otomatis (Opsional: pengunjung dialihkan setelah 10 detik jika tidak mengklik)
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = TARGET_URL;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0f12] text-zinc-300 flex flex-col justify-between items-center p-6 sm:p-12 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Header Mini / Brand Mark */}
            <header className="w-full max-w-2xl flex justify-between items-center pt-2">
                <span className="text-xs tracking-widest uppercase font-mono text-zinc-500">
                    Domain Update
                </span>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800/80">
                    shadowclips.asia &rarr; dutaklip.click
                </span>
            </header>

            {/* Main Content Area (Tanpa Box Container/Cards) */}
            <main className="w-full max-w-xl text-center my-auto py-12 flex flex-col items-center">
                
                {/* Soft Glowing Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    Situs Resmi Telah Pindah
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-100 tracking-tight leading-tight mb-4">
                    Kami Telah Melakukan Presensi & Pembaharuan Domain
                </h1>

                {/* Subtitle / Deskripsi Soft */}
                <p className="text-zinc-400 text-base sm:text-lg font-normal leading-relaxed mb-10 max-w-lg">
                    Layanan dan konten lengkap dari <span className="text-zinc-200 font-medium">Shadowclips</span> kini secara resmi dialihkan ke domain baru kami di <span className="text-zinc-100 font-medium border-b border-indigo-500/40">dutaklip.click</span>.
                </p>

                {/* Call To Action Buttons & Countdown */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                    <a
                        href={TARGET_URL}
                        className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-all duration-300 shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg text-center"
                    >
                        Kunjungi dutaklip.click
                    </a>
                </div>

                {/* Indikator Alih Otomatis Lembut */}
                <p className="text-xs font-mono text-zinc-500 mt-6">
                    Mengarahkan secara otomatis dalam <span className="text-indigo-400 font-semibold">{countdown}</span> detik...
                </p>
            </main>

            {/* Simple Clean Footer */}
            <footer className="w-full max-w-2xl text-center border-t border-zinc-800/50 pt-6">
                <p className="text-xs text-zinc-600">
                    &copy; {new Date().getFullYear()} dutaklip.click. Seluruh hak cipta dilindungi.
                </p>
            </footer>
        </div>
    );
}