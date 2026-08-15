import React, { useEffect } from 'react';

export default function ExoclickNative() {
    useEffect(() => {
        let script = document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]');
        if (!script) {
            script = document.createElement('script');
            script.async = true;
            script.type = 'application/javascript';
            script.src = 'https://a.magsrv.com/ad-provider.js';
            document.head.appendChild(script);
        }

        window.AdProvider = window.AdProvider || [];
        window.AdProvider.push({ "serve": {} });
    }, []);

    return (
        <div className="w-full mt-10 mb-6 overflow-x-auto hide-scrollbar">
            <div className="w-full flex justify-center px-4">
                <ins className="eas6a97888e20 block w-full" data-zoneid="6002934"></ins>
            </div>
        </div>
    );
}