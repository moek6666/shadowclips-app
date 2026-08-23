import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Crown, Settings, LogOut, Save, Loader2, AlertTriangle, BadgeCheck, Info, Star, Lock, Check, ExternalLink, Hexagon, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar, { FRAME_OPTIONS } from '../components/Avatar';

// Helper untuk mengambil gambar pertama dari string URL
const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

export default function Profile({ supabase }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const [editName, setEditName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [editFrame, setEditFrame] = useState('none');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [likedVideos, setLikedVideos] = useState([]);
    const [historyVideos, setHistoryVideos] = useState([]);

    const fetchActivityData = useCallback(async (currentSession) => {
        if (!supabase) return;
        try {
            if (currentSession?.user) {
                const { data: profileData } = await supabase
                    .from('profiles').select('points, active_frame').eq('id', currentSession.user.id).maybeSingle();
                if (profileData) {
                    setProfile(prev => prev ? { ...prev, points: profileData.points, active_frame: profileData.active_frame } : null);
                }
            }

            const localDevId = localStorage.getItem('shadowclips_device_id');
            const userId = currentSession?.user?.id;

            const queryIds = [];
            if (userId) queryIds.push(userId);
            if (localDevId) queryIds.push(localDevId);

            if (queryIds.length > 0) {
                const { data: likesData, error: likesError } = await supabase
                    .from('user_likes')
                    .select('video_id')
                    .in('device_id', queryIds)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (!likesError && likesData && likesData.length > 0) {
                    const videoIds = [...new Set(likesData.map(l => l.video_id))];
                    const { data: vids, error: vidsError } = await supabase.from('videos').select('id, title, slug, img').in('id', videoIds);
                    if (!vidsError && vids) {
                        const resolvedLiked = videoIds.map(id => vids.find(v => String(v.id) === String(id))).filter(Boolean);
                        setLikedVideos(resolvedLiked.slice(0, 3));
                    }
                } else {
                    setLikedVideos([]);
                }
            }

            const localHistory = JSON.parse(localStorage.getItem('shadowclips_history') || '[]');
            if (localHistory && localHistory.length > 0) {
                const limitedHistory = localHistory.slice(0, 3);
                const { data: histVids, error: histError } = await supabase.from('videos').select('id, title, slug, img').in('id', limitedHistory);
                if (!histError && histVids) {
                    setHistoryVideos(limitedHistory.map(id => histVids.find(v => String(v.id) === String(id))).filter(Boolean));
                }
            } else {
                setHistoryVideos([]);
            }
        } catch (error) { console.warn("Activity fetch error:", error); }
    }, [supabase]);

    useEffect(() => {
        if (!supabase) return;
        let activeSession = null;

        const getProfileData = async () => {
            setLoading(true);
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (currentSession?.user) {
                    activeSession = currentSession;
                    setSession(currentSession);
                    const { data: profileData } = await supabase
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

                    await fetchActivityData(currentSession);

                } else { window.location.href = '/'; }
            } catch (error) { console.warn("Kesalahan muat profil:", error); setProfile(null); }
            finally { setLoading(false); }
        };

        getProfileData();

        const handleFocusOrChange = () => {
            if (activeSession) fetchActivityData(activeSession);
        };

        window.addEventListener('focus', handleFocusOrChange);
        window.addEventListener('storage', handleFocusOrChange);
        window.addEventListener('popstate', handleFocusOrChange);

        return () => {
            window.removeEventListener('focus', handleFocusOrChange);
            window.removeEventListener('storage', handleFocusOrChange);
            window.removeEventListener('popstate', handleFocusOrChange);
        };
    }, [supabase, fetchActivityData]);

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

    const executeDeleteAccount = async () => {
        if (!supabase || !session) return;
        setIsDeleting(true);
        try {
            await supabase.from('profiles').delete().eq('id', session.user.id);
            await supabase.rpc('delete_current_user');
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (error) {
            setNotification({ type: 'error', message: 'Gagal menghapus akun. Silakan coba lagi.' });
            setTimeout(() => setNotification(null), 3500);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    useEffect(() => {
        if (showDeleteConfirm) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showDeleteConfirm]);

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center transition-colors border-none">
            <Loader2 className="w-10 h-10 text-[#106EBE] animate-spin mb-4 border-none" />
            <p className="text-zinc-500 font-bold text-sm animate-pulse border-none">Loading profile data...</p>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 text-center font-sans transition-colors border-none">
            <Navbar isScrolled={true} supabase={supabase} />
            <div className="flex flex-col items-center justify-center mb-6 border-none">
                <AlertTriangle className="w-12 h-12 text-red-500 border-none mb-4" />
                <h2 className="text-2xl font-black mb-3 border-none">Sesi Tidak Sinkron</h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed border-none">
                Data profil Anda belum tersinkronisasi penuh dengan server. Silakan keluar dan masuk kembali.
            </p>
            <button onClick={handleLogout} className="px-8 py-3.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-none">
                <LogOut className="w-4 h-4 border-none shrink-0" /> Keluar & Sinkronisasi Ulang
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
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300 font-sans border-none">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 border-none">

                {/* ========================================== */}
                {/* 1. HERO SECTION */}
                {/* ========================================== */}
                <section className="bg-white dark:bg-zinc-800/40 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative mb-6 sm:mb-8 border-none transition-colors duration-300 backdrop-blur-3xl">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20 blur-[80px] scale-[1.5] pointer-events-none transition-all duration-700 border-none" style={{ backgroundImage: `url("${headerBgUrl}")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 dark:from-zinc-900/90 dark:via-zinc-900/40 pointer-events-none border-none"></div>

                    <div className="relative p-6 sm:p-8 lg:p-12 flex flex-col lg:flex-row items-center lg:items-center gap-6 sm:gap-8 lg:gap-12 border-none">

                        <div className="shrink-0 relative z-20 border-none">
                            <Avatar url={editAvatarUrl} frameId={editFrame} containerClass="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44" scale={1.5} />
                        </div>

                        <div className="flex-1 text-center lg:text-left z-20 border-none">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-1.5 sm:mb-2 tracking-tight border-none transition-all">
                                {displayName}
                                {profile.is_admin && <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#106EBE] fill-white dark:fill-[#106EBE] dark:text-zinc-900 shrink-0 border-none" />}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6 font-medium border-none">{session.user.email}</p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 border-none">
                                {profile.is_premium && (
                                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] sm:text-[11px] font-black rounded-lg shrink-0 uppercase tracking-widest border-none">
                                        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-none" /> Premium VIP
                                    </span>
                                )}
                                {profile.is_admin && (
                                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE] text-[10px] sm:text-[11px] font-black rounded-lg shrink-0 uppercase tracking-widest border-none">
                                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-none" /> Administrator
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-[350px] xl:w-[400px] bg-zinc-100/50 dark:bg-zinc-800/60 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 z-20 border-none transition-colors backdrop-blur-md mt-2 lg:mt-0">
                            <p className="text-[11px] sm:text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 sm:mb-3 border-none truncate text-center lg:text-left">{displayName}'S POINTS</p>
                            <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 mb-3 border-none">
                                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#106EBE] fill-[#106EBE] border-none shrink-0" />
                                <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight border-none">{currentPoints.toLocaleString()}</span>
                            </div>

                            {nextFrame ? (
                                <div className="border-none mt-6 sm:mt-8">
                                    <div className="w-full bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4 overflow-hidden border-none">
                                        <div className="bg-[#106EBE] h-full rounded-full border-none" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <div className="flex items-center justify-between border-none">
                                        <div className="border-none">
                                            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-0.5 sm:mb-1 border-none">Next Reward: <span className="text-[#106EBE] dark:text-[#0FFCBE] border-none">{nextFrame.name}</span></p>
                                            <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold border-none">{currentPoints.toLocaleString()} / {nextFrame.unlockPoints.toLocaleString()} Pts</p>
                                        </div>
                                        <div className="border-none relative pointer-events-none shrink-0">
                                            <Avatar url={null} frameId={nextFrame.id} containerClass="w-8 h-8 sm:w-10 sm:h-10" scale={0.4} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center py-3 sm:py-4 rounded-xl mt-4 sm:mt-6 border-none">All Frames Unlocked!</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* 2. SPLIT LAYOUT (SETTINGS & AVATARS) */}
                {/* ========================================== */}
                {/* 🔥 FORM UTAMA MEMBUNGKUS SELURUH GRID AGAR TOMBOL BISA DIPINDAH KE BAWAH 🔥 */}
                <form onSubmit={handleUpdateProfile} className="w-full border-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch border-none">

                        {/* KIRI: Pengaturan Akun & Riwayat */}
                        <div className="lg:col-span-5 order-1 bg-white dark:bg-zinc-800/40 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col border-none transition-colors backdrop-blur-2xl relative overflow-hidden">

                            {notification && (
                                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-bold flex items-center gap-2 sm:gap-3 border-none backdrop-blur-xl ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                        {notification.type === 'error' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 border-none" /> : <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 border-none" />}
                                        <span className="border-none">{notification.message}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 border-none relative z-10">
                                <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-800 dark:text-zinc-200 border-none shrink-0" />
                                <div className="border-none">
                                    <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1 sm:mb-1.5 border-none">Account Setup</h2>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium border-none">Manage your identity.</p>
                                </div>
                            </div>

                            <div className="flex flex-col flex-1 border-none relative z-10">
                                <div className="flex flex-col gap-4 sm:gap-6 border-none">
                                    <div className="flex flex-col gap-2 border-none">
                                        <label className="text-[10px] sm:text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-none">Display Name</label>
                                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full bg-zinc-50 dark:bg-zinc-900/50 py-3 sm:py-4 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors font-bold border-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" placeholder="Enter your display name" />
                                    </div>
                                    <div className="flex flex-col gap-2 border-none">
                                        <label className="text-[10px] sm:text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-none">Avatar URL</label>
                                        <input type="url" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 py-3 sm:py-4 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors font-bold border-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" placeholder="https://image-url.com/..." />
                                    </div>

                                    <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-4 items-start border-none mt-1 sm:mt-2">
                                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#106EBE] border-none shrink-0 mt-0.5" />
                                        <div className="flex-1 border-none">
                                            <h4 className="text-[10px] sm:text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-none">Image Hosting</h4>
                                            <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3 border-none flex-wrap">
                                                <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:text-[#106EBE] dark:hover:text-[#0FFCBE] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 transition-colors border-none">ImgBB <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" /></a>
                                                <a href="https://goonbox.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:text-[#106EBE] dark:hover:text-[#0FFCBE] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 transition-colors border-none">Goonbox <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" /></a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LIKE & RIWAYAT (THUMBNAIL HORIZONTAL MAX 3 SEJAJAR, WARNA PUTIH, NORMAL FONT) */}
                                    <div className="flex flex-col gap-5 sm:gap-6 pt-3 sm:pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 border-none">

                                        {/* Like */}
                                        <div className="flex flex-col gap-2 sm:gap-2.5 border-none">
                                            <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-white border-none">Like</h4>
                                            {likedVideos.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 border-none">
                                                    {likedVideos.map(vid => (
                                                        <a key={vid.id} href={`/streaming/${vid.slug || vid.id}`} className="group relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border-none shadow-sm block" title={vid.title}>
                                                            <img src={getImageUrl(vid.img)} loading="lazy" alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 border-none" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-none z-10">
                                                                <Play className="w-4 h-4 text-white fill-current border-none drop-shadow-md" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 pl-1 border-none">Belum ada video disukai</p>
                                            )}
                                        </div>

                                        {/* Tonton */}
                                        <div className="flex flex-col gap-2 sm:gap-2.5 border-none">
                                            <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-white border-none">Tonton</h4>
                                            {historyVideos.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 border-none">
                                                    {historyVideos.map(vid => (
                                                        <a key={vid.id} href={`/streaming/${vid.slug || vid.id}`} className="group relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border-none shadow-sm block" title={vid.title}>
                                                            <img src={getImageUrl(vid.img)} loading="lazy" alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 border-none" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-none z-10">
                                                                <Play className="w-4 h-4 text-white fill-current border-none drop-shadow-md" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 pl-1 border-none">Belum ada riwayat tontonan</p>
                                            )}
                                        </div>

                                    </div>

                                    <div className="flex flex-col items-start gap-1 sm:gap-1.5 mt-2 sm:mt-4 border-none">
                                        <div className="flex items-start gap-2 sm:gap-3 border-none">
                                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5 border-none" />
                                            <div className="flex flex-col border-none">
                                                <h4 className="text-[11px] sm:text-[13px] font-black text-red-500 mb-0.5 tracking-tight border-none">Danger Zone</h4>
                                                <p className="text-[10px] sm:text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-none">
                                                    Menghapus akun akan menghilangkan semua data profil dan riwayat Anda secara permanen.
                                                </p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setShowDeleteConfirm(true)} className="mt-1 ml-6 sm:ml-8 text-[10px] sm:text-[11px] font-black text-red-500 hover:text-red-600 underline underline-offset-4 outline-none border-none cursor-pointer transition-colors uppercase tracking-widest">
                                            Hapus Akun Saya
                                        </button>
                                    </div>
                                </div>

                                {/* 🔥 TOMBOL DESKTOP (Tampil HANYA di layar besar, posisi di bawah kolom kiri) 🔥 */}
                                <div className="hidden lg:flex mt-auto pt-8 flex-col sm:flex-row gap-4 border-none">
                                    <button type="submit" disabled={isSaving || !editName.trim()} className="flex-1 bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 text-white py-4 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2 border-none cursor-pointer">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin border-none" /> : <Save className="w-4 h-4 border-none" />} {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                    </button>
                                    <button type="button" onClick={handleLogout} className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-4 rounded-2xl text-sm font-black transition-colors flex items-center justify-center gap-2 border-none cursor-pointer">
                                        <LogOut className="w-4 h-4 border-none" /> LOG OUT
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* KANAN: Pilihan Avatar Border */}
                        <div className="lg:col-span-7 order-2 bg-white dark:bg-zinc-800/40 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col border-none transition-colors backdrop-blur-2xl">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 border-none">
                                <Hexagon className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600 dark:text-[#0FFCBE] border-none shrink-0" />
                                <div className="border-none">
                                    <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-1 sm:mb-1.5 border-none">Avatar Borders</h2>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium border-none">Select your active display border.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 sm:gap-3 w-full mb-6 sm:mb-8 border-none">
                                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#106EBE] dark:text-[#0FFCBE] shrink-0 mt-0.5 border-none" />
                                <div className="flex flex-col border-none">
                                    <h4 className="text-[11px] sm:text-[14px] font-black text-zinc-900 dark:text-white mb-0.5 sm:mb-1 tracking-tight border-none">
                                        Kumpulkan Poin untuk Membuka Avatar!
                                    </h4>
                                    <p className="text-[10px] sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-none">
                                        Berinteraksilah dengan komunitas! Setiap kali Anda memberikan <strong className="text-zinc-700 dark:text-zinc-300 font-bold border-none">Like</strong> atau <strong className="text-zinc-700 dark:text-zinc-300 font-bold border-none">Komentar</strong> di video, poin Anda akan bertambah. Kumpulkan poin sebanyak-banyaknya untuk membuka bingkai avatar animasi eksklusif.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 border-none">
                                {FRAME_OPTIONS.map(frame => {
                                    const isLocked = currentPoints < frame.unlockPoints;
                                    const isActive = editFrame === frame.id;

                                    return (
                                        <div key={frame.id} onClick={() => { if (!isLocked) setEditFrame(frame.id); }} className={`relative flex flex-col items-center p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-300 border-none ${isActive ? 'bg-[#106EBE]/5 dark:bg-[#106EBE]/10 scale-[1.02] z-10' : isLocked ? 'bg-zinc-50 dark:bg-zinc-900/40 opacity-40 cursor-not-allowed grayscale' : 'bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'}`}>
                                            {isActive && <span className="absolute -top-2.5 sm:-top-3 bg-[#106EBE] dark:text-zinc-950 text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg z-30 uppercase tracking-widest border-none">Active</span>}

                                            <div className="h-20 sm:h-24 flex items-center justify-center mt-2 sm:mt-3 mb-4 sm:mb-6 w-full pointer-events-none border-none">
                                                <Avatar url={editAvatarUrl} frameId={frame.id} containerClass="w-12 h-12 sm:w-16 sm:h-16" scale={0.7} />
                                            </div>

                                            <div className="text-center w-full mt-auto mb-4 sm:mb-5 border-none">
                                                <p className="text-[11px] sm:text-xs font-black text-zinc-900 dark:text-white mb-0.5 sm:mb-1 border-none leading-tight">{frame.name}</p>
                                                <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wide border-none">{frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Pts`}</p>
                                            </div>

                                            <div className="h-6 sm:h-7 flex items-center justify-center w-full border-none">
                                                {isActive ? <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#106EBE] flex items-center justify-center border-none"><Check className="w-3 h-3 sm:w-4 sm:h-4 text-white border-none" /></div> : isLocked ? <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border-none"><Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 dark:text-zinc-600 border-none" /></div> : <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors border-none"></div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 🔥 TOMBOL MOBILE (Tampil HANYA di HP, posisi di urutan ke-3 paling bawah) 🔥 */}
                        <div className="lg:col-span-12 order-3 flex lg:hidden flex-col sm:flex-row gap-3 border-none mt-2 w-full">
                            <button type="submit" disabled={isSaving || !editName.trim()} className="flex-1 bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 text-white py-3.5 sm:py-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 border-none cursor-pointer">
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin border-none" /> : <Save className="w-3 h-3 border-none" />} {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            <button type="button" onClick={handleLogout} className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3.5 sm:py-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 border-none cursor-pointer">
                                <LogOut className="w-3 h-3 border-none" /> LOG OUT
                            </button>
                        </div>

                    </div>
                </form>

            </main>
            <Footer />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 border-none">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-none">

                        <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 border-none tracking-tight">Hapus Akun Permanen?</h3>

                        <p className="text-[11px] sm:text-[13px] text-zinc-500 dark:text-zinc-400 mb-6 sm:mb-8 leading-relaxed border-none">
                            Semua data profil, poin, bingkai avatar, dan riwayat komentar Anda akan lenyap dan tidak dapat dipulihkan.
                        </p>

                        <div className="flex w-full gap-2 sm:gap-3 border-none">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 sm:py-3.5 rounded-xl font-bold text-[11px] sm:text-[13px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border-none disabled:opacity-50 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 py-3 sm:py-3.5 rounded-xl font-bold text-[11px] sm:text-[13px] bg-red-500 text-white hover:bg-red-600 transition-colors border-none flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isDeleting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin border-none" /> : null}
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}