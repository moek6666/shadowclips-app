import React from 'react';
import { Send } from 'lucide-react';

export default function TelegramBanner() {
    return (
        <div className="w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-rose-950/30 border border-zinc-800 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-[0_10px_30px_rgba(225,29,72,0.1)]">

            <div className="absolute -inset-24 bg-rose-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-500/10 rounded-full flex items-center justify-center border border-zinc-700 shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                    <Send className="w-6 h-6 text-rose-400 ml-1" />
                </div>
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">Dapatkan Update Tercepat!</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm">Video terbaru otomatis di-posting di channel Telegram kami.</p>
                </div>
            </div>

            <a
                href="https://t.me/+fNTO4RPxpfNiMjg1"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 whitespace-nowrap bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
                <Send className="w-4 h-4" /> Gabung Sekarang
            </a>
        </div>
    );
}