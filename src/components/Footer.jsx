import React from 'react';
import { Send, AlertTriangle, Shield, FileText, Scale } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-zinc-950 via-zinc-950 to-[#106EBE]/10 py-8 mt-12">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-zinc-500 text-sm">
                <div className="text-center lg:text-left">
                    <p>&copy; {new Date().getFullYear()} ShadowClips. All rights reserved.</p>
                    <p className="mt-1">Platform streaming video eksklusif dengan kualitas terbaik.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-5 sm:gap-6 font-medium">
                    <a href="/page/dmca" className="flex items-center gap-1.5 group hover:text-[#0FFCBE] transition-colors">
                        <AlertTriangle className="w-4 h-4 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> DMCA
                    </a>
                    <a href="/page/privacy" className="flex items-center gap-1.5 group hover:text-[#0FFCBE] transition-colors">
                        <Shield className="w-4 h-4 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> Privacy Policy
                    </a>
                    <a href="/page/terms" className="flex items-center gap-1.5 group hover:text-[#0FFCBE] transition-colors">
                        <FileText className="w-4 h-4 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> Terms of Service
                    </a>
                    <a href="/page/2257" className="flex items-center gap-1.5 group hover:text-[#0FFCBE] transition-colors">
                        <Scale className="w-4 h-4 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> 18 U.S.C. 2257
                    </a>

                    <span className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700"></span>

                    <a
                        href="https://t.me/+fNTO4RPxpfNiMjg1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 group hover:text-[#0FFCBE] transition-colors"
                    >
                        <Send className="w-4 h-4 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> Telegram
                    </a>
                </div>
            </div>
        </footer>
    );
}