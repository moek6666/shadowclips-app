import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';

export default function CustomPlayer({ src, poster }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const hlsRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const setupEnvironment = async () => {
            if (!document.getElementById('plyr-css')) {
                const link = document.createElement('link');
                link.id = 'plyr-css';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
                document.head.appendChild(link);
            }

            if (!window.Hls) {
                const scriptHls = document.createElement('script');
                scriptHls.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
                document.body.appendChild(scriptHls);
                await new Promise((resolve) => { scriptHls.onload = resolve; scriptHls.onerror = resolve; });
            }

            if (!window.google || !window.google.ima) {
                const scriptIma = document.createElement('script');
                scriptIma.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
                document.body.appendChild(scriptIma);
                await new Promise((resolve) => { scriptIma.onload = resolve; scriptIma.onerror = resolve; });
            }

            if (!isMounted) return;
            setIsReady(true);
        };

        setupEnvironment();

        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!isReady || !videoRef.current || !src) return;

        const videoElement = videoRef.current;

        // 1. PECAH LINK TAPI JANGAN DIBUANG YANG KOSONG DULU AGAR POSISI BANGKU TIDAK BERGESER
        const rawUrls = src.split(',').map(s => s.trim());

        // Cari link pertama yang benar-benar ada isinya (untuk cek apakah ini m3u8 / HLS)
        const validUrls = rawUrls.filter(url => url && url !== 'EMPTY');
        if (validUrls.length === 0) return;

        const isHLS = validUrls[0].toLowerCase().includes('.m3u8');

        const plyrOptions = {
            controls: [
                'play-large', 'play', 'progress', 'current-time',
                'duration', 'mute', 'volume', 'settings', 'fullscreen'
            ],
            settings: ['quality', 'speed'],
            keyboard: { focused: true, global: true },
            ads: {
                enabled: true,
                // Kode VAST Iklan Anda Tetap Berjalan Aman
                tagUrl: 'https://direct-league.com/djmJFkzGd.GUNhv/ZYGOUA/ceMmd9/u/ZWUJlBkYPDT/cuypO/DDcG5iNcTGMwtSNpzBIM4/N/z/kD1/NJyzZCsza/W/1ipVdzDS0/xH',
            }
        };

        if (isHLS && window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hlsRef.current = hls;

            hls.loadSource(validUrls[0]);
            hls.attachMedia(videoElement);

            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                playerRef.current = new Plyr(videoElement, plyrOptions);
            });
        } else {
            // 2. LOGIKA PINTAR PEMINDAI JUMLAH LINK & POSISI KOSONG
            // Urutan Baku (Nomor Bangku): Index 0 = 1080p, Index 1 = 720p, Index 2 = 480p, Index 3 = 360p
            const labels = [1080, 720, 480, 360];

            const videoSources = [];

            // Periksa setiap bangku satu per satu
            rawUrls.forEach((url, index) => {
                // Jika di bangku tersebut ada link (bukan sekadar enter/spasi), daftarkan ke Plyr
                if (url && url !== 'EMPTY') {
                    videoSources.push({
                        src: url,
                        type: 'video/mp4',
                        size: labels[index] || 360 // Beri label sesuai nomor bangkunya
                    });
                }
            });

            // Kumpulkan resolusi apa saja yang berhasil didaftarkan (Misal: cuma 720 dan 480)
            // Lalu urutkan dari yang terbesar ke terkecil agar defaultnya selalu yang paling jernih
            const availableSizes = videoSources.map(s => s.size).sort((a, b) => b - a);

            // Injeksi pengaturan kualitas agar HANYA menampilkan ukuran yang tersedia
            plyrOptions.quality = {
                default: availableSizes[0], // Otomatis putar kualitas tertinggi yang tersedia
                options: availableSizes,    // Sembunyikan label (misal 1080p) jika linknya tidak ada
                forced: true
            };

            playerRef.current = new Plyr(videoElement, plyrOptions);

            playerRef.current.source = {
                type: 'video',
                sources: videoSources,
                poster: poster
            };
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isReady, src, poster]);

    if (!src) {
        return (
            <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(16,110,190,0.15)] flex items-center justify-center animate-pulse border border-zinc-800">
                <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-[0_0_40px_rgba(16,110,190,0.15)] group shadowclips-plyr-wrapper">

            <style dangerouslySetInnerHTML={{
                __html: `
                .shadowclips-plyr-wrapper {
                    width: 100%;
                    height: 100%;
                    --plyr-color-main: #106EBE;
                    --plyr-video-control-color-hover: #0FFCBE;
                    --plyr-video-controls-background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.85));
                }
                .shadowclips-plyr-wrapper .plyr {
                    height: 100%;
                    width: 100%;
                    border-radius: 0.75rem; 
                }
                .shadowclips-plyr-wrapper .plyr__video-wrapper {
                    height: 100%;
                    width: 100%;
                    background: #000;
                }
                .plyr__control--overlaid {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) scale(1.2) !important;
                    margin: 0 !important;
                    box-shadow: 0 0 25px rgba(16, 110, 190, 0.5) !important;
                }
            `}} />

            <video
                ref={videoRef}
                className="w-full h-full"
                playsInline
            ></video>
        </div>
    );
}