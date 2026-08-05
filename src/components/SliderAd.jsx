import React, { useEffect, useRef } from 'react';

export default function SliderAd() {
    const adRef = useRef(null);

    useEffect(() => {
        // Cek agar script tidak di-load ganda saat berpindah halaman
        if (adRef.current && !adRef.current.querySelector('script')) {
            const s = document.createElement('script');
            s.settings = {};
            s.src = "//winding-hurt.com/b/XxVqsqd.GUlf0cYHWGcD/OejmV9SuyZjU/lgktP/T/cGyPOpDDgwxiOzTycStGNuzAIU4EOCD-IDw/MKQ_";
            s.async = true;
            s.referrerPolicy = "no-referrer-when-downgrade";

            // Masukkan script TEPAT di dalam div komponen ini, bukan di ujung body
            adRef.current.appendChild(s);
        }
    }, []);

    // Memberikan wadah agar penyedia iklan punya pijakan elemen di DOM
    return <div ref={adRef} className="slider-ad-container pointer-events-none" style={{ position: 'relative', zIndex: 50 }}></div>;
}