import React from 'react';

export default function App() {
    const TARGET_URL = "https://dutaklip.click";

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-300 flex flex-col justify-center items-center p-6 sm:p-12 font-sans selection:bg-zinc-700 selection:text-zinc-100">
            {/* Main Content Area */}
            <main className="w-full max-w-xl text-center flex flex-col items-center">
                
                {/* Judul Utama */}
                <h1 className="text-3xl sm:text-4xl font-light text-zinc-100 tracking-tight leading-relaxed mb-6">
                    Shadowclips Kini Berpindah ke <br className="hidden sm:inline" />
                    <span className="font-semibold text-white">dutaklip.click</span>
                </h1>

                {/* Deskripsi Soft */}
                <p className="text-zinc-400 text-base sm:text-lg font-normal leading-relaxed mb-10 max-w-md">
                    Seluruh konten dan layanan resmi telah dialihkan ke alamat baru. Silakan lanjutkan kunjungan Anda melalui tombol di bawah ini.
                </p>

                {/* Tombol Klik Manual */}
                <a
                    href={TARGET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-sm rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-zinc-800 text-center tracking-wide"
                >
                    Buka dutaklip.click
                </a>
            </main>

            {/* Footer Sederhana */}
            <footer className="absolute bottom-8 text-center">
                <p className="text-xs text-zinc-600">
                    &copy; {new Date().getFullYear()} shadowclips.asia &bull; All rights reserved.
                </p>
            </footer>
        </div>
    );
}