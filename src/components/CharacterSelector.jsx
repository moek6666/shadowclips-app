import React from 'react';
import { Check } from 'lucide-react';

const AVAILABLE_CHARACTERS = [
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/1.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/2.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/3.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/4.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/5.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/6.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/7.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/8.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/9.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/10.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/11.webp",
    "https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatars_Collection/12.webp"
];

export default function CharacterSelector({ currentAvatar, onSelectAvatar, isSaving }) {
    return (
        <div className="mt-8 bg-zinc-50 dark:bg-zinc-900/50 p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                Select Your Character
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                Pilih avatar karakter untuk identitas publik Anda.
            </p>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-4">
                {AVAILABLE_CHARACTERS.map((url, index) => {
                    const isSelected = currentAvatar === url;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelectAvatar(url)}
                            disabled={isSaving}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 outline-none ${
                                isSelected 
                                    ? 'border-[#106EBE] scale-105 shadow-[0_0_15px_rgba(16,110,190,0.5)] z-10' 
                                    : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img 
                                src={url} 
                                alt={`Character ${index + 1}`} 
                                className="w-full h-full object-cover bg-zinc-200 dark:bg-zinc-800"
                                loading="lazy"
                            />
                            
                            {isSelected && (
                                <div className="absolute bottom-1 right-1 bg-[#106EBE] rounded-full p-1 shadow-sm">
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}