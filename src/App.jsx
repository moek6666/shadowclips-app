import React, { useState, useEffect, Suspense, lazy } from 'react';

// 1. IMPORT KOMPONEN GLOBAL (Tetap biasa karena selalu muncul di semua halaman)
import AgeVerification from './components/AgeVerification';
import AntiAdBlock from './components/AntiAdBlock';
import SliderAd from './components/SliderAd';

// 2. CODE SPLITTING / LAZY LOADING HALAMAN
// Halaman ini hanya akan di-download jika URL-nya cocok
const Home = lazy(() => import('./pages/Home'));
const Streaming = lazy(() => import('./pages/Streaming'));
const Populer = lazy(() => import('./pages/Populer'));
const LegalPages = lazy(() => import('./pages/LegalPages'));
const Koleksi = lazy(() => import('./pages/Koleksi'));
const DetailKoleksi = lazy(() => import('./pages/DetailKoleksi'));
const DetailCategory = lazy(() => import('./pages/DetailCategory'));
const Jelajahi = lazy(() => import('./pages/Jelajahi'));

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

    useEffect(() => {
        loadSupabase().then((supa) => {
            const client = supa.createClient(SUPABASE_URL, SUPABASE_KEY);
            setSupabase(client);
        });
    }, []);

    const pathname = window.location.pathname;

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-rose-600 selection:text-white relative">
            <style>{`
        body { background-color: #121212; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            <AgeVerification />
            <AntiAdBlock />
            <SliderAd />

            {/* 3. BUNGKUS DENGAN SUSPENSE UNTUK MENCEGAH CRASH SAAT FILE JS SEDANG DI-DOWNLOAD */}
            <Suspense fallback={
                <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin shadow-[0_0_20px_rgba(16,110,190,0.5)]"></div>
                </div>
            }>
                {pathname.startsWith('/streaming/') ? (
                    <Streaming supabase={supabase} />
                ) : pathname.startsWith('/page/') ? (
                    <LegalPages />
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