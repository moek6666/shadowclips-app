import React from 'react';
import { Send, AlertTriangle, Shield, FileText, Scale } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-950 dark:to-[#106EBE]/10 py-8 mt-12 border-none transition-colors duration-300">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-zinc-500 dark:text-zinc-500 text-sm border-none">
                <div className="text-center lg:text-left border-none">
                    <p className="text-zinc-600 dark:text-zinc-400 border-none">&copy; {new Date().getFullYear()} ShadowClips. All rights reserved.</p>
                    <p className="mt-1 text-zinc-500 dark:text-zinc-500 border-none">Exclusive video streaming platform with the highest quality.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-5 sm:gap-6 font-medium border-none">
                    <a href="/page/dmca" className="flex items-center gap-1.5 group text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none">
                        <AlertTriangle className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors border-none" /> DMCA
                    </a>
                    <a href="/page/privacy" className="flex items-center gap-1.5 group text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none">
                        <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors border-none" /> Privacy Policy
                    </a>
                    <a href="/page/terms" className="flex items-center gap-1.5 group text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none">
                        <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors border-none" /> Terms of Service
                    </a>
                    <a href="/page/2257" className="flex items-center gap-1.5 group text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none">
                        <Scale className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors border-none" /> 18 U.S.C. 2257
                    </a>

                    <span className="hidden sm:block w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 border-none"></span>

                    <a
                        href="https://t.me/+fNTO4RPxpfNiMjg1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 group text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none"
                    >
                        <Send className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors border-none" /> Telegram
                    </a>
                </div>
            </div>
        </footer>
    );
}