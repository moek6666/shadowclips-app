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
    ChevronRight,
    Shirt,
    Smile,
    ThumbsUp,
    Star,
    Eye,
    BarChart2,
    Calendar
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar, { FRAME_OPTIONS } from '../components/Avatar';
import CharacterSelector from '../components/CharacterSelector'; 

import ModelHeader, { MODEL_PRESETS, DEFAULT_HEADER_MODEL } from '../components/ModelHeader'; 

const getImageUrl = (imgString) => (imgString ? imgString.split(',')[0].trim() : '');

const OutstreamAd = () => {
    useEffect(() => {
        const script1 = document.createElement('script');
        script1.src = 'https://a.magsrv.com/ad-provider.js';
        script1.async = true;
        script1.type = 'application/javascript';
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.innerHTML = `(window.AdProvider = window.AdProvider || []).push({"serve": {}});`;
        document.body.appendChild(script2);

        return () => {
            if (document.head.contains(script1)) document.head.removeChild(script1);
            if (document.body.contains(script2)) document.body.removeChild(script2);
        };
    }, []);

    return (
        <div className="w-full max-w-[1400px] mx-auto flex justify-center py-6 border-none overflow-hidden">
            <ins className="eas6a97888e20" data-zoneid="6002934" data-sub="123450000"></ins>
        </div>
    );
};

export default function Profile({ supabase }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const [openSections, setOpenSections] = useState({
        wardrobe: false,
        customize: false, 
        activity: false,
    });

    const toggleSection = (sectionKey) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    const [editName, setEditName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [editHeaderBgUrl, setEditHeaderBgUrl] = useState(DEFAULT_HEADER_MODEL);
    const [editFrame, setEditFrame] = useState('none');

    const [mediaTab, setMediaTab] = useState('history');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [totalLikes, setTotalLikes] = useState(0);
    const [likedVideos, setLikedVideos] = useState([]);
    const [historyVideos, setHistoryVideos] = useState([]);
    const [savedVideos, setSavedVideos] = useState([]);

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
                const { count: likesCount } = await supabase
                    .from('user_likes')
                    .select('video_id', { count: 'exact', head: true })
                    .in('device_id', queryIds);

                setTotalLikes(likesCount || 0);

                const { data: likesData, error: likesError } = await supabase
                    .from('user_likes')
                    .select('video_id')
                    .in('device_id', queryIds)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (!likesError && likesData && likesData.length > 0) {
                    const videoIds = [...new Set(likesData.map((l) => l.video_id))];
                    const { data: vids, error: vidsError } = await supabase
                        .from('videos')
                        .select('id, title, slug, img, created_at')
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
                const limitedHistory = localHistory.slice(0, 10);
                const { data: histVids, error: histError } = await supabase
                    .from('videos')
                    .select('id, title, slug, img, created_at')
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
                    .limit(10);

                if (!bookmarkError && bookmarkData && bookmarkData.length > 0) {
                    const bVideoIds = [...new Set(bookmarkData.map((b) => b.video_id))];
                    const { data: bVids, error: bVidsError } = await supabase
                        .from('videos')
                        .select('id, title, slug, img, created_at')
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
                        
                        const googleAvatar = currentSession.user.user_metadata?.avatar_url;
                        setEditAvatarUrl(profileData.avatar_url || googleAvatar || '');
                        
                        const savedUrl = profileData.header_bg_url || '';
                        const isValidModel = MODEL_PRESETS.some(preset => preset.url === savedUrl);
                        
                        setEditHeaderBgUrl(isValidModel ? savedUrl : DEFAULT_HEADER_MODEL);

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

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    name: editName, 
                    avatar_url: editAvatarUrl, 
                    active_frame: editFrame,
                    header_bg_url: editHeaderBgUrl
                })
                .eq('id', session.user.id);

            if (error) throw error;
            setProfile((prev) => ({ 
                ...prev, 
                name: editName, 
                avatar_url: editAvatarUrl, 
                active_frame: editFrame,
                header_bg_url: editHeaderBgUrl 
            }));

            toast.success('Profil berhasil diperbarui.');
        } catch (err) {
            toast.error('Gagal memperbarui profil.');
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

    const handleSelectAvatar = (url) => {
        setEditAvatarUrl(url);
    };

    const timeAgo = (dateString) => {
        if (!dateString) return 'Baru saja';
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((new Date() - date) / 1000);
        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0E1116] text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center transition-colors">
                <Loader2 className="w-8 h-8 text-[#106EBE] animate-spin mb-3" />
                <p className="text-xs uppercase tracking-widest font-bold text-zinc-600 dark:text-zinc-400">
                    Memuat Profil...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0E1116] text-zinc-900 dark:text-zinc-200 flex flex-col items-center justify-center px-4 text-center font-sans transition-colors">
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
                    className="px-6 py-3.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white rounded-2xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                    <LogOut className="w-4 h-4" /> Keluar & Sinkronisasi Ulang
                </button>
            </div>
        );
    }

    const currentPoints = profile.points || 0;
    const displayName = editName || (session?.user?.email ? session.user.email.split('@')[0] : 'User');
    
    const googleAvatar = session?.user?.user_metadata?.avatar_url;
    const currentAvatarToDisplay = editAvatarUrl || googleAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=106EBE&color=fff&size=256&bold=true`;
    
    const hasUnsavedChanges =
        editName !== (profile.name || '') ||
        editAvatarUrl !== (profile.avatar_url || googleAvatar || '') ||
        editHeaderBgUrl !== (profile.header_bg_url || DEFAULT_HEADER_MODEL) ||
        editFrame !== (profile.active_frame || 'none');

    let activeMediaList = [];
    if (mediaTab === 'history') activeMediaList = historyVideos;
    else if (mediaTab === 'likes') activeMediaList = likedVideos;
    else if (mediaTab === 'saved') activeMediaList = savedVideos;

    const activeFrameName = FRAME_OPTIONS.find((f) => f.id === profile.active_frame)?.name || 'Tanpa Frame';
    const activeModelName = MODEL_PRESETS.find((m) => m.url === profile.header_bg_url)?.name || 'Tanpa Model';
    const joinDate = session?.user?.created_at 
        ? new Date(session.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : '-';

    return (
        <div className="min-h-screen flex flex-col bg-[#F0F4F8] dark:bg-[#0E1116] text-zinc-900 dark:text-zinc-200 font-sans antialiased transition-colors duration-200">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start border-none">
                    
                    {/* --- KIRI: SIDEBAR STATISTIK USER --- */}
                    <aside className="hidden lg:flex flex-col lg:col-span-3 sticky top-28 h-[calc(100vh-140px)] border-none">
                        <div className="w-full h-full flex flex-col bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-none">
                            <div className="bg-[#106EBE] px-5 py-4 flex items-center gap-3 border-none shrink-0">
                                <BarChart2 className="w-6 h-6 text-white shrink-0 border-none" strokeWidth={2.5}/>
                                <div className="border-none">
                                    <h2 className="text-base font-black text-white leading-tight border-none">Statistik User</h2>
                                    <p className="text-[10px] text-blue-100 font-medium mt-0.5 border-none">Ringkasan data profil kamu.</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-6 border-none p-5 overflow-y-auto custom-scrollbar">
                                
                                <div className="flex flex-col gap-2 border-none">
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-none">Status Akun</span>
                                    <div className="flex flex-wrap items-center gap-4 border-none">
                                        {profile.is_premium ? (
                                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 border-none">
                                                <Crown className="w-4 h-4 border-none" /> <span className="text-xs font-bold border-none">Premium VIP</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 border-none">
                                                <User className="w-4 h-4 border-none" /> <span className="text-xs font-bold border-none">Member Gratis</span>
                                            </div>
                                        )}
                                        {profile.is_admin && (
                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-none">
                                                <Shield className="w-4 h-4 border-none" /> <span className="text-xs font-bold border-none">Admin</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3.5 border-none">
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-none">Informasi Dasar</span>
                                    
                                    <div className="flex items-center gap-3 border-none">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border-none">
                                            <Calendar className="w-4 h-4 text-[#106EBE] border-none" />
                                        </div>
                                        <div className="flex flex-col border-none">
                                            <span className="text-[10px] text-zinc-500 border-none">Bergabung Sejak</span>
                                            <span className="text-[13px] font-bold text-zinc-900 dark:text-white border-none">{joinDate}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-none">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border-none">
                                            <Shirt className="w-4 h-4 text-[#106EBE] border-none" />
                                        </div>
                                        <div className="flex flex-col border-none">
                                            <span className="text-[10px] text-zinc-500 border-none">Wardrobe Aktif</span>
                                            <span className="text-[13px] font-bold text-zinc-900 dark:text-white border-none">{activeFrameName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-none">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border-none">
                                            <Smile className="w-4 h-4 text-[#106EBE] border-none" />
                                        </div>
                                        <div className="flex flex-col border-none">
                                            <span className="text-[10px] text-zinc-500 border-none">Model Karakter</span>
                                            <span className="text-[13px] font-bold text-zinc-900 dark:text-white border-none">{activeModelName}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-none mt-2">
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-none">Aktivitas Interaksi</span>
                                    
                                    <div className="grid grid-cols-2 gap-3 border-none">
                                        <div className="bg-zinc-50 dark:bg-[#1E242D] p-3 rounded-xl flex flex-col items-center justify-center text-center border-none">
                                            <ThumbsUp className="w-5 h-5 text-[#106EBE] mb-1.5 border-none" />
                                            <span className="text-lg font-black text-zinc-900 dark:text-white leading-none border-none">{totalLikes}</span>
                                            <span className="text-[10px] font-medium text-zinc-500 mt-1 border-none">Video Disukai</span>
                                        </div>
                                        <div className="bg-zinc-50 dark:bg-[#1E242D] p-3 rounded-xl flex flex-col items-center justify-center text-center border-none">
                                            <Bookmark className="w-5 h-5 text-[#106EBE] mb-1.5 border-none" />
                                            <span className="text-lg font-black text-zinc-900 dark:text-white leading-none border-none">{savedVideos.length}</span>
                                            <span className="text-[10px] font-medium text-zinc-500 mt-1 border-none">Disimpan</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </aside>

                    {/* --- KANAN: MAIN CONTENT --- */}
                    <div className="lg:col-span-9 flex flex-col gap-6 border-none">
                        
                        <div className="relative w-full h-auto min-h-[200px] sm:min-h-[250px] rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#0f4b81] to-[#106EBE] dark:from-[#0a2e54] dark:to-[#094880] p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-center gap-6 sm:gap-10 shadow-[0_8px_30px_rgba(16,110,190,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border-none mt-6 sm:mt-10">
                            
                            {editHeaderBgUrl && editHeaderBgUrl !== 'none' && (
                                <div className="absolute bottom-0 right-0 sm:right-6 md:right-12 w-[65%] sm:w-[50%] lg:w-[45%] h-[125%] sm:h-[145%] pointer-events-none z-0 border-none flex justify-end items-end">
                                    <img 
                                        src={editHeaderBgUrl} 
                                        className="w-auto h-full max-w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] border-none" 
                                        alt="header model" 
                                    />
                                </div>
                            )}
                            
                            <div className="relative z-10 shrink-0 flex items-center justify-center border-none">
                               <div className="relative rounded-full bg-white/10 p-2 backdrop-blur-sm border-none shadow-2xl">
                                   <Avatar
                                       url={currentAvatarToDisplay}
                                       frameId={editFrame}
                                       containerClass="w-32 h-32 sm:w-40 sm:h-40 border-none" 
                                       scale={1.2} 
                                   />
                               </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center md:items-start text-white w-full md:w-[60%] border-none drop-shadow-md">
                                <div className="flex items-center gap-3 mb-1 border-none">
                                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight border-none">{displayName}</h1>
                                    {profile.is_premium && <Crown className="w-6 h-6 text-amber-400 fill-amber-400 border-none drop-shadow-md" />}
                                    {profile.is_admin && <Shield className="w-6 h-6 text-emerald-400 fill-emerald-400 border-none drop-shadow-md" />}
                                </div>
                                
                                <div className="flex items-center gap-2 text-blue-100 dark:text-blue-200 text-sm font-medium mb-3 border-none">
                                    <span className="truncate max-w-[200px] sm:max-w-md border-none">{session?.user?.email}</span>
                                </div>
                                
                                <p className="text-sm text-blue-50 dark:text-blue-100 font-medium mb-6 sm:mb-8 text-center md:text-left border-none">
                                    Keep watching, keep enjoying.
                                </p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 sm:gap-12 border-none">
                                   <div className="flex items-center gap-3.5 border-none">
                                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-none">
                                         <Star className="w-6 h-6 text-amber-950 fill-current border-none"/>
                                      </div>
                                      <div className="flex flex-col border-none">
                                         <span className="text-xl sm:text-2xl font-black leading-none tracking-tight border-none">{currentPoints.toLocaleString()}</span>
                                         <span className="text-xs text-blue-100 font-bold mt-1 border-none">Pts</span>
                                      </div>
                                   </div>
                                   
                                   <div className="w-px h-10 bg-white/20 hidden sm:block border-none"></div>

                                   <div className="flex items-center gap-3.5 border-none">
                                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border-none">
                                         <ThumbsUp className="w-6 h-6 text-white fill-current border-none"/>
                                      </div>
                                      <div className="flex flex-col border-none">
                                         <span className="text-xl sm:text-2xl font-black leading-none tracking-tight border-none">{totalLikes.toLocaleString()}</span>
                                         <span className="text-xs text-blue-100 font-bold mt-1 border-none">Likes (Video)</span>
                                      </div>
                                   </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. WARDROBE SECTION */}
                        <div className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-none">
                            <div 
                                role="button"
                                tabIndex={0}
                                className="bg-[#106EBE] hover:bg-[#0e5c9f] transition-colors px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none cursor-pointer select-none" 
                                onClick={() => toggleSection('wardrobe')}
                            >
                                <div className="flex items-center gap-4 border-none pointer-events-none">
                                    <Shirt className="w-7 h-7 text-white shrink-0 border-none" strokeWidth={2.5}/>
                                    <div className="border-none">
                                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight border-none">Wardrobe</h2>
                                        <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5 border-none">Kumpulkan Point untuk membuka border avatar eksklusif.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto border-none pointer-events-none">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border-none shadow-inner text-white">
                                        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shrink-0 border-none">
                                            <Star className="w-2.5 h-2.5 text-amber-950 fill-current border-none"/>
                                        </div>
                                        <div className="flex flex-col border-none">
                                            <span className="text-[11px] font-black leading-none border-none">{currentPoints.toLocaleString()} Pts</span>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 border-none ${openSections.wardrobe ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {openSections.wardrobe && (
                                <div className="p-5 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300 border-none bg-slate-50/50 dark:bg-transparent">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5 border-none">
                                        {FRAME_OPTIONS.map((frame) => {
                                            const isLocked = currentPoints < frame.unlockPoints;
                                            const isEquipped = editFrame === frame.id;

                                            return (
                                                <div
                                                    key={frame.id}
                                                    onClick={() => { if (!isLocked) { setEditFrame(frame.id); handleUpdateProfile(); } }}
                                                    className={`relative rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all cursor-pointer border-none shadow-sm dark:shadow-none ${isEquipped
                                                        ? 'bg-[#106EBE] text-white ring-4 ring-[#106EBE]/20 dark:ring-[#106EBE]/40'
                                                        : 'bg-white dark:bg-[#1E242D] hover:shadow-md dark:hover:bg-[#252C36]'
                                                    }`}
                                                >
                                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center mb-4 transition-opacity border-none ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                                                        <Avatar url={currentAvatarToDisplay} frameId={frame.id} containerClass="w-full h-full pointer-events-none border-none" scale={0.65} />
                                                    </div>

                                                    <span className={`text-[13px] font-bold truncate w-full mb-3 border-none ${isEquipped ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                        {frame.name}
                                                    </span>

                                                    {isEquipped ? (
                                                        <div className="w-full py-1.5 rounded-lg bg-white/20 text-white flex items-center justify-center gap-1.5 text-[11px] font-bold border-none shadow-inner">
                                                            <Check className="w-3.5 h-3.5 border-none stroke-[3]" /> Selected
                                                        </div>
                                                    ) : (
                                                        <div className={`w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold border-none ${isLocked ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' : 'bg-blue-50 dark:bg-blue-900/30 text-[#106EBE] dark:text-[#32ADFF]'}`}>
                                                            {isLocked ? <Lock className="w-3.5 h-3.5 border-none" /> : null}
                                                            <span className="border-none">{frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Pts`}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. COSTUME PROFILE SECTION */}
                        <div className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-none">
                            <div 
                                role="button"
                                tabIndex={0}
                                className="bg-[#106EBE] hover:bg-[#0e5c9f] transition-colors px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none cursor-pointer select-none" 
                                onClick={() => toggleSection('customize')}
                            >
                                <div className="flex items-center gap-4 border-none pointer-events-none">
                                    <Smile className="w-7 h-7 text-white shrink-0 border-none" strokeWidth={2.5}/>
                                    <div className="border-none">
                                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight border-none">Costume Profile</h2>
                                        <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5 border-none">Ubah latar belakang, model karakter, dan nama profil kamu.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto border-none">
                                    {hasUnsavedChanges && (
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateProfile(); }} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#106EBE] text-xs font-bold shadow-sm border-none cursor-pointer hover:bg-zinc-50 z-10">
                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin border-none" /> : <Save className="w-3.5 h-3.5 border-none" />}
                                            Simpan
                                        </button>
                                    )}
                                    <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 border-none pointer-events-none ${openSections.customize ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {openSections.customize && (
                                <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 animate-in fade-in slide-in-from-top-2 duration-300 border-none bg-slate-50/50 dark:bg-transparent pb-8">
                                    <div className="relative shrink-0 flex items-center justify-center border-none bg-white dark:bg-[#1E242D] p-6 rounded-[2rem] shadow-sm">
                                        <Avatar
                                            url={currentAvatarToDisplay}
                                            frameId={editFrame}
                                            containerClass="w-36 h-36 sm:w-48 sm:h-48 border-none"
                                            scale={1.3}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 w-full space-y-6 border-none">
                                        
                                        <div className="border-none">
                                            <label className="block text-[13px] font-bold text-[#106EBE] dark:text-[#32ADFF] mb-3 border-none">Model Karakter (Header)</label>
                                            <ModelHeader 
                                                currentModel={editHeaderBgUrl} 
                                                onSelectModel={setEditHeaderBgUrl} 
                                                isSaving={isSaving} 
                                            />
                                        </div>

                                        <div className="border-none">
                                            <label className="block text-[13px] font-bold text-[#106EBE] dark:text-[#32ADFF] mb-2 border-none">Nama Profil</label>
                                            <div className="flex items-center bg-white dark:bg-[#1E242D] border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 ring-[#106EBE]/20 transition-all border-none">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-transparent flex-1 text-zinc-900 dark:text-white font-semibold text-[14px] outline-none border-none placeholder-zinc-400"
                                                    placeholder="Masukkan nama keren kamu..."
                                                />
                                            </div>
                                        </div>

                                        <div className="border-none">
                                            <label className="block text-[13px] font-bold text-[#106EBE] dark:text-[#32ADFF] mb-2 border-none">Pilih Karakter Avatar</label>
                                            <CharacterSelector 
                                                currentAvatar={editAvatarUrl} 
                                                onSelectAvatar={handleSelectAvatar}
                                                isSaving={isSaving}
                                            />
                                        </div>
                                        
                                        <div className="w-full mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                            <div className="flex flex-wrap items-center justify-end gap-4 text-xs font-bold text-zinc-500 border-none">
                                                <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-red-500 transition-colors border-none cursor-pointer bg-transparent whitespace-nowrap">
                                                    <LogOut className="w-4 h-4 border-none"/> Logout
                                                </button>
                                                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 border-none hidden sm:block"></div>
                                                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors border-none cursor-pointer bg-transparent whitespace-nowrap">
                                                    <Trash2 className="w-4 h-4 border-none"/> Hapus Akun
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. ACTIVITY SECTION */}
                        <div className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-none">
                            <div 
                                role="button"
                                tabIndex={0}
                                className="bg-[#106EBE] hover:bg-[#0e5c9f] transition-colors px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none cursor-pointer select-none" 
                                onClick={() => toggleSection('activity')}
                            >
                                <div className="flex items-center gap-4 border-none pointer-events-none">
                                    <Clock className="w-7 h-7 text-white shrink-0 border-none" strokeWidth={2.5}/>
                                    <div className="border-none">
                                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight border-none">Activity</h2>
                                        <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5 border-none">Lihat riwayat aktivitas kamu di sini.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto border-none pointer-events-none">
                                    <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 border-none ${openSections.activity ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {openSections.activity && (
                                <div className="p-5 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300 border-none bg-slate-50/50 dark:bg-transparent flex flex-col gap-6">
                                    
                                    <div className="w-full flex flex-col sm:flex-row items-center bg-white dark:bg-[#1E242D] rounded-xl sm:rounded-full p-1.5 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
                                        <button onClick={() => setMediaTab('history')} className={`flex-1 w-full sm:w-auto py-2.5 px-4 rounded-lg sm:rounded-full text-[13px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${mediaTab === 'history' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent'}`}>
                                            <User className="w-4 h-4 border-none" /> User History
                                        </button>
                                        <button onClick={() => setMediaTab('likes')} className={`flex-1 w-full sm:w-auto py-2.5 px-4 rounded-lg sm:rounded-full text-[13px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${mediaTab === 'likes' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent'}`}>
                                            <ThumbsUp className="w-4 h-4 border-none" /> Like History
                                        </button>
                                        <button onClick={() => setMediaTab('saved')} className={`flex-1 w-full sm:w-auto py-2.5 px-4 rounded-lg sm:rounded-full text-[13px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${mediaTab === 'saved' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent'}`}>
                                            <Bookmark className="w-4 h-4 border-none" /> Saved History
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3 border-none">
                                        {activeMediaList.length > 0 ? (
                                            activeMediaList.map((vid) => (
                                                <a key={vid.id} href={`/streaming/${vid.slug || vid.id}`} className="group flex items-center gap-4 bg-white dark:bg-[#1E242D] p-3 rounded-2xl hover:shadow-md transition-all border border-zinc-100 dark:border-zinc-800/50 cursor-pointer outline-none">
                                                    <div className="w-[100px] sm:w-[140px] aspect-video rounded-xl overflow-hidden shrink-0 relative border-none bg-zinc-200 dark:bg-zinc-800">
                                                        <img src={getImageUrl(vid.img)} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 border-none" loading="lazy" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center border-none">
                                                            <Play className="w-6 h-6 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md border-none" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 border-none">
                                                        <h3 className="text-[13px] sm:text-[14px] font-bold text-zinc-900 dark:text-white truncate mb-1 border-none group-hover:text-[#106EBE] transition-colors">{vid.title}</h3>
                                                        <p className="text-[11px] sm:text-[12px] text-zinc-500 dark:text-zinc-400 font-medium border-none truncate">Diperbarui {timeAgo(vid.created_at)}</p>
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-2 text-zinc-400 dark:text-zinc-500 shrink-0 border-none">
                                                        <Eye className="w-4 h-4 border-none"/>
                                                        <span className="text-[12px] font-medium border-none">{timeAgo(vid.created_at)}</span>
                                                        <ChevronRight className="w-4 h-4 ml-2 border-none" />
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="py-10 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500 border-none">
                                                <Eye className="w-8 h-8 opacity-40 mb-2 border-none" />
                                                <p className="text-[13px] font-bold border-none">Tidak ada riwayat aktivitas ditemukan.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <OutstreamAd />

            </main>

            <Footer />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 border-none">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 transition-colors border-none">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-600 border-none">
                            <AlertTriangle className="w-7 h-7 border-none" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2 border-none">Hapus Akun Permanen?</h3>
                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed border-none">
                            Semua data profil, poin, bingkai avatar, dan riwayat tontonan akan dihapus secara permanen.
                        </p>
                        <div className="flex w-full gap-3 border-none">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 py-3 rounded-2xl font-bold text-[13px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer border-none">
                                Batal
                            </button>
                            <button onClick={executeDeleteAccount} disabled={isDeleting} className="flex-1 py-3 rounded-2xl font-bold text-[13px] bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md border-none">
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