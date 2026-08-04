import React, { useState } from 'react';
import { Search, Menu, X, Home, Compass, Flame, FolderOpen } from 'lucide-react';

export default function Navbar({ searchInput, setSearchInput, isScrolled }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = window.location.pathname;

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gradient-to-r from-zinc-950 via-zinc-950 to-[#106EBE]/10 backdrop-blur-md border-b border-[#106EBE]/20 py-3' : 'bg-gradient-to-b from-zinc-950/90 to-transparent py-5'}`}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex justify-between items-center">

                {/* --- AREA LOGO --- */}
                <a href="/" className="flex items-center gap-3 group z-50">
                    <svg
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(16,110,190,0.4)]"
                    >
                        <polygon points="20,2 36,10 36,30 20,38 4,30 4,10" stroke="#106EBE" strokeWidth="3.5" strokeLinejoin="round" />
                        <path d="M16 13L27 20L16 27V13Z" fill="#106EBE" />
                    </svg>
                    <span className="text-xl sm:text-2xl font-black tracking-tighter text-white group-hover:opacity-90 transition-opacity">
                        Shadow<span className="text-[#106EBE]">Clips</span>
                    </span>
                </a>

                {/* --- MENU DESKTOP --- */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#0FFCBE] transition-colors w-4 h-4" />
                        <input
                            type="text"
                            value={searchInput || ''}
                            onChange={(e) => setSearchInput && setSearchInput(e.target.value)}
                            placeholder="Cari film atau klip..."
                            className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2 pl-11 pr-5 w-72 focus:outline-none focus:border-[#106EBE] focus:bg-black transition-all text-sm text-white placeholder:text-zinc-600 backdrop-blur-sm shadow-[0_0_15px_rgba(16,110,190,0)] focus:shadow-[0_0_15px_rgba(16,110,190,0.2)]"
                        />
                    </div>

                    <div className="flex gap-6 text-sm font-bold">
                        <a href="/" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <Home className={`w-4 h-4 transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} />
                            Beranda
                        </a>
                        <a href="/jelajahi" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <Compass className={`w-4 h-4 transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} />
                            Jelajahi
                        </a>
                        <a href="/populer" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <Flame className={`w-4 h-4 transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} />
                            Populer
                        </a>
                        <a href="/koleksi" className={`flex items-center gap-1.5 group transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                            <FolderOpen className={`w-4 h-4 transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} />
                            Koleksi
                        </a>
                    </div>
                </div>

                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-zinc-300 z-50">
                    {isMobileMenuOpen ? <X className="w-6 h-6 hover:text-[#0FFCBE] transition-colors" /> : <Menu className="w-6 h-6 hover:text-[#0FFCBE] transition-colors" />}
                </button>
            </div>

            {/* --- MENU MOBILE --- */}
            <div className={`md:hidden absolute top-0 left-0 w-full bg-gradient-to-r from-zinc-950 via-zinc-950 to-[#106EBE]/10 border-b border-[#106EBE]/20 backdrop-blur-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] pt-24 pb-6 px-4 shadow-[0_10px_30px_rgba(16,110,190,0.1)]' : 'max-h-0'}`}>
                <div className="relative mb-6 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#0FFCBE] transition-colors w-4 h-4" />
                    <input
                        type="text"
                        value={searchInput || ''}
                        onChange={(e) => setSearchInput && setSearchInput(e.target.value)}
                        placeholder="Cari tayangan..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3.5 pl-11 pr-5 focus:outline-none focus:border-[#106EBE] transition-all text-sm text-white"
                    />
                </div>
                <div className="flex flex-col gap-4 text-base font-bold px-2">
                    <a href="/" className={`flex items-center gap-2 group transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                        <Home className={`w-5 h-5 transition-colors ${pathname === '/' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Beranda
                    </a>
                    <a href="/jelajahi" className={`flex items-center gap-2 group transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                        <Compass className={`w-5 h-5 transition-colors ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Jelajahi
                    </a>
                    <a href="/populer" className={`flex items-center gap-2 group transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                        <Flame className={`w-5 h-5 transition-colors ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Populer
                    </a>
                    <a href="/koleksi" className={`flex items-center gap-2 group transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-zinc-400 hover:text-[#0FFCBE]'}`}>
                        <FolderOpen className={`w-5 h-5 transition-colors ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-[#106EBE] group-hover:text-[#0FFCBE]'}`} /> Koleksi
                    </a>
                </div>
            </div>
        </nav>
    );
}