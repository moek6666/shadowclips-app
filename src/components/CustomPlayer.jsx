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
        const isHLS = src.toLowerCase().includes('.m3u8');

        const plyrOptions = {
            controls: [
                'play-large', 'play', 'progress', 'current-time',
                'duration', 'mute', 'volume', 'settings', 'fullscreen'
            ],
            settings: ['quality', 'speed'],
            keyboard: { focused: true, global: true },
            ads: {
                enabled: true,
                tagUrl: 'https://direct-league.com/d.mAFQzydnGQNtvdZZGoUu/TeYm-9huiZ/UMl/kCPIT/cyyiOxD/c/5/N-TaMathNkzvIm4oNmzHkH1hNCypZisGasWZ1ipSdwDY0bxS',
            }
        };

        if (isHLS && window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hlsRef.current = hls;

            hls.loadSource(src);
            hls.attachMedia(videoElement);

            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                playerRef.current = new Plyr(videoElement, plyrOptions);
            });
        } else {
            videoElement.src = src;
            playerRef.current = new Plyr(videoElement, plyrOptions);
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
    }, [isReady, src]);

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
                poster={poster}
            ></video>
        </div>
    );
}