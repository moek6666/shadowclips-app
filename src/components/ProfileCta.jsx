import React, { useState, useEffect } from 'react';
import { User, Sparkles, ArrowRight, Camera } from 'lucide-react';

export default function ProfileCta({ supabase }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserProfile = async () => {
            if (!supabase) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    
                    const { data } = await supabase
                        .from('profiles')
                        .select('username, avatar_url, bio')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    setProfile(data);
                }
            } catch (err) {
                console.error("Error checking profile:", err);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfile();
    }, [supabase]);

    if (loading) return null;

    // 1. Tampilan jika user belum login (Guest) - Tanpa border
    if (!user) {
        return (
            <div className="mt-20 md:mt-24 -mb-16 md:-mb-20 relative overflow-hidden bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center gap-3.5 transition-all z-[99]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 dark:from-blue-600/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10 w-full">
                    <div className="p-2 bg-blue-500/10 rounded-xl shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-white">Bergabung & Personalisasi Profilmu</h3>
                        <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                            Silakan masuk melalui menu utama untuk menyimpan video favorit dan mengatur avatar.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const isProfileIncomplete = !profile?.avatar_url || !profile?.username;

    // 2. Tampilan CTA jika profil belum lengkap - Tanpa border
    if (isProfileIncomplete) {
        return (
            <div className="mt-20 md:mt-24 -mb-16 md:-mb-20 relative overflow-hidden bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3.5 transition-all z-[99]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white dark:text-zinc-950 p-0.5 rounded-full">
                            <Camera className="w-2.5 h-2.5" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-800 dark:text-white">Lengkapi Profilmu</h3>
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                <Sparkles className="w-2.5 h-2.5" /> Rekomendasi
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                            Pilih karakter avatar dan nama publik agar identitas profilmu lebih unik.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => window.location.href = '/profile'}
                    style={{ zIndex: 9999, position: 'relative' }}
                    className="relative pointer-events-auto w-full md:w-auto px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                >
                    Kustomisasi Profil <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return null;
}