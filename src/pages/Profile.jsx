import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Crown, Settings, LogOut, Save, Loader2, AlertTriangle, Star, Lock, Check, Play, Image as ImageIcon, UserCircle, Heart, Clock, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar, { FRAME_OPTIONS } from '../components/Avatar';

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

    // State untuk Dropdown Frame Avatar
    const [isFrameDropdownOpen, setIsFrameDropdownOpen] = useState(false);

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
                        setLikedVideos(resolvedLiked.slice(0, 4));
                    }
                } else {
                    setLikedVideos([]);
                }
            }

            const localHistory = JSON.parse(localStorage.getItem('shadowclips_history') || '[]');
            if (localHistory && localHistory.length > 0) {
                const limitedHistory = localHistory.slice(0, 4);
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

        const handleStorageChange = () => {
            if (activeSession) fetchActivityData(activeSession);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('popstate', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('popstate', handleStorageChange);
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
            setIsFrameDropdownOpen(false);

            setNotification({ type: 'success', message: 'Profile updated successfully.' });
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

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center border-none transition-colors">
            <Loader2 className="w-10 h-10 text-[#106EBE] animate-spin mb-4 border-none" />
            <p className="text-zinc-500 font-bold text-sm animate-pulse border-none">Memuat data profil...</p>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 text-center font-sans border-none transition-colors">
            <Navbar isScrolled={true} supabase={supabase} />
            <div className="flex flex-col items-center justify-center mb-6 border-none">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4 border-none" />
                <h2 className="text-2xl font-black mb-3 border-none">Sesi Tidak Sinkron</h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed border-none">
                Data profil Anda belum tersinkronisasi penuh dengan server. Silakan keluar dan masuk kembali.
            </p>
            <button onClick={handleLogout} className="px-8 py-3.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-none">
                <LogOut className="w-4 h-4 shrink-0 border-none" /> Keluar & Sinkronisasi Ulang
            </button>
        </div>
    );

    const currentPoints = profile.points || 0;
    const sortedFrames = [...FRAME_OPTIONS].sort((a, b) => a.unlockPoints - b.unlockPoints);
    const nextFrame = sortedFrames.find(f => f.unlockPoints > currentPoints);
    const progressPercentage = nextFrame ? Math.min(100, Math.max(0, (currentPoints / nextFrame.unlockPoints) * 100)) : 100;

    const displayName = editName || (session?.user?.email ? session.user.email.split('@')[0] : 'User');
    const selectedFrameData = FRAME_OPTIONS.find(f => f.id === editFrame) || FRAME_OPTIONS[0];

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-300 font-sans border-none transition-colors">
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-16 relative z-10 border-none">

                {/* Notifikasi Global */}
                {notification && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 border-none">
                        <div className={`px-6 py-3 rounded-full text-sm font-bold flex items-center gap-3 shadow-lg border-none ${notification.type === 'success' ? 'bg-[#106EBE] text-white' : 'bg-red-500 text-white'}`}>
                            {notification.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0 border-none" /> : <Check className="w-4 h-4 shrink-0 border-none" />}
                            <span className="border-none">{notification.message}</span>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* 1. HERO SECTION */}
                {/* ========================================== */}
                <section className="bg-white dark:bg-zinc-800/40 rounded-[2rem] p-8 sm:p-12 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12 shadow-xl dark:shadow-2xl backdrop-blur-xl border-none transition-colors">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#106EBE]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4 border-none"></div>

                    {/* Avatar Kiri */}
                    <div className="relative shrink-0 z-10 border-none">
                        <Avatar url={editAvatarUrl} frameId={editFrame} containerClass="w-32 h-32 sm:w-40 sm:h-40 border-none" scale={1.5} />
                    </div>

                    {/* Kontainer Info & Point */}
                    <div className="flex-1 flex flex-col md:flex-row items-center md:items-center justify-between z-10 w-full gap-8 md:gap-4 border-none">

                        {/* Info Kiri */}
                        <div className="flex flex-col items-center md:items-start border-none w-full md:w-auto">
                            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight border-none mb-0.5">{displayName}</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium border-none mb-3">{session.user.email}</p>

                            <div className="flex items-center gap-4 border-none">
                                {profile.is_premium && (
                                    <span className="flex items-center gap-1.5 text-[#106EBE] dark:text-[#32ADFF] text-xs font-bold shrink-0 border-none">
                                        <Crown className="w-4 h-4 border-none" /> Premium Member
                                    </span>
                                )}
                                {profile.is_admin && (
                                    <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-bold shrink-0 border-none">
                                        <Shield className="w-4 h-4 border-none" /> Admin
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Points Kanan Ujung */}
                        <div className="flex flex-col w-full md:max-w-[320px] border-none md:ml-auto">

                            <div className="flex items-end justify-between mb-3 border-none">
                                <div className="flex flex-col items-start border-none">
                                    <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none border-none">{currentPoints.toLocaleString()}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1.5 border-none">Total Points</span>
                                </div>

                                <div className="flex flex-col items-end border-none">
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-none border-none">
                                        {nextFrame ? nextFrame.unlockPoints.toLocaleString() : 'MAX'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 border-none">
                                        Next Reward
                                    </span>
                                </div>
                            </div>

                            {nextFrame ? (
                                <div className="w-full border-none">
                                    <div className="w-full bg-zinc-200 dark:bg-black/40 rounded-full h-2.5 overflow-hidden border-none shadow-inner">
                                        <div className="bg-[#106EBE] h-full rounded-full transition-all duration-1000 ease-out border-none relative" style={{ width: `${progressPercentage}%` }}>
                                            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px] border-none"></div>
                                        </div>
                                    </div>

                                    {/* Preview Avatar Target */}
                                    <div className="mt-4 flex items-center justify-between bg-zinc-100 dark:bg-zinc-900/60 rounded-xl p-3 border-none">
                                        <div className="flex flex-col border-none">
                                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold border-none">Next Reward Avatar Border</span>
                                            <span className="text-[12px] font-black text-zinc-900 dark:text-white mt-0.5 border-none">{nextFrame.name}</span>
                                        </div>
                                        <div className="w-10 h-10 relative flex items-center justify-center shrink-0 border-none" title={`Unlock: ${nextFrame.name}`}>
                                            <Avatar url={editAvatarUrl} frameId={nextFrame.id} containerClass="w-full h-full pointer-events-none border-none" scale={0.4} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full border-none mt-2">
                                    <div className="w-full bg-[#106EBE]/10 dark:bg-[#106EBE]/20 text-[#106EBE] dark:text-[#32ADFF] text-[10px] font-bold text-center py-2 rounded-xl border-none uppercase tracking-widest">
                                        All Frames Unlocked
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* 1.5. TEXT LINK NEED HELP */}
                {/* ========================================== */}
                <div className="flex justify-center mb-8 w-full border-none">
                    <a href="/tutorial" className="group inline-flex items-center outline-none cursor-pointer border-none transition-all">
                        <span className="text-[13px] sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#32ADFF] transition-colors border-none underline decoration-transparent group-hover:decoration-[#106EBE] dark:group-hover:decoration-[#32ADFF] underline-offset-4">
                            How to upgrade or unlock your avatar border?
                        </span>
                    </a>
                </div>

                {/* ========================================== */}
                {/* 2. PROFILE SETTINGS */}
                {/* ========================================== */}
                <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-zinc-800/40 rounded-[2rem] p-8 sm:p-10 mb-8 shadow-xl dark:shadow-2xl relative z-10 backdrop-blur-xl border-none transition-colors">

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 border-none">
                        <div className="flex items-center gap-3 border-none">
                            {/* 🔥 ICON MURNI TANPA BACKGROUND WARNA 🔥 */}
                            <Settings className="w-6 h-6 text-[#106EBE] dark:text-[#32ADFF] border-none shrink-0" />
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-none">Profile Settings</h2>
                        </div>

                        <div className="flex w-full sm:w-auto gap-3 border-none">
                            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="flex-1 sm:flex-none px-5 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-colors border-none cursor-pointer">
                                Delete Account
                            </button>
                            <button type="submit" disabled={isSaving} className="flex-1 sm:flex-none px-8 py-3 bg-[#106EBE] hover:bg-[#0e5c9f] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border-none cursor-pointer">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin border-none" /> : null}
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 border-none">
                        {/* Baris 1: Avatar Link */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 border-none">
                            <div className="w-full md:w-[40%] flex items-start gap-4 border-none">
                                {/* 🔥 ICON MURNI TANPA BACKGROUND WARNA 🔥 */}
                                <ImageIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400 border-none shrink-0" />
                                <div className="border-none">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-none">Change Profile Picture</h3>
                                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed border-none">Update your profile picture from third-party links like ImgBB or Goonbox.</p>
                                </div>
                            </div>
                            <div className="w-full md:w-[60%] border-none">
                                <input
                                    type="url"
                                    value={editAvatarUrl}
                                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 rounded-xl py-3.5 px-5 text-sm text-zinc-900 dark:text-white focus:bg-zinc-100 dark:focus:bg-zinc-700/60 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        {/* Baris 2: Avatar Border (DROPDOWN GRID MENU) */}
                        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-10 relative border-none">
                            <div className="w-full md:w-[40%] flex items-start gap-4 border-none">
                                {/* 🔥 ICON MURNI TANPA BACKGROUND WARNA 🔥 */}
                                <Star className="w-6 h-6 text-zinc-500 dark:text-zinc-400 border-none shrink-0" />
                                <div className="border-none">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-none">Avatar Border</h3>
                                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed border-none">Choose an animated frame for your avatar based on your points.</p>
                                </div>
                            </div>

                            <div className="w-full md:w-[60%] relative border-none">
                                <button
                                    type="button"
                                    onClick={() => setIsFrameDropdownOpen(!isFrameDropdownOpen)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 rounded-xl py-3 px-5 text-sm text-zinc-900 dark:text-white flex items-center justify-between transition-all outline-none border-none cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 border-none">
                                        <div className="w-8 h-8 relative flex items-center justify-center bg-transparent rounded-full border-none">
                                            {/* Preview URL Asli User di Selector */}
                                            <Avatar url={editAvatarUrl} frameId={selectedFrameData.id} containerClass="w-full h-full pointer-events-none border-none" scale={0.3} />
                                        </div>
                                        <span className="font-bold border-none">{selectedFrameData.name}</span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 border-none ${isFrameDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu Grid Pilihan Avatar */}
                                {isFrameDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 border-none" onClick={() => setIsFrameDropdownOpen(false)}></div>
                                        {/* 🔥 DROPDOWN CONTAINER: Warnanya Dibuat Lebih Terang (abu-abu zinc-800/90) & Border-none 🔥 */}
                                        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-white dark:bg-zinc-800/95 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-4 border-none animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[350px] overflow-y-auto pr-2 border-none" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                                {FRAME_OPTIONS.map(frame => {
                                                    const isLocked = currentPoints < frame.unlockPoints;
                                                    const isActive = editFrame === frame.id;

                                                    return (
                                                        <button
                                                            key={frame.id}
                                                            type="button"
                                                            disabled={isLocked}
                                                            onClick={() => { setEditFrame(frame.id); setIsFrameDropdownOpen(false); }}
                                                            // 🔥 ITEM KOTAK AVATAR: Warnanya Dibuat Lebih Gelap (Hitam zinc-900/60) & Auto-Height 🔥
                                                            className={`relative flex flex-col items-center justify-start p-3 h-auto w-full rounded-xl transition-all duration-200 outline-none border-none cursor-pointer
                                                                ${isActive ? 'bg-[#106EBE]/10 dark:bg-[#106EBE]/20' : isLocked ? 'opacity-40 cursor-not-allowed grayscale bg-zinc-50 dark:bg-zinc-900/40' : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-900'}
                                                            `}
                                                            title={`${frame.name} (${frame.unlockPoints} Pts)`}
                                                        >
                                                            <div className="w-12 h-12 relative flex items-center justify-center mb-3 shrink-0 border-none">
                                                                <Avatar url={editAvatarUrl} frameId={frame.id} containerClass="w-full h-full pointer-events-none border-none" scale={0.45} />
                                                            </div>
                                                            <div className="flex flex-col items-center w-full border-none">
                                                                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white text-center leading-tight truncate w-full border-none pb-1">{frame.name}</span>

                                                                {/* 🔥 TEKS POIN DIJAMIN TAMPIL (display: block) DENGAN WARNA KONTRAST 🔥 */}
                                                                <span className="text-[10px] font-black text-[#106EBE] dark:text-[#32ADFF] text-center uppercase tracking-widest w-full border-none block mt-1.5">
                                                                    {frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Pts`}
                                                                </span>
                                                            </div>

                                                            {/* Indikator Status */}
                                                            {isActive && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-[#106EBE] dark:text-[#32ADFF] border-none" />}
                                                            {isLocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-zinc-400 dark:text-zinc-500 border-none" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Baris 3: Change Username */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 border-none">
                            <div className="w-full md:w-[40%] flex items-start gap-4 border-none">
                                {/* 🔥 ICON MURNI TANPA BACKGROUND WARNA 🔥 */}
                                <UserCircle className="w-6 h-6 text-zinc-500 dark:text-zinc-400 border-none shrink-0" />
                                <div className="border-none">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-none">Change Username</h3>
                                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed border-none">Update your unique display name.</p>
                                </div>
                            </div>
                            <div className="w-full md:w-[60%] border-none">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 rounded-xl py-3.5 px-5 text-sm text-zinc-900 dark:text-white focus:bg-zinc-100 dark:focus:bg-zinc-700/60 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-none"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* ========================================== */}
                {/* 3. ACTIVITY GRID */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 border-none">

                    {/* Panel Liked */}
                    <div className="bg-white dark:bg-zinc-800/40 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl border-none transition-colors">
                        <div className="flex items-center gap-3 mb-8 border-none">
                            {/* 🔥 ICON MURNI TANPA BACKGROUND WARNA 🔥 */}
                            <Heart className="w-5 h-5 text-rose-500 border-none shrink-0" />
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white border-none">Liked Videos</h2>
                        </div>

                        {likedVideos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-none">
                                {likedVideos.map(vid => (
                                    <a key={vid.id} href={`/streaming/${vid.slug || vid.id}`} className="group flex flex-col gap-2.5 border-none outline-none" title={vid.title}>
                                        <div className="relative aspect-[3/4] sm:aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-none">
                                            <img src={getImageUrl(vid.img)} loading="lazy" alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 border-none" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 border-none">
                                                <Play className="w-8 h-8 text-white fill-current drop-shadow-md border-none" />
                                            </div>
                                        </div>
                                        <h3 className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-white truncate border-none">{vid.title}</h3>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-400 dark:text-zinc-600 border-none">
                                <Heart className="w-6 h-6 opacity-50 border-none" />
                                <span className="text-[11px] font-medium border-none">Belum ada video yang disukai</span>
                            </div>
                        )}
                    </div>

                    {/* Panel Watch History */}
                    <div className="bg-white dark:bg-zinc-800/40 rounded-[2rem] p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl border-none transition-colors">
                        <div className="flex items-center gap-3 mb-8 border-none">
                            {/* 🔥 ICON MURNI TANPA BACKGROUND WARNA 🔥 */}
                            <Clock className="w-5 h-5 text-[#106EBE] dark:text-[#32ADFF] border-none shrink-0" />
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white border-none">Watch History</h2>
                        </div>

                        {historyVideos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-none">
                                {historyVideos.map(vid => (
                                    <a key={vid.id} href={`/streaming/${vid.slug || vid.id}`} className="group flex flex-col gap-2.5 border-none outline-none" title={vid.title}>
                                        <div className="relative aspect-[3/4] sm:aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-none">
                                            <img src={getImageUrl(vid.img)} loading="lazy" alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 border-none" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 border-none">
                                                <Play className="w-8 h-8 text-white fill-current drop-shadow-md border-none" />
                                            </div>
                                        </div>
                                        <h3 className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-white truncate border-none">{vid.title}</h3>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-400 dark:text-zinc-600 border-none">
                                <Clock className="w-6 h-6 opacity-50 border-none" />
                                <span className="text-[11px] font-medium border-none">Belum ada riwayat tontonan</span>
                            </div>
                        )}
                    </div>

                </div>

            </main>
            <Footer />

            {/* Modal Konfirmasi Hapus Akun */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 border-none">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-none">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 border-none">
                            <AlertTriangle className="w-8 h-8 text-red-500 border-none" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 border-none">Hapus Akun Permanen?</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed border-none">
                            Semua data profil, poin, bingkai avatar, dan riwayat Anda akan lenyap secara permanen. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="flex w-full gap-3 border-none">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-white transition-colors cursor-pointer border-none outline-none">
                                Batal
                            </button>
                            <button onClick={executeDeleteAccount} disabled={isDeleting} className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-none outline-none">
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin border-none" /> : null}
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}