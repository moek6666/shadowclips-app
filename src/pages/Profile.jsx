import React, { useState, useEffect } from 'react';
import { Shield, Crown, Settings, LogOut, Save, Loader2, AlertTriangle, BadgeCheck, Info, Star, Lock, Check, ExternalLink, Hexagon } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar, { FRAME_OPTIONS } from '../components/Avatar'; // Memanggil komponen Avatar Global

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
                        .from('profiles').select('*').eq('id', currentSession.user.id).maybeSingle();

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
                    } else { setProfile(null); }
                } else { window.location.href = '/'; }
            } catch (error) { console.warn("Kesalahan muat profil:", error); setProfile(null); }
            finally { setLoading(false); }
        };

        getProfileData();
    }, [supabase]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!supabase || !session) return;
        setIsSaving(true); setNotification(null);

        try {
            const { error } = await supabase.from('profiles')
                .update({ name: editName, avatar_url: editAvatarUrl, active_frame: editFrame })
                .eq('id', session.user.id);

            if (error) throw error;
            setProfile(prev => ({ ...prev, name: editName, avatar_url: editAvatarUrl, active_frame: editFrame }));

            setNotification({ type: 'success', message: 'Profile settings saved successfully.' });
            setTimeout(() => setNotification(null), 3500);
        } catch (err) {
            setNotification({ type: 'error', message: 'Failed to update profile.' });
            setTimeout(() => setNotification(null), 3500);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        if (supabase) { await supabase.auth.signOut(); window.location.href = '/'; }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors border-none">
            <Loader2 className="w-10 h-10 text-[#106EBE] animate-spin mb-4 border-none" />
            <p className="text-zinc-500 font-bold text-sm animate-pulse border-none">Loading profile data...</p>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 text-center font-sans transition-colors border-none">
            <Navbar isScrolled={true} supabase={supabase} />
            <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 border-none">
                <AlertTriangle className="w-10 h-10 text-red-500 border-none" />
            </div>
            <h2 className="text-2xl font-black mb-3 border-none">Sesi Tidak Sinkron</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed border-none">
                Data profil Anda belum tersinkronisasi penuh dengan server. Silakan keluar dan masuk kembali.
            </p>
            <button onClick={handleLogout} className="px-8 py-3.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-none">
                <LogOut className="w-4 h-4 border-none" /> Keluar & Sinkronisasi Ulang
            </button>
        </div>
    );

    const currentPoints = profile.points || 0;
    const sortedFrames = [...FRAME_OPTIONS].sort((a, b) => a.unlockPoints - b.unlockPoints);
    const nextFrame = sortedFrames.find(f => f.unlockPoints > currentPoints);
    const progressPercentage = nextFrame ? Math.min(100, Math.max(0, (currentPoints / nextFrame.unlockPoints) * 100)) : 100;

    const headerBgUrl = editAvatarUrl || 'https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp';
    const displayName = editName || (session?.user?.email ? session.user.email.split('@')[0] : 'User');

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 font-sans pb-24 border-none">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 border-none">

                {/* ========================================== */}
                {/* 1. HERO SECTION (SOLID FLAT NO BORDER/SHADOW) */}
                {/* ========================================== */}
                <section className="bg-white dark:bg-zinc-900/40 rounded-[2.5rem] overflow-hidden relative mb-8 border-none transition-colors duration-300 backdrop-blur-3xl">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20 blur-[80px] scale-[1.5] pointer-events-none transition-all duration-700 border-none" style={{ backgroundImage: `url("${headerBgUrl}")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 dark:from-zinc-950/90 dark:via-zinc-950/40 pointer-events-none border-none"></div>

                    <div className="relative p-8 lg:p-12 flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12 border-none">

                        <div className="shrink-0 relative z-20 border-none">
                            <Avatar url={editAvatarUrl} frameId={editFrame} containerClass="w-40 h-40 lg:w-44 lg:h-44" scale={1.5} />
                        </div>

                        <div className="flex-1 text-center lg:text-left z-20 border-none">
                            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white flex items-center justify-center lg:justify-start gap-3 mb-2 tracking-tight border-none transition-all">
                                {displayName}
                                {profile.is_admin && <BadgeCheck className="w-7 h-7 text-[#106EBE] fill-white dark:fill-[#106EBE] dark:text-zinc-900 shrink-0 border-none" />}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 font-medium border-none">{session.user.email}</p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 border-none">
                                {profile.is_premium && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-black rounded-lg shrink-0 uppercase tracking-widest border-none">
                                        <Crown className="w-4 h-4 border-none" /> Premium VIP
                                    </span>
                                )}
                                {profile.is_admin && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE] text-[11px] font-black rounded-lg shrink-0 uppercase tracking-widest border-none">
                                        <Shield className="w-4 h-4 border-none" /> Administrator
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-[400px] bg-zinc-100/50 dark:bg-zinc-900/60 rounded-[2rem] p-8 z-20 border-none transition-colors backdrop-blur-md">
                            <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 border-none truncate">{displayName}'S POINTS</p>
                            <div className="flex items-center gap-4 mb-3 border-none">
                                <div className="w-12 h-12 rounded-2xl bg-[#106EBE]/10 dark:bg-[#106EBE]/20 flex items-center justify-center border-none">
                                    <Star className="w-6 h-6 text-[#106EBE] fill-[#106EBE] border-none" />
                                </div>
                                <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight border-none">{currentPoints.toLocaleString()}</span>
                            </div>

                            {nextFrame ? (
                                <div className="border-none mt-8">
                                    <div className="w-full bg-zinc-200/50 dark:bg-zinc-950/50 rounded-full h-2 mb-4 overflow-hidden border-none">
                                        <div className="bg-[#106EBE] h-full rounded-full border-none" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <div className="flex items-center justify-between border-none">
                                        <div className="border-none">
                                            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1 border-none">Next Reward: <span className="text-[#106EBE] dark:text-[#0FFCBE] border-none">{nextFrame.name}</span></p>
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold border-none">{currentPoints.toLocaleString()} / {nextFrame.unlockPoints.toLocaleString()} Pts</p>
                                        </div>
                                        <div className="border-none relative pointer-events-none">
                                            <Avatar url={null} frameId={nextFrame.id} containerClass="w-10 h-10" scale={0.45} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE] text-xs font-black uppercase tracking-wider text-center py-4 rounded-xl mt-6 border-none">All Frames Unlocked!</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* 2. SPLIT LAYOUT (AUTO-STRETCH & NO JEG JLOG) */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-none">

                    {/* KIRI: FORM PENGATURAN */}
                    <div className="lg:col-span-5 bg-white dark:bg-zinc-900/40 rounded-[2.5rem] p-8 sm:p-10 flex flex-col border-none transition-colors backdrop-blur-2xl relative overflow-hidden">

                        {/* 🔥 FLOATING NOTIFICATION: Tidak Mendorong Tombol Save (Anti Jeg-Jlog) 🔥 */}
                        {notification && (
                            <div className="absolute top-6 left-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border-none backdrop-blur-xl ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                    {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0 border-none" /> : <Check className="w-5 h-5 shrink-0 border-none" />}
                                    <span className="border-none">{notification.message}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-10 border-none relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[#106EBE]/10 flex items-center justify-center border-none">
                                <Settings className="w-6 h-6 text-[#106EBE] border-none" />
                            </div>
                            <div className="border-none">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1.5 border-none">Account Setup</h2>
                                <p className="text-xs text-zinc-500 font-medium border-none">Manage your identity.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="flex flex-col flex-1 border-none relative z-10">
                            <div className="flex flex-col gap-6 border-none">
                                <div className="flex flex-col gap-2.5 border-none">
                                    <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-none">Display Name</label>
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full bg-zinc-50 dark:bg-zinc-950/50 py-4 px-5 rounded-2xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors font-bold border-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" placeholder="Enter your display name" />
                                </div>
                                <div className="flex flex-col gap-2.5 border-none">
                                    <label className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-none">Avatar URL</label>
                                    <input type="url" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/50 py-4 px-5 rounded-2xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors font-bold border-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" placeholder="https://image-url.com/..." />
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-950/30 rounded-2xl p-6 flex gap-4 items-start border-none mt-2">
                                    <div className="w-8 h-8 rounded-xl bg-[#106EBE]/10 flex items-center justify-center shrink-0 border-none"><Info className="w-4 h-4 text-[#106EBE] border-none" /></div>
                                    <div className="flex-1 border-none">
                                        <h4 className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-none">Image Hosting</h4>
                                        <div className="flex gap-3 mt-3 border-none">
                                            <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:text-[#106EBE] dark:hover:text-[#0FFCBE] px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors border-none">ImgBB <ExternalLink className="w-3 h-3" /></a>
                                            <a href="https://goonbox.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:text-[#106EBE] dark:hover:text-[#0FFCBE] px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors border-none">Goonbox <ExternalLink className="w-3 h-3" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 TOMBOL MENGUNCI DI BAWAH (mt-auto) 🔥 */}
                            <div className="mt-auto pt-10 flex flex-col sm:flex-row gap-4 border-none">
                                <button type="submit" disabled={isSaving || !editName.trim()} className="flex-1 bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white py-4 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2 border-none cursor-pointer">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin border-none" /> : <Save className="w-4 h-4 border-none" />} {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                                <button type="button" onClick={handleLogout} className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-4 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2 border-none cursor-pointer">
                                    <LogOut className="w-4 h-4 border-none" /> LOG OUT
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* KANAN: GALERI AVATAR BORDERS */}
                    <div className="lg:col-span-7 bg-white dark:bg-zinc-900/40 rounded-[2.5rem] p-8 sm:p-10 flex flex-col border-none transition-colors backdrop-blur-2xl">
                        <div className="flex items-center gap-4 mb-10 border-none">
                            <div className="w-12 h-12 rounded-2xl bg-[#0FFCBE]/20 dark:bg-[#0FFCBE]/10 flex items-center justify-center border-none">
                                <Hexagon className="w-6 h-6 text-teal-600 dark:text-[#0FFCBE] border-none" />
                            </div>
                            <div className="border-none">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1.5 border-none">Avatar Borders</h2>
                                <p className="text-xs text-zinc-500 font-medium border-none">Select your active display border.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 border-none">
                            {FRAME_OPTIONS.map(frame => {
                                const isLocked = currentPoints < frame.unlockPoints;
                                const isActive = editFrame === frame.id;

                                return (
                                    <div key={frame.id} onClick={() => { if (!isLocked) setEditFrame(frame.id); }} className={`relative flex flex-col items-center p-6 rounded-[2rem] transition-all duration-300 border-none ${isActive ? 'bg-[#106EBE]/5 dark:bg-[#106EBE]/10 scale-[1.02] z-10' : isLocked ? 'bg-zinc-50 dark:bg-zinc-950/40 opacity-40 cursor-not-allowed grayscale' : 'bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer'}`}>
                                        {isActive && <span className="absolute -top-3 bg-[#106EBE] dark:bg-[#0FFCBE] text-white dark:text-zinc-950 text-[9px] font-black px-3 py-1 rounded-lg z-30 uppercase tracking-widest border-none">Active</span>}

                                        <div className="h-24 flex items-center justify-center mt-3 mb-6 w-full pointer-events-none border-none">
                                            <Avatar url={editAvatarUrl} frameId={frame.id} containerClass="w-16 h-16" scale={0.7} />
                                        </div>

                                        <div className="text-center w-full mt-auto mb-5 border-none">
                                            <p className="text-xs font-black text-zinc-900 dark:text-white mb-1 border-none leading-tight">{frame.name}</p>
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wide border-none">{frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Pts`}</p>
                                        </div>

                                        <div className="h-7 flex items-center justify-center w-full border-none">
                                            {isActive ? <div className="w-7 h-7 rounded-full bg-[#106EBE] flex items-center justify-center border-none"><Check className="w-4 h-4 text-white border-none" /></div> : isLocked ? <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center border-none"><Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 border-none" /></div> : <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-900 hover:bg-zinc-300 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors border-none"></div>}
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