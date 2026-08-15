import React, { useState, useEffect, Suspense, lazy } from 'react';

// 1. IMPORT KOMPONEN GLOBAL
import AgeVerification from './components/AgeVerification';
import AntiAdBlock from './components/AntiAdBlock';

// 2. CODE SPLITTING / LAZY LOADING HALAMAN
const Home = lazy(() => import('./pages/Home'));
const Streaming = lazy(() => import('./pages/Streaming'));
const Populer = lazy(() => import('./pages/Populer'));
const LegalPages = lazy(() => import('./pages/LegalPages'));
const Koleksi = lazy(() => import('./pages/Koleksi'));
const DetailKoleksi = lazy(() => import('./pages/DetailKoleksi'));
const DetailCategory = lazy(() => import('./pages/DetailCategory'));
const Jelajahi = lazy(() => import('./pages/Jelajahi'));
const Tutorial = lazy(() => import('./pages/Tutorial'));

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const loadSupabase = () => {
    return new Promise((resolve) => {
        if (window.supabase) {
            resolve(window.supabase);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve(window.supabase);
        document.body.appendChild(script);
    });
};

export default function App() {
    const [supabase, setSupabase] = useState(null);
    const [showFloatingAd, setShowFloatingAd] = useState(false);

    // Inisialisasi Supabase
    useEffect(() => {
        loadSupabase().then((supa) => {
            const client = supa.createClient(SUPABASE_URL, SUPABASE_KEY);
            setSupabase(client);
        });
    }, []);

    // Deteksi scroll untuk menampilkan tombol bantuan
    useEffect(() => {
        const handleScroll = () => {
            setShowFloatingAd(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const pathname = window.location.pathname;

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-rose-600 selection:text-white relative overflow-x-hidden">
            <style>{`
        body { background-color: #121212; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            <AgeVerification />
            <AntiAdBlock />

            {/* FLOATING TUTORIAL BUTTON ASLI */}
            <a
                href="/tutorial"
                className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-gradient-to-r from-zinc-900 to-[#106EBE]/20 backdrop-blur-xl p-2.5 pr-5 rounded-full flex items-center gap-3 transition-all duration-500 hover:scale-105 group border-none outline-none focus:outline-none focus:ring-0 ${showFloatingAd ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                style={{ border: 'none', outline: 'none' }}
            >
                <div className="bg-[#106EBE] p-2.5 rounded-full group-hover:bg-[#0FFCBE] transition-colors flex items-center justify-center border-none outline-none">
                    <svg className="w-5 h-5 text-white group-hover:text-zinc-900 transition-colors relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider text-[#0FFCBE] leading-none mb-0.5">Need Help?</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-zinc-300 leading-none">How to play exclusive videos</span>
                </div>
            </a>

            {/* ROUTING ASLI */}
            <Suspense fallback={
                <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin shadow-[0_0_20px_rgba(16,110,190,0.5)]"></div>
                </div>
            }>
                {pathname.startsWith('/streaming/') ? (
                    <Streaming supabase={supabase} />
                ) : pathname.startsWith('/page/') ? (
                    <LegalPages />
                ) : pathname === '/tutorial' ? (
                    <Tutorial supabase={supabase} />
                ) : pathname === '/populer' ? (
                    <Populer supabase={supabase} />
                ) : pathname === '/koleksi' ? (
                    <Koleksi supabase={supabase} />
                ) : pathname.startsWith('/koleksi/') ? (
                    <DetailKoleksi supabase={supabase} />
                ) : pathname.startsWith('/kategori/') ? (
                    <DetailCategory supabase={supabase} />
                ) : pathname === '/jelajahi' ? (
                    <Jelajahi supabase={supabase} />
                ) : (
                    <Home supabase={supabase} />
                )}
            </Suspense>
        </div>
    );
}