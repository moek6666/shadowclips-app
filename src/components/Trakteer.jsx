import React from 'react';

export default function TrakteerBanner() {
    // Link Trakteer yang sudah disesuaikan
    const trakteerUrl = "https://trakteer.id/shadowclips";

    return (
        <div 
            className="trakteer-container"
            style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
        >
            <a href={trakteerUrl} target="_blank" rel="noopener noreferrer">
                <img 
                    src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png" 
                    alt="Dukung saya di Trakteer!" 
                    style={{ height: '40px', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                />
            </a>
        </div>
    );
}