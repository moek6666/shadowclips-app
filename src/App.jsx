import React, { useState, useEffect, Suspense, lazy } from 'react';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen as CapSplash } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

// 1. IMPORT KOMPONEN GLOBAL
import AgeVerification from './components/AgeVerification';
import AntiAdBlock from './components/AntiAdBlock';
import ExoclickPopunder from './components/ExoclickPopunder';
import CustomSplashScreen from './components/SplashScreen';

// 2. CODE SPLITTING / LAZY LOADING HALAMAN
const Home = lazy(() => import('./pages/Home'));
const Streaming = lazy(() => import('./pages/Streaming'));
const Populer = lazy(() => import('./pages/Populer'));
const LegalPages = lazy(() => import('./pages/LegalPages'));
const Koleksi = lazy(() => import('./pages/Koleksi'));
const Jelajahi = lazy(() => import('./pages/Jelajahi'));
const Tutorial = lazy(() => import('./pages/Tutorial'));
const Profile = lazy(() => import('./pages/Profile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifiedSuccess = lazy(() => import('./pages/VerifiedSuccess'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));

// ROUTING FOLDER BARU
const DetailCategory = lazy(() => import('./pages/Category/DetailCategory'));
const DetailKoleksi = lazy(() => import('./pages/colection/DetailKoleksi'));

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

    // Splash screen HANYA tampil sekali di sesi pertama aplikasi dibuka (Native + Belum pernah dimuat)
    const [showSplash, setShowSplash] = useState(() => {
        if (!Capacitor.isNativePlatform()) return false;
        const hasLoadedBefore = sessionStorage.getItem('shadowclips_splash_shown');
        if (hasLoadedBefore) return false;
        return true;
    });

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapSplash.hide().catch(() => { });
        }

        loadSupabase().then((supa) => {
            const client = supa.createClient(SUPABASE_URL, SUPABASE_KEY);
            setSupabase(client);
        });

        // Tangkap URL balikan dari login Google/Discord OAuth (Deep Linking APK)
        const urlListener = CapApp.addListener('appUrlOpen', async ({ url }) => {
            if (url && url.includes('com.shadowclips.app')) {
                const queryParams = new URL(url.replace('#', '?')).searchParams;
                const accessToken = queryParams.get('access_token');
                const refreshToken = queryParams.get('refresh_token');

                if (accessToken && refreshToken && window.supabase) {
                    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                    await client.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    window.location.href = '/profile';
                }
            }
        });

        // Penanganan tombol kembali (back button) khusus Android APK agar tidak langsung exit
        const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
            const currentPath = window.location.pathname;

            if (currentPath === '/') {
                CapApp.exitApp();
            } else if (window.history.length > 1) {
                window.history.back();
            } else {
                CapApp.exitApp();
            }
        });

        return () => {
            urlListener.then(listener => listener.remove());
            backButtonListener.then(listener => listener.remove());
        };
    }, []);

    const handleSplashFinish = () => {
        setShowSplash(false);
        if (Capacitor.isNativePlatform()) {
            sessionStorage.setItem('shadowclips_splash_shown', 'true');
        }
    };

    const pathname = window.location.pathname;

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 font-sans selection:bg-[#106EBE] selection:text-white relative overflow-x-hidden transition-colors duration-300">
            <style>{`
        body { background-color: transparent; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

            {showSplash && <CustomSplashScreen onFinish={handleSplashFinish} />}

            <AgeVerification />
            <AntiAdBlock />
            <ExoclickPopunder />

            <Suspense fallback={
                <div className="min-h-screen bg-zinc-50 dark:bg-[#121212] flex items-center justify-center transition-colors duration-300">
                    <div className="w-14 h-14 border-4 border-zinc-200 dark:border-zinc-800 border-t-[#106EBE] dark:border-t-[#106EBE] rounded-full animate-spin shadow-[0_0_20px_rgba(16,110,190,0.2)] dark:shadow-[0_0_20px_rgba(16,110,190,0.5)]"></div>
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
                ) : pathname.startsWith('/category/') ? (
                    <DetailCategory supabase={supabase} />
                ) : pathname === '/jelajahi' ? (
                    <Jelajahi supabase={supabase} />
                ) : pathname === '/profile' ? (
                    <Profile supabase={supabase} />
                ) : pathname === '/verify-email' ? (
                    <VerifyEmail />
                ) : pathname === '/verified-success' ? (
                    <VerifiedSuccess />
                ) : pathname === '/update-password' ? (
                    <UpdatePassword supabase={supabase} />
                ) : (
                    <Home supabase={supabase} />
                )}
            </Suspense>
        </div>
    );
}