import { useEffect } from 'react';

export default function ExoclickPopunder() {
    useEffect(() => {
        // 1. Ekstrak 'adConfig' dari Exoclick dan masukkan ke Global Window
        window.ad_idzone = 6003906;
        window.ad_sub = "123450000";
        window.ad_popup_fallback = false;
        window.ad_popup_force = false;
        window.ad_chrome_enabled = true;
        window.ad_new_tab = true;
        window.ad_frequency_period = 30; // Sesuai skrip Anda: Muncul 1 kali setiap 30 menit
        window.ad_frequency_count = 1;
        window.ad_trigger_method = 1;
        window.ad_trigger_delay = 0;
        window.ad_capping_enabled = true;
        window.ad_tcf_enabled = true;
        window.ad_agego_cross_site_enabled = true;
        window.ad_only_inline = false;
        window.ad_syndication_host = "s.pemsrv.com";

        // 2. Cek agar script tidak ditambahkan berulang kali (mencegah spam iklan)
        const scriptId = 'exoclick-popunder-script';
        if (document.getElementById(scriptId)) return;

        // 3. Panggil engine Exoclick langsung dari host bawaan Anda (a.pemsrv.com)
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/javascript';
        script.async = true;
        script.src = 'https://a.pemsrv.com/popunder1000.js';

        document.head.appendChild(script);
    }, []);

    // Popunder tidak memiliki UI visual, jadi kita kembalikan null
    return null;
}