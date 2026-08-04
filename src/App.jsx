import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Streaming from './pages/Streaming';
import Populer from './pages/Populer';
import LegalPages from './pages/LegalPages';
import Koleksi from './pages/Koleksi';
import DetailKoleksi from './pages/DetailKoleksi';
import DetailCategory from './pages/DetailCategory';
import Jelajahi from './pages/Jelajahi';
import AgeVerification from './components/AgeVerification';
import AntiAdBlock from './components/AntiAdBlock';
import SliderAd from './components/SliderAd';

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
        </div>
    );
}