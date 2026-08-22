import React from 'react';
import { User } from 'lucide-react';

// ==========================================
// 🚀 DATABASE BINGKAI ANIMASI WEBP (GLOBAL)
// ==========================================
export const FRAME_OPTIONS = [
    { id: 'none', name: 'Classic Member', unlockPoints: 0, imageUrl: null },
    { id: 'kunang1', name: 'Green Wisps', unlockPoints: 500, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ss.webp' },
    { id: 'kunang2', name: 'Blue Wisps', unlockPoints: 1000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ss1.webp' },
    { id: 'glop', name: 'Venom Glop', unlockPoints: 2000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/glop.webp' },
    { id: 'ear1', name: 'Beast Ears 1', unlockPoints: 3000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ears_1.webp' },
    { id: 'ear2', name: 'Beast Ears 2', unlockPoints: 4000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ears_3.webp' },
    { id: 'ear3', name: 'Beast Ears 3', unlockPoints: 5000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/eras_2.webp' },
    { id: 'cat1', name: 'Cyber Cat 1', unlockPoints: 6000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/cat-a1.webp' },
    { id: 'cat2', name: 'Cyber Cat 2', unlockPoints: 7000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/cat-a2.webp' },
    { id: 'cat3', name: 'Cyber Cat 3', unlockPoints: 8000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/cat-a3.webp' },
    { id: 'hood', name: 'Crimson Hood', unlockPoints: 10000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/hood_crimson.webp' },
    { id: 'angel', name: 'Holy Angel', unlockPoints: 12000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ss6.webp' },
    { id: 'fire', name: 'Blazing Flame', unlockPoints: 15000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ss3.webp' },
    { id: 'vip', name: 'Emperor VIP', unlockPoints: 20000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/china.webp' },
    { id: 'admin', name: 'Supreme Admin', unlockPoints: 25000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/ss5.webp' },
    
    // 🔥 BINGKAI BARU DITAMBAHKAN DI SINI 🔥
    { id: 'astral_aura', name: 'Astral Aura', unlockPoints: 30000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/astral_aura.webp' },
    { id: 'shenron', name: 'Shenron', unlockPoints: 35000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/shenron.webp' },
    { id: 'shocked', name: 'Shocked', unlockPoints: 40000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/shocked.webp' },
    { id: 'spider', name: 'Spider', unlockPoints: 45000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/spooder.webp' },
    { id: 'starry', name: 'Starry Eyed', unlockPoints: 50000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/starry_eyed.webp' },
    { id: 'zombie', name: 'Zombie Food', unlockPoints: 60000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/zombie_food.webp' },
    { id: 'zombie_purple', name: 'Zombie Purple', unlockPoints: 75000, imageUrl: 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/zombie_food_purple.webp' },
];

export default function Avatar({ url, frameId, containerClass = "w-12 h-12", scale = 1 }) {
    const selectedFrame = FRAME_OPTIONS.find(f => f.id === frameId);
    const hasFrame = selectedFrame && selectedFrame.imageUrl;

    return (
        <div className={`relative ${containerClass} shrink-0 flex items-center justify-center overflow-visible border-none`}>
            {/* Base Size 100px yang akan membesar/mengecil mengikuti prop 'scale' */}
            <div style={{ transform: `scale(${scale})`, width: '100px', height: '100px' }} className="absolute flex items-center justify-center border-none">

                {/* 🚀 LAYER ANIMASI WEBP 🚀 */}
                {hasFrame && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center scale-[1.45] border-none">
                        <img src={selectedFrame.imageUrl} alt="Frame" className="w-full h-full object-contain border-none" />
                    </div>
                )}

                {/* 📸 FOTO PROFIL (Diperbesar ke 90px agar gambar wajah / karakter jauh lebih jelas dan penuh) 📸 */}
                <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border-none relative z-10 shadow-sm">
                    {url ? (
                        <img src={url} alt="Profile" className="w-full h-full object-cover border-none" />
                    ) : (
                        <User className="w-1/2 h-1/2 text-zinc-400 dark:text-zinc-600 border-none" />
                    )}
                </div>

            </div>
        </div>
    );
}