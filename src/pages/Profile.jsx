import React, { useState, useEffect } from 'react';
import {
    User, Mail, Shield, Crown, Settings, LogOut,
    Save, Loader2, AlertTriangle, BadgeCheck, Info, Star, Lock, Check, ExternalLink, Hexagon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ==========================================
// 🚀 DATABASE BINGKAI ANIMASI WEBP (SUPABASE)
// ==========================================
const FRAME_OPTIONS = [
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
];

export default function Profile({ supabase }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const [editName, setEditName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [editFrame, setEditFrame] = useState('none');

    useEffect(() => {
        if (!supabase) return;

        const getProfileData = async () => {
            setLoading(true);
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (currentSession?.user) {
                    setSession(currentSession);

                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentSession.user.id)
                        .maybeSingle();

                    if (profileData) {
                        setProfile(profileData);
                        setEditName(profileData.name || '');
                        setEditAvatarUrl(profileData.avatar_url || '');

                        const currentFrame = FRAME_OPTIONS.find(f => f.id === profileData.active_frame);
                        if (currentFrame && (profileData.points || 0) < currentFrame.unlockPoints) {
                            setEditFrame('none');
                        } else {
                            setEditFrame(profileData.active_frame || 'none');
                        }
                    } else {
                        setProfile(null);
                    }
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.warn("Kesalahan muat profil:", error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        getProfileData();
    }, [supabase]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!supabase || !session) return;

        setIsSaving(true);
        setNotification(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ name: editName, avatar_url: editAvatarUrl, active_frame: editFrame })
                .eq('id', session.user.id);

            if (error) throw error;

            setProfile(prev => ({ ...prev, name: editName, avatar_url: editAvatarUrl, active_frame: editFrame }));
            setNotification({ type: 'success', message: 'Profile settings saved successfully.' });
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            setNotification({ type: 'error', message: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
            window.location.href = '/';
        }
    };

    // ==========================================
    // 📸 RENDER AVATAR & BINGKAI WEBP (AMAN & STABIL)
    // ==========================================
    const renderAvatarWithFrame = (avatarUrl, frameId, containerClass = "w-12 h-12", scale = 1) => {
        const selectedFrame = FRAME_OPTIONS.find(f => f.id === frameId);
        const hasFrame = selectedFrame && selectedFrame.imageUrl;

        return (
            <div className={`relative ${containerClass} shrink-0 flex items-center justify-center overflow-visible border-none`}>
                <div style={{ transform: `scale(${scale})`, width: '100px', height: '100px' }} className="absolute flex items-center justify-center border-none">

                    {hasFrame && (
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center scale-[1.40] border-none">
                            <img src={selectedFrame.imageUrl} alt="Frame" className="w-full h-full object-contain border-none" />
                        </div>
                    )}

                    <div className="w-[82px] h-[82px] rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border-none relative z-10">
                        {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover border-none" /> : <User className="w-1/2 h-1/2 text-zinc-400 dark:text-zinc-600 border-none" />}
                    </div>

                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center transition-colors border-none">
                <Loader2 className="w-10 h-10 text-[#106EBE] animate-spin mb-4 border-none" />
                <p className="text-zinc-500 font-bold text-sm animate-pulse border-none">Loading profile data...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 text-center font-sans transition-colors border-none">
                <Navbar isScrolled={true} supabase={supabase} />
                <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 border-none shadow-none">
                    <AlertTriangle className="w-10 h-10 text-red-500 border-none" />
                </div>
                <h2 className="text-2xl font-black mb-3 border-none">Sesi Tidak Sinkron</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed border-none">
                    Data profil Anda belum tersinkronisasi penuh dengan server. Silakan keluar dan masuk kembali.
                </p>
                <button onClick={handleLogout} className="px-8 py-3.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-none shadow-none">
                    <LogOut className="w-4 h-4 border-none" /> Keluar & Sinkronisasi Ulang
                </button>
            </div>
        );
    }

    const currentPoints = profile.points || 0;
    const sortedFrames = [...FRAME_OPTIONS].sort((a, b) => a.unlockPoints - b.unlockPoints);
    const nextFrame = sortedFrames.find(f => f.unlockPoints > currentPoints);
    const progressPercentage = nextFrame ? Math.min(100, Math.max(0, (currentPoints / nextFrame.unlockPoints) * 100)) : 100;

    const headerBgUrl = editAvatarUrl || 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp';
    const displayName = editName || (session?.user?.email ? session.user.email.split('@')[0] : 'User');

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300 font-sans pb-24 border-none">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 border-none">

                {/* HERO SECTION */}
                <section className="bg-white dark:bg-zinc-800/30 rounded-[2.5rem] overflow-hidden relative mb-8 border-none transition-colors duration-300 shadow-none backdrop-blur-md">

                    <div className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20 blur-[60px] dark:blur-[80px] scale-[1.5] pointer-events-none transition-all duration-700 border-none" style={{ backgroundImage: `url("${headerBgUrl}")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 dark:from-zinc-900 dark:via-zinc-900/60 pointer-events-none border-none"></div>

                    <div className="relative p-8 lg:p-12 flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12 border-none">

                        <div className="shrink-0 relative z-20 border-none pt-6 lg:pt-0">
                            {renderAvatarWithFrame(editAvatarUrl, editFrame, "w-40 h-40 lg:w-44 lg:h-44", 1.5)}
                        </div>

                        <div className="flex-1 text-center lg:text-left z-20 border-none mt-4 lg:mt-0">
                            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white flex items-center justify-center lg:justify-start gap-3 mb-2 tracking-tight border-none transition-all">
                                {displayName}
                                {profile.is_admin && <BadgeCheck className="w-7 h-7 text-[#106EBE] fill-white dark:fill-[#106EBE] dark:text-zinc-900 shrink-0 border-none" />}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium border-none">{session.user.email}</p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 border-none">
                                {profile.is_premium && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-amber-950 text-[11px] font-black rounded-lg shrink-0 uppercase tracking-widest border-none shadow-none">
                                        <Crown className="w-4 h-4 border-none" /> Premium VIP
                                    </span>
                                )}
                                {profile.is_admin && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#106EBE] text-white text-[11px] font-black rounded-lg shrink-0 uppercase tracking-widest border-none shadow-none">
                                        <Shield className="w-4 h-4 border-none" /> Administrator
                                    </span>
                                )}
                            </div>

                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-6 font-normal tracking-wide border-none">Enjoy the story. Feel the emotion. Live the moment.</p>
                        </div>

                        <div className="w-full lg:w-[400px] bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-7 z-20 border-none transition-colors shadow-none">
                            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 border-none truncate">{displayName.toUpperCase()}'S POINTS</p>
                            <div className="flex items-center gap-4 mb-3 border-none">
                                <div className="w-12 h-12 rounded-2xl bg-[#106EBE]/10 dark:bg-[#106EBE]/20 flex items-center justify-center border-none">
                                    <Star className="w-6 h-6 text-[#106EBE] fill-[#106EBE] border-none" />
                                </div>
                                <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight border-none">{currentPoints.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-6 font-semibold border-none">Community Reward System</p>

                            {nextFrame ? (
                                <div className="border-none">
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-950/50 rounded-full h-2.5 mb-3 overflow-hidden border-none shadow-none">
                                        <div className="bg-[#106EBE] h-full rounded-full border-none shadow-none" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <div className="flex items-center justify-between border-none mt-2">
                                        <div className="border-none">
                                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-0.5 border-none">Next Reward: <span className="text-[#106EBE] dark:text-[#0FFCBE] border-none">{nextFrame.name}</span></p>
                                            <p className="text-[10px] text-zinc-500 font-bold border-none">{currentPoints.toLocaleString()} / {nextFrame.unlockPoints.toLocaleString()} points</p>
                                        </div>
                                        <div className="border-none relative mt-2 pt-2">
                                            {renderAvatarWithFrame(null, nextFrame.id, "w-10 h-10", 0.45)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE] text-xs font-black uppercase tracking-wider text-center py-3 rounded-xl mt-4 border-none shadow-none">All Frames Unlocked!</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* FORM & GALERI */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-none">

                    {/* SETTINGS FORM */}
                    <div className="lg:col-span-5 bg-white dark:bg-zinc-800/30 rounded-[2rem] p-8 sm:p-10 flex flex-col border-none transition-colors h-fit shadow-none backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-10 border-none">
                            <div className="w-12 h-12 rounded-2xl bg-[#106EBE]/10 flex items-center justify-center border-none">
                                <Settings className="w-6 h-6 text-[#106EBE] border-none" />
                            </div>
                            <div className="border-none">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1.5 border-none">Account Setup</h2>
                                <p className="text-xs text-zinc-500 font-semibold border-none">Manage your identity and visual display.</p>
                            </div>
                        </div>

                        {notification && (
                            <div className={`mb-8 p-5 rounded-2xl text-sm font-bold flex items-center gap-3 border-none shadow-none ${notification.type === 'success' ? 'bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE]' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0 border-none" /> : <Check className="w-5 h-5 shrink-0 border-none" />}
                                <span className="border-none">{notification.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="flex flex-col flex-1 border-none">
                            <div className="flex flex-col gap-6 flex-1 border-none">
                                <div className="flex flex-col gap-2.5 border-none">
                                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-none">Display Name</label>
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter your name" required className="w-full bg-zinc-50 dark:bg-zinc-900/60 py-4 px-5 rounded-2xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all font-bold border-none shadow-none" />
                                </div>
                                <div className="flex flex-col gap-2.5 mt-2 border-none">
                                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-none">Avatar URL</label>
                                    <input type="url" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} placeholder="https://..." className="w-full bg-zinc-50 dark:bg-zinc-900/60 py-4 px-5 rounded-2xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all font-bold border-none shadow-none" />
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-6 mt-4 flex gap-4 items-start border-none shadow-none">
                                    <div className="w-8 h-8 rounded-xl bg-[#106EBE]/10 flex items-center justify-center shrink-0 border-none"><Info className="w-4 h-4 text-[#106EBE] border-none" /></div>
                                    <div className="flex-1 border-none">
                                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wide border-none">Image Hosting</h4>
                                        <div className="flex gap-3 mt-4 border-none">
                                            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 px-4 py-2 rounded-xl flex items-center gap-1.5 border-none">ImgBB <ExternalLink className="w-3 h-3" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 mt-10 border-none">
                                <button type="submit" disabled={isSaving || !editName.trim()} className="flex-1 bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border-none shadow-none">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin border-none" /> : <Save className="w-4 h-4 border-none" />} {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                                <button type="button" onClick={handleLogout} className="flex-1 bg-red-50 dark:bg-zinc-900/60 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-600 dark:text-red-500 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border-none shadow-none">
                                    <LogOut className="w-4 h-4 border-none" /> LOG OUT
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* KANAN: GALERI AVATAR BORDERS */}
                    <div className="lg:col-span-7 bg-white dark:bg-zinc-800/30 rounded-[2rem] p-6 sm:p-10 flex flex-col border-none transition-colors shadow-none backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-10 border-none">
                            <div className="w-12 h-12 rounded-2xl bg-[#0FFCBE]/20 dark:bg-[#0FFCBE]/10 flex items-center justify-center border-none">
                                <Hexagon className="w-6 h-6 text-teal-600 dark:text-[#0FFCBE] border-none" />
                            </div>
                            <div className="border-none">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1.5 border-none">Avatar Borders</h2>
                                <p className="text-xs text-zinc-500 font-semibold border-none">Select your active display border.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5 border-none">
                            {FRAME_OPTIONS.map(frame => {
                                const isLocked = currentPoints < frame.unlockPoints;
                                const isActive = editFrame === frame.id;

                                return (
                                    <div key={frame.id} onClick={() => { if (!isLocked) setEditFrame(frame.id); }} className={`relative flex flex-col items-center p-6 rounded-[1.5rem] transition-all duration-300 border-none shadow-none ${isActive ? 'bg-[#106EBE]/10 dark:bg-[#106EBE]/20 scale-[1.05] z-10' : isLocked ? 'bg-zinc-50 dark:bg-zinc-900/40 opacity-40 cursor-not-allowed grayscale' : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer'}`}>
                                        {isActive && <span className="absolute -top-3 bg-[#106EBE] dark:bg-[#0FFCBE] text-white dark:text-zinc-950 text-[9px] font-black px-3 py-1 rounded-lg z-30 uppercase tracking-widest border-none shadow-none">Active</span>}

                                        <div className="h-24 flex items-center justify-center mt-3 mb-6 w-full pointer-events-none border-none">
                                            {renderAvatarWithFrame(editAvatarUrl, frame.id, "w-16 h-16", 0.65)}
                                        </div>

                                        <div className="text-center w-full mt-auto mb-5 border-none">
                                            <p className="text-xs font-black text-zinc-900 dark:text-white mb-1.5 border-none leading-tight">{frame.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold tracking-wide border-none">{frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Pts`}</p>
                                        </div>

                                        <div className="h-7 flex items-center justify-center w-full border-none">
                                            {isActive ? <div className="w-7 h-7 rounded-full bg-[#106EBE] flex items-center justify-center border-none shadow-none"><Check className="w-4 h-4 text-white border-none" /></div> : isLocked ? <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-900/80 flex items-center justify-center border-none shadow-none"><Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 border-none" /></div> : <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-900/50 hover:bg-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors border-none shadow-none"></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}