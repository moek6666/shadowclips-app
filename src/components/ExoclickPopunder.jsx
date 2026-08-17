import { useEffect } from 'react';

export default function ExoclickPopunder() {
    useEffect(() => {
        window.ad_idzone = 6003906;
        window.ad_sub = "123450000";
        window.ad_popup_fallback = false;
        window.ad_popup_force = false;
        window.ad_chrome_enabled = true;
        window.ad_new_tab = true;

        // 1. UBAH FREKUENSI MENJADI 0
        window.ad_frequency_period = 0;
        window.ad_frequency_count = 0;
        window.ad_trigger_method = 1;
        window.ad_trigger_delay = 0;

        // 2. MATIKAN CAPPING SECARA PAKSA DI KODE
        window.ad_capping_enabled = false;

        window.ad_tcf_enabled = true;
        window.ad_agego_cross_site_enabled = true;
        window.ad_only_inline = false;
        window.ad_syndication_host = "s.pemsrv.com";

        const scriptId = 'exoclick-popunder-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/javascript';
        script.async = true;
        script.src = 'https://a.pemsrv.com/popunder1000.js';

        document.head.appendChild(script);
    }, []);

    return null;
}