import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Shield,
    Crown,
    LogOut,
    Save,
    Loader2,
    AlertTriangle,
    Lock,
    Check,
    Play,
    Image as ImageIcon,
    User,
    Heart,
    Clock,
    Bookmark,
    Sparkles,
    Trophy,
    Trash2,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar, { FRAME_OPTIONS } from '../components/Avatar';

const getImageUrl = (imgString) => (imgString ? imgString.split(',')[0].trim() : '');

export default function Profile({ supabase }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const [openSections, setOpenSections] = useState({
        wardrobe: false,
        customize: false,
        activity: true,
    });

    const toggleSection = (sectionKey) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    const [editName, setEditName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [editFrame, setEditFrame] = useState('none');

    const [mediaTab, setMediaTab] = useState('likes');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [likedVideos, setLikedVideos] = useState([]);
    const [historyVideos, setHistoryVideos] = useState([]);
    const [savedVideos, setSavedVideos] = useState([]);

    // 🔥 REF UNTUK SLIDER SAVED VIDEO 🔥
    const savedScrollRef = useRef(null);

    const scrollSaved = (direction) => {
        if (savedScrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            savedScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const fetchActivityData = useCallback(async (currentSession) => {
        if (!supabase) return;
        try {
            if (currentSession?.user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('points, active_frame')
                    .eq('id', currentSession.user.id)
                    .maybeSingle();

                if (profileData) {
                    setProfile((prev) =>
                        prev ? { ...prev, points: profileData.points, active_frame: profileData.active_frame } : null
                    );
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
                    .limit(12);

                if (!likesError && likesData && likesData.length > 0) {
                    const videoIds = [...new Set(likesData.map((l) => l.video_id))];
                    const { data: vids, error: vidsError } = await supabase
                        .from('videos')
                        .select('id, title, slug, img')
                        .in('id', videoIds);

                    if (!vidsError && vids) {
                        const resolvedLiked = videoIds
                            .map((id) => vids.find((v) => String(v.id) === String(id)))
                            .filter(Boolean);
                        setLikedVideos(resolvedLiked);
                    }
                } else {
                    setLikedVideos([]);
                }
            }

            const localHistory = JSON.parse(localStorage.getItem('shadowclips_history') || '[]');
            if (localHistory && localHistory.length > 0) {
                const limitedHistory = localHistory.slice(0, 12);
                const { data: histVids, error: histError } = await supabase
                    .from('videos')
                    .select('id, title, slug, img')
                    .in('id', limitedHistory);

                if (!histError && histVids) {
                    setHistoryVideos(
                        limitedHistory.map((id) => histVids.find((v) => String(v.id) === String(id))).filter(Boolean)
                    );
                }
            } else {
                setHistoryVideos([]);
            }

            if (userId) {
                const { data: bookmarkData, error: bookmarkError } = await supabase
                    .from('user_bookmarks')
                    .select('video_id')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(20); // Ditingkatkan limitnya karena menggunakan slider

                if (!bookmarkError && bookmarkData && bookmarkData.length > 0) {
                    const bVideoIds = [...new Set(bookmarkData.map((b) => b.video_id))];
                    const { data: bVids, error: bVidsError } = await supabase
                        .from('videos')
                        .select('id, title, slug, img')
                        .in('id', bVideoIds);

                    if (!bVidsError && bVids) {
                        const resolvedSaved = bVideoIds
                            .map((id) => bVids.find((v) => String(v.id) === String(id)))
                            .filter(Boolean);
                        setSavedVideos(resolvedSaved);
                    }
                } else {
                    setSavedVideos([]);
                }
            }

        } catch (error) {
            console.warn('Activity fetch error:', error);
        }
    }, [supabase]);

    useEffect(() => {
        if (!supabase) return;
        let activeSession = null;

        const getProfileData = async () => {
            setLoading(true);
            try {
                const {
                    data: { session: currentSession },
                    error: sessionError,
                } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (currentSession?.user) {
                    activeSession = currentSession;
                    setSession(currentSession);

                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentSession.user.id)
                        .maybeSingle();

                    if (profileData) {
                        setProfile(profileData);
                        setEditName(profileData.name || '');
                        setEditAvatarUrl(profileData.avatar_url || '');

                        const currentFrame = FRAME_OPTIONS.find((f) => f.id === profileData.active_frame);
                        if (currentFrame && (profileData.points || 0) < currentFrame.unlockPoints) {
                            setEditFrame('none');
                        } else {
                            setEditFrame(profileData.active_frame || 'none');
                        }
                    } else {
                        setProfile(null);
                    }

                    await fetchActivityData(currentSession);
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.warn('Kesalahan muat profil:', error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
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
        if (e) e.preventDefault();
        if (!supabase || !session) return;
        setIsSaving(true);
        setNotification(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ name: editName, avatar_url: editAvatarUrl, active_frame: editFrame })
                .eq('id', session.user.id);

            if (error) throw error;
            setProfile((prev) => ({ ...prev, name: editName, avatar_url: editAvatarUrl, active_frame: editFrame }));

            setNotification({ type: 'success', message: 'Profil berhasil diperbarui.' });
            setTimeout(() => setNotification(null), 3500);
        } catch (err) {
            setNotification({ type: 'error', message: 'Gagal memperbarui profil.' });
            setTimeout(() => setNotification(null), 3500);
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

    const executeDeleteAccount = async () => {
        if (!supabase || !session) return;
        setIsDeleting(true);
        try {
            await supabase.from('profiles').delete().eq('id', session.user.id);
            await supabase.rpc('delete_current_user');
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (error) {
            setNotification({ type: 'error', message: 'Gagal menghapus akun.' });
            setTimeout(() => setNotification(null), 3500);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center transition-colors">
                <Loader2 className="w-8 h-8 text-[#106EBE] animate-spin mb-3" />
                <p className="text-xs uppercase tracking-widest font-bold text-zinc-600 dark:text-zinc-400">
                    Memuat Profil...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 flex flex-col items-center justify-center px-4 text-center font-sans transition-colors">
                <Navbar isScrolled={true} supabase={supabase} />
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 text-red-500 shadow-sm dark:shadow-md">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Sesi Profil Belum Terhubung</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm text-sm leading-relaxed">
                    Data akun Anda belum tersinkronisasi penuh dengan server. Silakan keluar dan masuk kembali.
                </p>
                <button
                    onClick={handleLogout}
                    className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-750 dark:hover:bg-zinc-700 text-white rounded-2xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                    <LogOut className="w-4 h-4" /> Keluar & Sinkronisasi Ulang
                </button>
            </div>
        );
    }

    const currentPoints = profile.points || 0;
    const sortedFrames = [...FRAME_OPTIONS].sort((a, b) => a.unlockPoints - b.unlockPoints);
    const nextFrame = sortedFrames.find((f) => f.unlockPoints > currentPoints);
    const progressPercentage = nextFrame
        ? Math.min(100, Math.max(0, (currentPoints / nextFrame.unlockPoints) * 100))
        : 100;

    const displayName = editName || (session?.user?.email ? session.user.email.split('@')[0] : 'User');
    const selectedFrameData = FRAME_OPTIONS.find((f) => f.id === editFrame) || FRAME_OPTIONS[0];

    const hasUnsavedChanges =
        editName !== (profile.name || '') ||
        editAvatarUrl !== (profile.avatar_url || '') ||
        editFrame !== (profile.active_frame || 'none');

    return (
        <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 font-sans antialiased transition-colors duration-200">
            <Navbar isScrolled={true} supabase={supabase} />

            {notification && (
                <div className="fixed top-24 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
                    <div
                        className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xl ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                            }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                        )}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-24">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <aside className="lg:col-span-4 space-y-6">

                        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-md flex flex-col items-center text-center transition-colors">

                            <div className="relative mb-5 flex items-center justify-center">
                                <Avatar
                                    url={editAvatarUrl}
                                    frameId={editFrame}
                                    containerClass="w-32 h-32 sm:w-36 sm:h-36"
                                    scale={1.45}
                                />
                            </div>

                            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-1">
                                {displayName}
                            </h1>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-4 truncate max-w-full">
                                {session.user.email}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                                {profile.is_admin && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-[#106EBE] text-white shadow-sm">
                                        <Shield className="w-3.5 h-3.5" /> ADMIN
                                    </span>
                                )}
                                {profile.is_premium && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-amber-500 text-zinc-950 shadow-sm">
                                        <Crown className="w-3.5 h-3.5 fill-current" /> PREMIUM
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5" /> {selectedFrameData.name}
                                </span>
                            </div>

                            <div className="w-full grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-700/40 mb-6 transition-colors">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">{currentPoints.toLocaleString()}</span>
                                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Points</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">{likedVideos.length}</span>
                                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Likes</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">{savedVideos.length}</span>
                                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Saved</span>
                                </div>
                            </div>

                            <div className="w-full bg-zinc-100 dark:bg-zinc-700/40 rounded-2xl p-4 text-left space-y-2.5 transition-colors">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> Next Milestone
                                    </span>
                                    <span className="font-mono font-black text-zinc-900 dark:text-white">
                                        {nextFrame ? `${nextFrame.unlockPoints.toLocaleString()} Pts` : 'MAX TIER'}
                                    </span>
                                </div>

                                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-600/60 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#106EBE] transition-all duration-700 ease-out rounded-full"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 pt-0.5 font-medium">
                                    <span>Target: <strong className="text-zinc-900 dark:text-zinc-200 font-bold">{nextFrame ? nextFrame.name : 'All Unlocked'}</strong></span>
                                    <a href="/tutorial" className="text-[#106EBE] dark:text-[#32ADFF] hover:underline font-bold transition-colors">
                                        Tutorial
                                    </a>
                                </div>
                            </div>

                            <div className="w-full flex items-center gap-2 mt-6 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700/40 dark:hover:bg-zinc-700/70 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm dark:shadow-none"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Keluar
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-red-600 hover:text-white dark:bg-zinc-700/40 dark:hover:bg-red-600 dark:hover:text-white text-zinc-600 dark:text-zinc-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm dark:shadow-none"
                                    title="Hapus Akun Permanen"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                        </div>
                    </aside>

                    <div className="lg:col-span-8 space-y-6">

                        <section className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-md transition-colors">
                            <div
                                onClick={() => toggleSection('wardrobe')}
                                className="flex items-center justify-between cursor-pointer select-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-300 shrink-0" />
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white group-hover:text-[#106EBE] dark:group-hover:text-[#32ADFF] transition-colors">
                                            Frame Wardrobe
                                        </h2>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                            Pilih bingkai avatar berdasarkan poin reward akun Anda.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 text-zinc-800 dark:text-zinc-200 hidden sm:inline-block shadow-sm dark:shadow-none">
                                        {FRAME_OPTIONS.filter((f) => currentPoints >= f.unlockPoints).length} / {FRAME_OPTIONS.length} Unlocked
                                    </span>
                                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.wardrobe ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            {openSections.wardrobe && (
                                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-700/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                                        {FRAME_OPTIONS.map((frame) => {
                                            const isLocked = currentPoints < frame.unlockPoints;
                                            const isEquipped = editFrame === frame.id;

                                            return (
                                                <button
                                                    key={frame.id}
                                                    type="button"
                                                    disabled={isLocked}
                                                    onClick={() => {
                                                        if (!isLocked) setEditFrame(frame.id);
                                                    }}
                                                    className={`relative rounded-2xl p-4 flex flex-col items-center text-center transition-all cursor-pointer ${isEquipped
                                                        ? 'bg-zinc-200/90 text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm'
                                                        : isLocked
                                                            ? 'bg-zinc-100 dark:bg-zinc-700/20 opacity-40 cursor-not-allowed'
                                                            : 'bg-zinc-100 hover:bg-zinc-200/70 dark:bg-zinc-700/30 dark:hover:bg-zinc-700/60 shadow-sm dark:shadow-none'
                                                        }`}
                                                >
                                                    <div className="w-14 h-14 relative flex items-center justify-center mb-2.5">
                                                        <Avatar
                                                            url={editAvatarUrl}
                                                            frameId={frame.id}
                                                            containerClass="w-full h-full pointer-events-none"
                                                            scale={0.45}
                                                        />
                                                    </div>

                                                    <span className="text-xs font-black truncate w-full mb-1 text-zinc-900 dark:text-zinc-100">
                                                        {frame.name}
                                                    </span>

                                                    <span
                                                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm ${isLocked
                                                            ? 'bg-zinc-200 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-300'
                                                            : 'bg-emerald-600 text-white'
                                                            }`}
                                                    >
                                                        {frame.unlockPoints === 0 ? 'FREE' : `${frame.unlockPoints.toLocaleString()} PTS`}
                                                    </span>

                                                    {isEquipped && (
                                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#106EBE] text-white flex items-center justify-center shadow-md">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                    )}
                                                    {isLocked && (
                                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                                                            <Lock className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-md transition-colors">
                            <div
                                onClick={() => toggleSection('customize')}
                                className="flex items-center justify-between cursor-pointer select-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-zinc-900 dark:text-zinc-300 shrink-0" />
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white group-hover:text-[#106EBE] dark:group-hover:text-[#32ADFF] transition-colors">
                                            Profile Customization
                                        </h2>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                            Ubah identitas publik dan tautan foto avatar Anda.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {hasUnsavedChanges && (
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-zinc-950">
                                            Belum Disimpan
                                        </span>
                                    )}
                                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.customize ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            {openSections.customize && (
                                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-700/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                                                    Username
                                                </label>
                                                <div className="relative">
                                                    <User className="w-4 h-4 text-zinc-400 dark:text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        required
                                                        placeholder="Nama tampilan Anda..."
                                                        className="w-full bg-zinc-100 focus:bg-zinc-200/70 dark:bg-zinc-700/40 dark:focus:bg-zinc-700/70 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-400 outline-none transition-colors shadow-sm dark:shadow-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                                                        Avatar URL
                                                    </label>
                                                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Goonbox, ImgBB, dll</span>
                                                </div>
                                                <div className="relative">
                                                    <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        type="url"
                                                        value={editAvatarUrl}
                                                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                                                        placeholder="https://example.com/avatar.jpg"
                                                        className="w-full bg-zinc-100 focus:bg-zinc-200/70 dark:bg-zinc-700/40 dark:focus:bg-zinc-700/70 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-400 outline-none transition-colors shadow-sm dark:shadow-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 flex items-center justify-between">
                                            <div className="text-xs">
                                                {hasUnsavedChanges ? (
                                                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                                                        Ada perubahan yang belum disimpan
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Profil tersinkronisasi</span>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-7 py-3.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Simpan Perubahan
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </section>

                        <section className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-md transition-colors">
                            <div
                                onClick={() => toggleSection('activity')}
                                className="flex items-center justify-between cursor-pointer select-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-zinc-900 dark:text-zinc-300 shrink-0" />
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white group-hover:text-[#106EBE] dark:group-hover:text-[#32ADFF] transition-colors">
                                            Activity & Media Reels
                                        </h2>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                            Koleksi video favorit, tersimpan, dan riwayat Anda.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 text-zinc-800 dark:text-zinc-200 hidden sm:inline-block shadow-sm dark:shadow-none">
                                        {likedVideos.length + historyVideos.length + savedVideos.length} Items
                                    </span>
                                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.activity ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            {openSections.activity && (
                                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-700/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-wrap items-center gap-2 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setMediaTab('likes')}
                                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${mediaTab === 'likes'
                                                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm'
                                                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-700/30 dark:text-zinc-400 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${mediaTab === 'likes' ? 'text-rose-500' : 'text-zinc-400'}`} /> Disukai ({likedVideos.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMediaTab('saved')}
                                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${mediaTab === 'saved'
                                                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm'
                                                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-700/30 dark:text-zinc-400 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200'
                                                }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${mediaTab === 'saved' ? 'text-[#106EBE] dark:text-[#32ADFF]' : 'text-zinc-400'}`} /> Tersimpan ({savedVideos.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMediaTab('history')}
                                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${mediaTab === 'history'
                                                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-sm'
                                                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-700/30 dark:text-zinc-400 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200'
                                                }`}
                                        >
                                            <Clock className={`w-4 h-4 ${mediaTab === 'history' ? 'text-[#106EBE] dark:text-[#32ADFF]' : 'text-zinc-400'}`} /> Riwayat ({historyVideos.length})
                                        </button>
                                    </div>

                                    {mediaTab === 'likes' && (
                                        likedVideos.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                                                {likedVideos.map((vid) => (
                                                    <a
                                                        key={vid.id}
                                                        href={`/streaming/${vid.slug || vid.id}`}
                                                        className="group flex flex-col gap-2 outline-none"
                                                        title={vid.title}
                                                    >
                                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-700/30 shadow-sm">
                                                            <img
                                                                src={getImageUrl(vid.img)}
                                                                loading="lazy"
                                                                alt={vid.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Play className="w-7 h-7 text-white fill-white drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 group-hover:text-[#106EBE] dark:group-hover:text-white truncate px-0.5 transition-colors">
                                                            {vid.title}
                                                        </h3>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 space-y-2 bg-zinc-100 dark:bg-zinc-700/20 rounded-2xl transition-colors">
                                                <Heart className="w-8 h-8 opacity-40 text-zinc-400 dark:text-zinc-500" />
                                                <p className="text-xs font-bold">Belum ada video yang Anda sukai.</p>
                                            </div>
                                        )
                                    )}

                                    {/* 🔥 SLIDER KHUSUS TAB SAVED 🔥 */}
                                    {mediaTab === 'saved' && (
                                        savedVideos.length > 0 ? (
                                            <div className="relative group/slider">

                                                <button
                                                    onClick={() => scrollSaved('left')}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 opacity-0 group-hover/slider:opacity-100 hover:bg-white dark:hover:bg-zinc-700 transition-all outline-none border-none pointer-events-auto"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>

                                                <div
                                                    ref={savedScrollRef}
                                                    className="flex overflow-x-auto gap-3.5 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                                                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                                                >
                                                    {savedVideos.map((vid) => (
                                                        <a
                                                            key={vid.id}
                                                            href={`/streaming/${vid.slug || vid.id}`}
                                                            className="shrink-0 w-[150px] sm:w-[180px] snap-start group flex flex-col gap-2 outline-none"
                                                            title={vid.title}
                                                        >
                                                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-700/30 shadow-sm">
                                                                <img
                                                                    src={getImageUrl(vid.img)}
                                                                    loading="lazy"
                                                                    alt={vid.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Play className="w-7 h-7 text-white fill-white drop-shadow-lg" />
                                                                </div>
                                                            </div>
                                                            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 group-hover:text-[#106EBE] dark:group-hover:text-white truncate px-0.5 transition-colors">
                                                                {vid.title}
                                                            </h3>
                                                        </a>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => scrollSaved('right')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 opacity-0 group-hover/slider:opacity-100 hover:bg-white dark:hover:bg-zinc-700 transition-all outline-none border-none pointer-events-auto"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>

                                            </div>
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 space-y-2 bg-zinc-100 dark:bg-zinc-700/20 rounded-2xl transition-colors">
                                                <Bookmark className="w-8 h-8 opacity-40 text-zinc-400 dark:text-zinc-500" />
                                                <p className="text-xs font-bold">Belum ada video yang Anda simpan.</p>
                                            </div>
                                        )
                                    )}

                                    {mediaTab === 'history' && (
                                        historyVideos.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                                                {historyVideos.map((vid) => (
                                                    <a
                                                        key={vid.id}
                                                        href={`/streaming/${vid.slug || vid.id}`}
                                                        className="group flex flex-col gap-2 outline-none"
                                                        title={vid.title}
                                                    >
                                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-700/30 shadow-sm">
                                                            <img
                                                                src={getImageUrl(vid.img)}
                                                                loading="lazy"
                                                                alt={vid.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Play className="w-7 h-7 text-white fill-white drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 group-hover:text-[#106EBE] dark:group-hover:text-white truncate px-0.5 transition-colors">
                                                            {vid.title}
                                                        </h3>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 space-y-2 bg-zinc-100 dark:bg-zinc-700/20 rounded-2xl transition-colors">
                                                <Clock className="w-8 h-8 opacity-40 text-zinc-400 dark:text-zinc-500" />
                                                <p className="text-xs font-bold">Belum ada riwayat tontonan terbaru.</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            </main>

            <Footer />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 transition-colors">
                        <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-700/40 rounded-full flex items-center justify-center mb-4 text-red-500">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">Hapus Akun Permanen?</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            Semua data profil, poin, bingkai avatar, dan riwayat tontonan akan dihapus dari server secara permanen. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700/40 dark:hover:bg-zinc-700/70 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={executeDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                            >
                                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}