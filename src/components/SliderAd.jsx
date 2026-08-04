import React, { useEffect, useRef } from 'react';

export default function SliderAd() {
    const isLoaded = useRef(false);

    useEffect(() => {
        if (isLoaded.current) return;

        const s = document.createElement('script');
        s.settings = {};
        s.src = "//winding-hurt.com/b/XxVqsqd.GUlf0cYHWGcD/OejmV9SuyZjU/lgktP/T/cGyPOpDDgwxiOzTycStGNuzAIU4EOCD-IDw/MKQ_";
        s.async = true;
        s.referrerPolicy = "no-referrer-when-downgrade";
        document.body.appendChild(s);

        isLoaded.current = true;
    }, []);

    return null;
}