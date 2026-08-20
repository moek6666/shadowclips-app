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

        const rawUrls = src.split(',').map(s => s.trim());
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
                tagUrl: 'https://s.magsrv.com/v1/vast.php?idz=6002940',
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
            const labels = [1080, 720, 480, 360];
            const videoSources = [];

            rawUrls.forEach((url, index) => {
                if (url && url !== 'EMPTY') {
                    videoSources.push({
                        src: url,
                        type: 'video/mp4',
                        size: labels[index] || 360
                    });
                }
            });

            const availableSizes = videoSources.map(s => s.size).sort((a, b) => b - a);

            plyrOptions.quality = {
                default: availableSizes[0],
                options: availableSizes,
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
            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(16,110,190,0.15)] flex items-center justify-center animate-pulse border border-zinc-300 dark:border-zinc-800 transition-colors">
                <div className="w-12 h-12 border-4 border-zinc-300 dark:border-zinc-800 border-t-[#106EBE] dark:border-t-[#106EBE] rounded-full animate-spin"></div>
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
                
                .shadowclips-plyr-wrapper .plyr__control--overlaid {
                    background: transparent !important;
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) scale(2.5) !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                    transition: all 0.3s ease !important;
                }
                .shadowclips-plyr-wrapper .plyr__control--overlaid:hover,
                .shadowclips-plyr-wrapper .plyr__control--overlaid[aria-expanded=true] {
                    background: transparent !important;
                    color: #fff !important;
                    transform: translate(-50%, -50%) scale(2.8) !important;
                }
                .shadowclips-plyr-wrapper .plyr__control--overlaid svg {
                    filter: drop-shadow(0px 8px 16px rgba(0,0,0,0.6)) !important;
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