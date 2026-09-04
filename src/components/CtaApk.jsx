import React from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export default function CtaApk({ onClose }) {
    if (window.location.pathname === '/download-apk') return null;

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 bg-white dark:bg-[#161921] shadow-2xl rounded-2xl p-2.5 pr-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="w-9 h-9 bg-[#106EBE]/10 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-[#106EBE]" />
            </div>

            <div className="flex flex-col">
                <span className="text-[12px] font-bold text-zinc-900 dark:text-white leading-tight">ShadowClips App</span>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Lebih cepat & stabil</span>
            </div>

            <div className="flex items-center gap-1.5 ml-1">
                <a
                    href="/download-apk"
                    title="Unduh APK"
                    className="bg-[#106EBE] hover:bg-[#0E5B9E] text-white p-2 rounded-xl transition-colors flex items-center justify-center border-none cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                </a>

                <button
                    onClick={onClose}
                    title="Tutup"
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer border-none"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}