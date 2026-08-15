import React, { useEffect } from 'react';

export default function ExoclickBanner() {
    useEffect(() => {
        // 1. Load script Ad-Provider jika belum ada di dalam DOM
        let script = document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]');
        if (!script) {
            script = document.createElement('script');
            script.async = true;
            script.type = 'application/javascript';
            script.src = 'https://a.magsrv.com/ad-provider.js';
            document.head.appendChild(script);
        }

        // 2. Eksekusi perintah serve dari Exoclick setelah komponen di-render
        window.AdProvider = window.AdProvider || [];
        window.AdProvider.push({ "serve": {} });
    }, []);

    return (
        <div className="col-span-full flex justify-center items-center my-8 overflow-hidden py-2 w-full border-none">
            {/* Tag INS dari Exoclick */}
            <ins className="eas6a97888e2" data-zoneid="6002932" data-sub="123450000"></ins>
        </div>
    );
}