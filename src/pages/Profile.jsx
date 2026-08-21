import React, { useState, useEffect } from 'react';
import {
    User, Mail, Shield, Crown, Settings, LogOut,
    Save, Loader2, AlertTriangle, BadgeCheck, Info, Star, Lock, Check, ExternalLink, Hexagon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ==========================================
// 🚀 DATABASE BINGKAI MANUAL (GIF/PNG) 🚀
// ==========================================
const FRAME_OPTIONS = [
    { id: 'none', name: 'Polos', unlockPoints: 0, type: 'none', imageUrl: null },
    { id: 'neon-border', name: 'Neon Rank', unlockPoints: 1000, type: 'image', imageUrl: 'https://i.ibb.co.com/8czb65v/silver-frame-placeholder.png' },
    { id: 'fire-vip', name: 'Fire VIP', unlockPoints: 5000, type: 'image', imageUrl: 'https://i.ibb.co.com/1G6X8Zz/gold-animated-frame.gif' },
    { id: 'mythic-glory', name: 'Mythic Glory', unlockPoints: 10000, type: 'image', imageUrl: 'https://i.ibb.co.com/FwjQKbq/mythic-flame-frame.gif' },
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

    // RENDER AVATAR OVERLAY
    const renderAvatarWithFrame = (avatarUrl, frameId, sizeClass = "w-32 h-32 md:w-36 md:h-36") => {
        const selectedFrame = FRAME_OPTIONS.find(f => f.id === frameId);
        const hasFrame = selectedFrame && selectedFrame.type === 'image';

        return (
            <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center`}>
                <div className={`relative z-10 ${hasFrame ? 'w-[75%] h-[75%]' : 'w-full h-full'} rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shadow-2xl ${!hasFrame ? 'ring-2 ring-zinc-700/60' : ''}`}>
                    {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-1/2 h-1/2 text-zinc-500" />}
                </div>
                {hasFrame && selectedFrame.imageUrl && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center scale-[1.35]">
                        <img src={selectedFrame.imageUrl} alt="Frame" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,110,190,0.5)]" />
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center transition-colors">
                <Loader2 className="w-10 h-10 text-[#106EBE] animate-spin mb-4" />
                <p className="text-zinc-400 font-medium animate-pulse">Loading profile data...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 text-center">
                <Navbar isScrolled={true} supabase={supabase} />
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-zinc-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Sesi Tidak Sinkron</h2>
                <p className="text-zinc-400 mb-8 max-w-md">Data Anda belum tersinkronisasi penuh. Silakan keluar dan masuk kembali.</p>
                <button onClick={handleLogout} className="px-6 py-3 bg-[#106EBE] hover:bg-[#0e5c9f] text-white rounded-xl font-semibold transition-all flex items-center gap-2">
                    <LogOut className="w-5 h-5" /> Keluar & Sinkronisasi
                </button>
            </div>
        );
    }

    const currentPoints = profile.points || 0;
    const sortedFrames = [...FRAME_OPTIONS].sort((a, b) => a.unlockPoints - b.unlockPoints);
    const nextFrame = sortedFrames.find(f => f.unlockPoints > currentPoints);
    const progressPercentage = nextFrame ? Math.min(100, Math.max(0, (currentPoints / nextFrame.unlockPoints) * 100)) : 100;

    return (
        <div className="min-h-screen bg-transparent transition-colors duration-300 font-sans pb-24">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">

                {/* ========================================== */}
                {/* 1. HERO SECTION (BEBAS DARI BORDER KAKU) */}
                {/* ========================================== */}
                <section className="bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden relative mb-8 border border-white/5">
                    {/* Background Subtle Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#106EBE]/10 via-transparent to-purple-600/5 opacity-60 pointer-events-none"></div>

                    <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-10">

                        {/* Avatar */}
                        <div className="shrink-0 relative z-20">
                            {renderAvatarWithFrame(profile.avatar_url, profile.active_frame, "w-40 h-40 lg:w-48 lg:h-48")}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center lg:text-left z-20">
                            <h1 className="text-3xl font-extrabold text-white flex items-center justify-center lg:justify-start gap-2.5 mb-1.5 tracking-tight">
                                {profile.name || 'Anonymous User'}
                                {profile.is_admin && <BadgeCheck className="w-6 h-6 text-[#106EBE] fill-[#106EBE] text-zinc-900" />}
                            </h1>
                            <p className="text-zinc-400 text-sm mb-4 font-medium">{session.user.email}</p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                                {profile.is_premium && (
                                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/20 shadow-inner">
                                        <Crown className="w-4 h-4" /> Premium VIP
                                    </span>
                                )}
                                {profile.is_admin && (
                                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#106EBE]/10 text-[#0FFCBE] text-xs font-bold rounded-xl border border-[#106EBE]/20 shadow-inner">
                                        <Shield className="w-4 h-4" /> Administrator
                                    </span>
                                )}
                                {!profile.is_admin && !profile.is_premium && (
                                    <span className="px-3.5 py-1.5 bg-zinc-800/80 text-zinc-300 text-xs font-bold rounded-xl">Standard User</span>
                                )}
                            </div>
                            <p className="text-zinc-500 text-sm mt-5 font-normal tracking-wide">Enjoy the story. Feel the emotion. Live the moment.</p>
                        </div>

                        {/* Points Card (Clean & Modern) */}
                        <div className="w-full lg:w-[380px] bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 z-20 shadow-xl">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Shadow Points</p>
                            <div className="flex items-center gap-3.5 mb-3">
                                <div className="w-11 h-11 rounded-full bg-[#106EBE]/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,110,190,0.3)]">
                                    <Star className="w-5 h-5 text-[#106EBE] fill-[#106EBE]" />
                                </div>
                                <span className="text-3xl font-black text-white tracking-tight">{currentPoints.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-5 font-medium">Thank you for being part of ShadowClips!</p>

                            {nextFrame ? (
                                <div>
                                    <div className="w-full bg-zinc-800/80 rounded-full h-2 mb-3 overflow-hidden">
                                        <div className="bg-gradient-to-r from-[#106EBE] to-[#0FFCBE] h-full rounded-full shadow-[0_0_12px_rgba(15,252,190,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-300">Next Reward: <span className="text-[#0FFCBE]">{nextFrame.name}</span></p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">{currentPoints.toLocaleString()} / {nextFrame.unlockPoints.toLocaleString()} points to unlock</p>
                                        </div>
                                        {nextFrame.imageUrl && (
                                            <div className="w-9 h-9 shrink-0">
                                                <img src={nextFrame.imageUrl} alt="next frame" className="w-full h-full object-contain drop-shadow" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-3 border-t border-zinc-800 text-xs font-bold text-[#0FFCBE] text-center bg-[#106EBE]/10 py-2 rounded-xl">
                                    All Exclusive Frames Unlocked!
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* 2. SPLIT LAYOUT (Tanpa Border Garis Kaku) */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* KIRI: ACCOUNT INFORMATION */}
                    <div className="lg:col-span-5 bg-zinc-900/90 backdrop-blur-xl rounded-[1.5rem] border border-white/5 p-6 sm:p-8 flex flex-col shadow-xl">
                        <div className="flex items-center gap-3.5 mb-8">
                            <div className="w-11 h-11 rounded-2xl bg-[#106EBE]/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-[#106EBE]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Account Information</h2>
                                <p className="text-xs text-zinc-400 mt-0.5 font-medium">Manage your personal information and account settings.</p>
                            </div>
                        </div>

                        {notification && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${notification.type === 'success' ? 'bg-[#106EBE]/10 text-[#0FFCBE] border border-[#106EBE]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                {notification.message}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="flex flex-col flex-1">
                            <div className="flex flex-col gap-6 flex-1">
                                {/* Display Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter your name"
                                        required
                                        className="w-full bg-zinc-950/60 py-3.5 px-4 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 border border-white/5 transition-all placeholder:text-zinc-600 font-medium"
                                    />
                                    <p className="text-[11px] text-zinc-500">This is how your name will be displayed to other users.</p>
                                </div>

                                {/* Avatar URL */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Avatar Image URL</label>
                                    <input
                                        type="url"
                                        value={editAvatarUrl}
                                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                                        placeholder="https://.../image.jpg"
                                        className="w-full bg-zinc-950/60 py-3.5 px-4 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 border border-white/5 transition-all placeholder:text-zinc-600 font-medium"
                                    />
                                    <p className="text-[11px] text-zinc-500">Enter a direct image URL from ImgBB, Goonbox, or any image hosting.</p>
                                </div>

                                {/* Info Box ImgBB */}
                                <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4.5 mt-2 flex gap-3.5 items-start">
                                    <div className="w-7 h-7 rounded-full bg-[#106EBE]/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Info className="w-4 h-4 text-[#106EBE]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">How to get your avatar URL</h4>
                                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Upload your image to ImgBB or Goonbox, then copy the direct image URL and paste it above.</p>
                                        <div className="flex gap-2.5 mt-3">
                                            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 transition-colors">ImgBB <ExternalLink className="w-3 h-3" /></a>
                                            <a href="https://goonbox.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 transition-colors">Goonbox <ExternalLink className="w-3 h-3" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex flex-col sm:flex-row gap-3.5 mt-8 pt-6 border-t border-white/5">
                                <button type="submit" disabled={isSaving || !editName.trim()} className="flex-1 bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-[#106EBE]/20 transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={handleLogout} className="flex-1 bg-transparent hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-red-400 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* KANAN: AVATAR BORDERS */}
                    <div className="lg:col-span-7 bg-zinc-900/90 backdrop-blur-xl rounded-[1.5rem] border border-white/5 p-6 sm:p-8 flex flex-col shadow-xl">
                        <div className="flex items-center gap-3.5 mb-8">
                            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <Hexagon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Avatar Borders</h2>
                                <p className="text-xs text-zinc-400 mt-0.5 font-medium">Choose your favorite border. Some borders require points to unlock.</p>
                            </div>
                        </div>

                        {/* Grid Frame */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                            {FRAME_OPTIONS.map(frame => {
                                const isLocked = currentPoints < frame.unlockPoints;
                                const isActive = editFrame === frame.id;

                                return (
                                    <div
                                        key={frame.id}
                                        onClick={() => { if (!isLocked) setEditFrame(frame.id); }}
                                        className={`relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 ${isActive
                                                ? 'border-[#106EBE] bg-[#106EBE]/10 shadow-[0_0_20px_rgba(16,110,190,0.15)]'
                                                : isLocked
                                                    ? 'border-white/5 bg-zinc-950/40 opacity-50 cursor-not-allowed'
                                                    : 'border-white/5 bg-zinc-950/60 hover:border-white/20 cursor-pointer hover:bg-zinc-800/40'
                                            }`}
                                    >
                                        {isActive && (
                                            <span className="absolute top-3 left-3 bg-[#0FFCBE] text-zinc-950 text-[9px] font-black px-2 py-0.5 rounded-full z-30 uppercase tracking-wider">Active</span>
                                        )}

                                        <div className="h-20 flex items-center justify-center mt-3 mb-4 w-full pointer-events-none">
                                            {renderAvatarWithFrame(editAvatarUrl, frame.id, "w-16 h-16")}
                                        </div>

                                        <div className="text-center w-full mt-auto mb-4">
                                            <p className="text-xs font-bold text-white">{frame.name}</p>
                                            <p className="text-[10px] text-zinc-400 mt-1 font-semibold">{frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Points`}</p>
                                        </div>

                                        <div className="h-6 flex items-center justify-center">
                                            {isActive ? (
                                                <div className="w-6 h-6 rounded-full bg-[#106EBE] flex items-center justify-center shadow-[0_0_10px_rgba(16,110,190,0.8)]">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            ) : isLocked ? (
                                                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                                                    <Lock className="w-3 h-3 text-zinc-500" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-white/10 bg-zinc-900/50"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/5 flex items-start gap-3 bg-zinc-950/40 p-4 rounded-xl border border-white/5">
                            <Info className="w-4 h-4 text-[#106EBE] mt-0.5 shrink-0" />
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">Collect Shadow Points by watching videos, liking, and contributing to the community!</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}