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
    Calendar,
    Info,
    MessageSquare,
    Video
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

    // Refs untuk Auto-Scroll
    const wardrobeRef = useRef(null);
    const customizeRef = useRef(null);
    const activityRef = useRef(null);
    const adminPanelRef = useRef(null);

    const [openSections, setOpenSections] = useState({
        wardrobe: false,
        customize: false, 
        activity: false,
        adminPanel: false,
    });

    const toggleSection = (sectionKey, ref) => {
        setOpenSections((prev) => {
            const isOpening = !prev[sectionKey];
            
            if (isOpening && ref?.current) {
                setTimeout(() => {
                    const yOffset = -100;
                    const y = ref.current.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }, 250);
            }

            return {
                ...prev,
                [sectionKey]: isOpening,
            };
        });
    };

    const [editName, setEditName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [editHeaderBgUrl, setEditHeaderBgUrl] = useState(DEFAULT_HEADER_MODEL);
    const [editFrame, setEditFrame] = useState('none');

    const [mediaTab, setMediaTab] = useState('history');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [totalLikes, setTotalLikes] = useState(0);
    const [totalSaved, setTotalSaved] = useState(0);
    const [likedVideos, setLikedVideos] = useState([]);
    const [historyVideos, setHistoryVideos] = useState([]);
    const [savedVideos, setSavedVideos] = useState([]);
    
    // State Riwayat Komentar User & Komentar Admin
    const [myComments, setMyComments] = useState([]);
    const [adminComments, setAdminComments] = useState([]);
    const [adminCommentFilter, setAdminCommentFilter] = useState('');

    const fetchActivityData = useCallback(async (currentSession, currentProfileData = null) => {
        if (!supabase) return;
        try {
            let currentUserProfile = currentProfileData;
            if (currentSession?.user && !currentUserProfile) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentSession.user.id)
                    .maybeSingle();

                if (profileData) {
                    currentUserProfile = profileData;
                    setProfile((prev) =>
                        prev ? { ...prev, points: profileData.points, active_frame: profileData.active_frame, is_admin: profileData.is_admin, name: profileData.name } : profileData
                    );
                }
            }

            const localDevId = localStorage.getItem('shadowclips_device_id');
            const userId = currentSession?.user?.id;
            const userEmail = currentSession?.user?.email;
            const userName = currentUserProfile?.name || editName;

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

            // FETCH SAVED VIDEOS (BOOKMARKS)
            if (userId) {
                const { count: savedCount } = await supabase
                    .from('user_bookmarks')
                    .select('video_id', { count: 'exact', head: true })
                    .eq('user_id', userId);

                setTotalSaved(savedCount || 0);

                const { data: savedData, error: savedError } = await supabase
                    .from('user_bookmarks')
                    .select('video_id')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (!savedError && savedData && savedData.length > 0) {
                    const savedVideoIds = [...new Set(savedData.map((s) => s.video_id))];
                    const { data: savedVids, error: savedVidsError } = await supabase
                        .from('videos')
                        .select('id, title, slug, img, created_at')
                        .in('id', savedVideoIds);

                    if (!savedVidsError && savedVids) {
                        const resolvedSaved = savedVideoIds
                            .map((id) => savedVids.find((v) => String(v.id) === String(id)))
                            .filter(Boolean);
                        setSavedVideos(resolvedSaved);
                    }
                } else {
                    setSavedVideos([]);
                }
            } else {
                setTotalSaved(0);
                setSavedVideos([]);
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

            // FETCH KOMENTAR (Komentar user sendiri & Komentar admin)
            if (userEmail || userName) {
                let commentsQuery = supabase
                    .from('comments')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(40);

                let orConditions = [];
                if (userEmail) orConditions.push(`email.eq.${userEmail}`);
                if (userName) orConditions.push(`name.eq.${userName}`);

                if (orConditions.length > 0) {
                    commentsQuery = commentsQuery.or(orConditions.join(','));
                }

                const { data: commentsData, error: commentsError } = await commentsQuery;
                if (!commentsError && commentsData) {
                    const videoIds = [...new Set(commentsData.map(c => c.video_id).filter(Boolean))];
                    let videoMap = {};
                    if (videoIds.length > 0) {
                        const { data: vData } = await supabase.from('videos').select('id, title, slug, img').in('id', videoIds);
                        if (vData) {
                            videoMap = vData.reduce((acc, v) => ({ ...acc, [String(v.id)]: v }), {});
                        }
                    }
                    const enrichedComments = commentsData.map(c => ({
                        ...c,
                        videos: videoMap[String(c.video_id)] || null
                    }));
                    setMyComments(enrichedComments);
                } else {
                    setMyComments([]);
                }

                // JIKA USER ADALAH ADMIN, FETCH SEMUA KOMENTAR UNTUK PANEL ADMIN
                if (currentUserProfile?.is_admin) {
                    const { data: allCommData, error: allCommError } = await supabase
                        .from('comments')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(50);
                    
                    if (!allCommError && allCommData) {
                        const adminVideoIds = [...new Set(allCommData.map(c => c.video_id).filter(Boolean))];
                        let adminVideoMap = {};
                        if (adminVideoIds.length > 0) {
                            const { data: avData } = await supabase.from('videos').select('id, title, slug, img').in('id', adminVideoIds);
                            if (avData) {
                                adminVideoMap = avData.reduce((acc, v) => ({ ...acc, [String(v.id)]: v }), {});
                            }
                        }
                        const enrichedAdminComments = allCommData.map(c => ({
                            ...c,
                            videos: adminVideoMap[String(c.video_id)] || null
                        }));
                        setAdminComments(enrichedAdminComments);
                    } else {
                        setAdminComments([]);
                    }
                }
            } else {
                setMyComments([]);
                setAdminComments([]);
            }

        } catch (error) {
            console.warn('Activity fetch error:', error);
        }
    }, [supabase, editName]);

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

                        await fetchActivityData(currentSession, profileData);
                    } else {
                        setProfile(null);
                        await fetchActivityData(currentSession, null);
                    }
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
            if (activeSession) fetchActivityData(activeSession, profile);
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
            fetchActivityData(session, { ...profile, name: editName });
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

    // Fungsi menghapus komentar (HANYA DIEKSEKUSI OLEH ADMIN DARI ADMIN PANEL)
    const handleDeleteComment = async (commentId) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            
            // Hapus dari state agar hilang langsung dari UI
            setMyComments(prev => prev.filter(c => c.id !== commentId));
            setAdminComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Komentar berhasil dihapus.');
        } catch (err) {
            console.error(err);
            toast.error('Gagal menghapus komentar.');
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
        if (diffInSeconds < 84600) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return `${Math.floor(diffInSeconds / 84600)} hari yang lalu`;
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
    
    const hasWardrobeChanges = editFrame !== (profile.active_frame || 'none');
    
    const hasCostumeChanges =
        editName !== (profile.name || '') ||
        editAvatarUrl !== (profile.avatar_url || googleAvatar || '') ||
        editHeaderBgUrl !== (profile.header_bg_url || DEFAULT_HEADER_MODEL);

    let activeMediaList = [];
    if (mediaTab === 'history') activeMediaList = historyVideos;
    else if (mediaTab === 'likes') activeMediaList = likedVideos;
    else if (mediaTab === 'saved') activeMediaList = savedVideos;
    else if (mediaTab === 'comments') activeMediaList = myComments;

    const activeFrameName = FRAME_OPTIONS.find((f) => f.id === profile.active_frame)?.name || 'Tanpa Frame';
    const activeModelName = MODEL_PRESETS.find((m) => m.url === profile.header_bg_url)?.name || 'Tanpa Model';
    
    const joinDate = session?.user?.created_at 
        ? new Date(session.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : '-';

    const headerGradientClass = "bg-gradient-to-r from-[#0f4b81] to-[#106EBE] dark:from-[#0a2e54] dark:to-[#094880]";

    const filteredAdminComments = adminComments.filter(c => {
        if (!adminCommentFilter) return true;
        const q = adminCommentFilter.toLowerCase();
        return (
            (c.content && c.content.toLowerCase().includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            (c.videos?.title && c.videos.title.toLowerCase().includes(q))
        );
    });

    return (
        <div className="min-h-screen flex flex-col bg-[#F0F4F8] dark:bg-[#0E1116] text-zinc-900 dark:text-zinc-200 font-sans antialiased transition-colors duration-200">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar isScrolled={true} supabase={supabase} />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-none">

                    {/* --- KANAN / UTAMA --- */}
                    <div className="order-1 lg:order-2 lg:col-span-9 flex flex-col gap-6 border-none">
                        
                        {/* HEADER */}
                        <div className={`relative w-full h-auto min-h-[180px] sm:min-h-[250px] rounded-[24px] sm:rounded-[32px] ${headerGradientClass} p-4 sm:p-10 grid grid-cols-2 md:flex md:flex-row items-center md:items-center gap-3 sm:gap-10 shadow-[0_8px_30px_rgba(16,110,190,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border-none mt-6 sm:mt-10 overflow-hidden sm:overflow-visible`}>
                            
                            {editHeaderBgUrl && editHeaderBgUrl !== 'none' && (
                                <div className="hidden sm:flex absolute bottom-0 right-0 sm:right-6 md:right-12 w-[65%] sm:w-[50%] lg:w-[45%] h-[125%] sm:h-[145%] pointer-events-none z-0 border-none justify-end items-end">
                                    <img 
                                        src={editHeaderBgUrl} 
                                        className="w-auto h-full max-w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] border-none" 
                                        alt="header model" 
                                    />
                                </div>
                            )}
                            
                            <div className="relative z-10 shrink-0 flex items-center justify-center border-none">
                               <div className="relative rounded-full bg-white/10 p-1.5 sm:p-2 backdrop-blur-sm border-none shadow-2xl">
                                   <Avatar
                                       url={currentAvatarToDisplay}
                                       frameId={editFrame}
                                       containerClass="w-24 h-24 sm:w-36 sm:h-36 md:w-40 md:h-40 border-none" 
                                       scale={1.2} 
                                   />
                               </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-start text-white w-full md:w-[60%] border-none drop-shadow-md">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1 border-none">
                                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight border-none truncate max-w-[150px] sm:max-w-none">{displayName}</h1>
                                    {profile.is_premium && <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 fill-amber-400 border-none drop-shadow-md shrink-0" />}
                                    {profile.is_admin && <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 fill-emerald-400 border-none drop-shadow-md shrink-0" />}
                                </div>
                                
                                <div className="flex items-center gap-2 text-blue-100 dark:text-blue-200 text-xs sm:text-sm font-medium mb-1.5 sm:mb-3 border-none w-full">
                                    <span className="truncate max-w-[140px] sm:max-w-md border-none">{session?.user?.email}</span>
                                </div>
                                
                                <p className="text-xs sm:text-sm text-blue-50 dark:text-blue-100 font-medium mb-3 sm:mb-8 text-left border-none hidden sm:block">
                                    Keep watching, keep enjoying.
                                </p>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-2.5 sm:gap-8 md:gap-12 border-none">
                                   <div className="flex items-center gap-2 sm:gap-3.5 border-none">
                                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-none shrink-0">
                                         <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-950 fill-current border-none"/>
                                      </div>
                                      <div className="flex flex-col border-none">
                                         <span className="text-base sm:text-2xl font-black leading-none tracking-tight border-none">{currentPoints.toLocaleString()}</span>
                                         <span className="text-[10px] sm:text-xs text-blue-100 font-bold mt-0.5 sm:mt-1 border-none">Pts</span>
                                      </div>
                                   </div>
                                   
                                   <div className="w-px h-10 bg-white/20 hidden sm:block border-none"></div>

                                   <div className="flex items-center gap-2 sm:gap-3.5 border-none">
                                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border-none shrink-0">
                                         <ThumbsUp className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-current border-none"/>
                                      </div>
                                      <div className="flex flex-col border-none">
                                         <span className="text-base sm:text-2xl font-black leading-none tracking-tight border-none">{totalLikes.toLocaleString()}</span>
                                         <span className="text-[10px] sm:text-xs text-blue-100 font-bold mt-0.5 sm:mt-1 border-none">Likes</span>
                                      </div>
                                   </div>
                                </div>
                            </div>
                        </div>

                        {/* --- PANEL ADMIN KOMENTAR (HANYA TAMPIL JIKA ADMIN) --- */}
                        {profile.is_admin && (
                            <div ref={adminPanelRef} className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-2 border-emerald-500/30">
                                <div 
                                    role="button"
                                    tabIndex={0}
                                    className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:brightness-110 transition-all px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none" 
                                    onClick={() => toggleSection('adminPanel', adminPanelRef)}
                                >
                                    <div className="flex items-center gap-4 pointer-events-none">
                                        <Shield className="w-7 h-7 text-white shrink-0" strokeWidth={2.5}/>
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Admin Panel: Moderasi Komentar</h2>
                                            <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-0.5">Atur dan pantau jalurnya komentar dari berbagai halaman video.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-auto pointer-events-none">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors">
                                            <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openSections.adminPanel ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${openSections.adminPanel ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-transparent flex flex-col gap-4">
                                            
                                            <div className="flex items-center bg-white dark:bg-[#1E242D] border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-4 py-2.5 shadow-sm">
                                                <input 
                                                    type="text" 
                                                    value={adminCommentFilter} 
                                                    onChange={(e) => setAdminCommentFilter(e.target.value)} 
                                                    placeholder="Cari komentar berdasarkan isi, email, atau judul video..." 
                                                    className="bg-transparent flex-1 text-zinc-900 dark:text-white text-xs sm:text-sm outline-none border-none placeholder-zinc-400"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                                                {filteredAdminComments.length > 0 ? (
                                                    filteredAdminComments.map((comm) => (
                                                        <div key={comm.id} className="bg-white dark:bg-[#1E242D] p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                            
                                                            {comm.videos && (
                                                                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-[#161B22] border border-zinc-100 dark:border-zinc-800/60">
                                                                    {comm.videos.img ? (
                                                                        <img 
                                                                            src={getImageUrl(comm.videos.img)} 
                                                                            alt={comm.videos.title} 
                                                                            className="w-12 h-12 rounded-lg object-cover shrink-0" 
                                                                        />
                                                                    ) : (
                                                                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[#106EBE] shrink-0">
                                                                            <Video className="w-5 h-5" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="text-[10px] font-bold text-[#106EBE] uppercase tracking-wider block">Video Terkait</span>
                                                                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{comm.videos.title}</h4>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex-1 min-w-0 px-1">
                                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{comm.email || comm.name || 'Anonymous'}</span>
                                                                    <span className="text-[10px] text-zinc-400 shrink-0">{timeAgo(comm.created_at)}</span>
                                                                </div>
                                                                <p className="text-xs sm:text-sm text-zinc-900 dark:text-white font-medium break-words bg-zinc-50/50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                                                                    "{comm.content}"
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                                                                <button 
                                                                    onClick={() => handleDeleteComment(comm.id)} 
                                                                    className="px-3.5 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                                                                    title="Hapus Komentar ini"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus Komentar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-12 text-center text-zinc-400 text-xs font-medium bg-white dark:bg-[#1E242D] rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                        Tidak ada komentar yang ditemukan atau cocok dengan filter.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WARDROBE SECTION */}
                        <div ref={wardrobeRef} className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div 
                                role="button"
                                tabIndex={0}
                                className={`${headerGradientClass} hover:brightness-110 transition-all px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none`} 
                                onClick={() => toggleSection('wardrobe', wardrobeRef)}
                            >
                                <div className="flex items-center gap-4 pointer-events-none">
                                    <Shirt className="w-7 h-7 text-white shrink-0" strokeWidth={2.5}/>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Wardrobe</h2>
                                        <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">Kumpulkan Point untuk membuka border avatar eksklusif.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    {hasWardrobeChanges && (
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateProfile(); }} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#106EBE] text-xs font-bold shadow-sm cursor-pointer hover:bg-zinc-50 z-10">
                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                            Simpan
                                        </button>
                                    )}
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors pointer-events-none">
                                        <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openSections.wardrobe ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${openSections.wardrobe ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-transparent">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
                                            {FRAME_OPTIONS.map((frame) => {
                                                const isLocked = currentPoints < frame.unlockPoints;
                                                const isEquipped = editFrame === frame.id;

                                                return (
                                                    <div
                                                        key={frame.id}
                                                        onClick={() => { if (!isLocked) { setEditFrame(frame.id); } }}
                                                        className={`relative rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center transition-all cursor-pointer shadow-sm dark:shadow-none ${isEquipped
                                                            ? 'bg-[#106EBE] text-white ring-4 ring-[#106EBE]/20 dark:ring-[#106EBE]/40'
                                                            : 'bg-white dark:bg-[#1E242D] hover:shadow-md dark:hover:bg-[#252C36]'
                                                        }`}
                                                    >
                                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center mb-4 transition-opacity ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                                                            <Avatar url={currentAvatarToDisplay} frameId={frame.id} containerClass="w-full h-full pointer-events-none" scale={0.65} />
                                                        </div>

                                                        <span className={`text-[13px] font-bold truncate w-full mb-3 ${isEquipped ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                            {frame.name}
                                                        </span>

                                                        {isEquipped ? (
                                                            <div className="w-full py-1.5 rounded-lg bg-white/20 text-white flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-inner">
                                                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                                                            </div>
                                                        ) : (
                                                            <div className={`w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-bold ${isLocked ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' : 'bg-blue-50 dark:bg-blue-900/30 text-[#106EBE] dark:text-[#32ADFF]'}`}>
                                                                {isLocked ? <Lock className="w-3.5 h-3.5" /> : null}
                                                                <span>{frame.unlockPoints === 0 ? 'Free' : `${frame.unlockPoints.toLocaleString()} Pts`}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COSTUME PROFILE SECTION */}
                        <div ref={customizeRef} className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div 
                                role="button"
                                tabIndex={0}
                                className={`${headerGradientClass} hover:brightness-110 transition-all px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none`} 
                                onClick={() => toggleSection('customize', customizeRef)}
                            >
                                <div className="flex items-center gap-4 pointer-events-none">
                                    <Smile className="w-7 h-7 text-white shrink-0" strokeWidth={2.5}/>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Costume Profile</h2>
                                        <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">Ubah latar belakang, model karakter, dan nama profil kamu.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    {hasCostumeChanges && (
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateProfile(); }} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#106EBE] text-xs font-bold shadow-sm cursor-pointer hover:bg-zinc-50 z-10">
                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                            Simpan
                                        </button>
                                    )}
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors pointer-events-none">
                                        <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openSections.customize ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${openSections.customize ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 bg-slate-50/50 dark:bg-transparent pb-8">
                                        <div className="relative shrink-0 flex items-center justify-center bg-white dark:bg-[#1E242D] p-6 rounded-[2rem] shadow-sm">
                                            <Avatar
                                                url={currentAvatarToDisplay}
                                                frameId={editFrame}
                                                containerClass="w-36 h-36 sm:w-48 sm:h-48"
                                                scale={1.3}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 w-full space-y-6">
                                            
                                            <div>
                                                <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                                                    <label className="block text-[13px] font-bold text-[#106EBE] dark:text-[#32ADFF]">Model Karakter (Header)</label>
                                                </div>
                                                <ModelHeader 
                                                    currentModel={editHeaderBgUrl} 
                                                    onSelectModel={setEditHeaderBgUrl} 
                                                    isSaving={isSaving} 
                                                />
                                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1.5">
                                                    <Info className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Catatan: Model header hanya ditampilkan pada versi desktop/web (tidak tampil di mobile).</span>
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-[13px] font-bold text-[#106EBE] dark:text-[#32ADFF] mb-2">Nama Profil</label>
                                                <div className="flex items-center bg-white dark:bg-[#1E242D] border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 ring-[#106EBE]/20 transition-all">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="bg-transparent flex-1 text-zinc-900 dark:text-white font-semibold text-[14px] outline-none border-none placeholder-zinc-400"
                                                        placeholder="Masukkan nama keren kamu..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[13px] font-bold text-[#106EBE] dark:text-[#32ADFF] mb-2">Pilih Karakter Avatar</label>
                                                <CharacterSelector 
                                                    currentAvatar={editAvatarUrl} 
                                                    onSelectAvatar={handleSelectAvatar}
                                                    isSaving={isSaving}
                                                />
                                            </div>
                                            
                                            <div className="w-full mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                                <div className="flex flex-wrap items-center justify-end gap-4 text-xs font-bold text-zinc-500">
                                                    <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer bg-transparent whitespace-nowrap">
                                                        <LogOut className="w-4 h-4"/> Logout
                                                    </button>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>
                                                    <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer bg-transparent whitespace-nowrap">
                                                        <Trash2 className="w-4 h-4"/> Hapus Akun
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTIVITY SECTION */}
                        <div ref={activityRef} className="w-full bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                            <div 
                                role="button"
                                tabIndex={0}
                                className={`${headerGradientClass} hover:brightness-110 transition-all px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none`} 
                                onClick={() => toggleSection('activity', activityRef)}
                            >
                                <div className="flex items-center gap-4 pointer-events-none">
                                    <Clock className="w-7 h-7 text-white shrink-0" strokeWidth={2.5}/>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Activity</h2>
                                        <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">Lihat riwayat aktivitas dan komentar kamu di sini.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto pointer-events-none">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors">
                                        <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openSections.activity ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${openSections.activity ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-5 sm:p-8 bg-slate-50/50 dark:bg-transparent flex flex-col gap-6">
                                        
                                        {/* Tab Navigasi Aktivitas */}
                                        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 bg-white dark:bg-[#1E242D] rounded-xl p-1.5 shadow-sm border border-zinc-100 dark:border-zinc-800/50">
                                            <button onClick={() => setMediaTab('history')} className={`py-2 px-3 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mediaTab === 'history' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 bg-transparent'}`}>
                                                <User className="w-3.5 h-3.5" /> History
                                            </button>
                                            <button onClick={() => setMediaTab('likes')} className={`py-2 px-3 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mediaTab === 'likes' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 bg-transparent'}`}>
                                                <ThumbsUp className="w-3.5 h-3.5" /> Likes
                                            </button>
                                            <button onClick={() => setMediaTab('saved')} className={`py-2 px-3 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mediaTab === 'saved' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 bg-transparent'}`}>
                                                <Bookmark className="w-3.5 h-3.5" /> Saved
                                            </button>
                                            <button onClick={() => setMediaTab('comments')} className={`py-2 px-3 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mediaTab === 'comments' ? 'bg-[#106EBE] text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 bg-transparent'}`}>
                                                <MessageSquare className="w-3.5 h-3.5" /> Komentar
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {mediaTab === 'comments' ? (
                                                activeMediaList.length > 0 ? (
                                                    activeMediaList.map((comm) => (
                                                        <div key={comm.id} className="group flex flex-col sm:flex-row items-start gap-4 bg-white dark:bg-[#1E242D] p-3 sm:p-4 rounded-2xl hover:shadow-md transition-all border border-zinc-100 dark:border-zinc-800/50">
                                                            
                                                            {/* Thumbnail Video */}
                                                            <a href={`/streaming/${comm.videos?.slug || comm.video_id}`} className="w-[100px] sm:w-[140px] aspect-video rounded-xl overflow-hidden shrink-0 relative bg-zinc-200 dark:bg-zinc-800 block cursor-pointer">
                                                                {comm.videos?.img ? (
                                                                    <img src={getImageUrl(comm.videos.img)} alt={comm.videos?.title || 'Video'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-[#106EBE]">
                                                                        <Video className="w-6 h-6 opacity-50" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <Play className="w-6 h-6 text-white fill-white drop-shadow-md" />
                                                                </div>
                                                            </a>

                                                            {/* Info & Bubble Komentar (Tanpa Tombol Hapus) */}
                                                            <div className="flex-1 min-w-0 w-full flex flex-col h-full gap-2">
                                                                <div>
                                                                    <a href={`/streaming/${comm.videos?.slug || comm.video_id}`} className="block">
                                                                        <h3 className="text-[13px] sm:text-[14px] font-bold text-zinc-900 dark:text-white truncate mb-2 hover:text-[#106EBE] transition-colors">
                                                                            {comm.videos?.title || `Menunggu Judul (ID: ${comm.video_id})`}
                                                                        </h3>
                                                                    </a>
                                                                    
                                                                    <div className="relative bg-zinc-50 dark:bg-[#161B22] p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50">
                                                                        <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-zinc-400" />
                                                                        <p className="pl-7 text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 font-medium break-words italic">
                                                                            "{comm.content}"
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between mt-1">
                                                                    <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" /> {timeAgo(comm.created_at)}
                                                                    </span>
                                                                    
                                                                    {/* Tombol Hapus telah ditiadakan dari sini agar user tidak bisa menghapus komentar miliknya sendiri */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-10 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500">
                                                        <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
                                                        <p className="text-[13px] font-bold">Belum ada riwayat komentar yang dikirimkan.</p>
                                                    </div>
                                                )
                                            ) : (
                                                activeMediaList.length > 0 ? (
                                                    activeMediaList.map((vid) => (
                                                        <a key={vid.id} href={`/streaming/${vid.slug || vid.id}`} className="group flex items-center gap-4 bg-white dark:bg-[#1E242D] p-3 rounded-2xl hover:shadow-md transition-all border border-zinc-100 dark:border-zinc-800/50 cursor-pointer outline-none">
                                                            <div className="w-[100px] sm:w-[140px] aspect-video rounded-xl overflow-hidden shrink-0 relative bg-zinc-200 dark:bg-zinc-800">
                                                                <img src={getImageUrl(vid.img)} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                                    <Play className="w-6 h-6 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-[13px] sm:text-[14px] font-bold text-zinc-900 dark:text-white truncate mb-1 group-hover:text-[#106EBE] transition-colors">{vid.title}</h3>
                                                                <p className="text-[11px] sm:text-[12px] text-zinc-500 dark:text-zinc-400 font-medium truncate">Diperbarui {timeAgo(vid.created_at)}</p>
                                                            </div>
                                                            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 shrink-0">
                                                                <Eye className="w-4 h-4"/>
                                                                <span className="text-[12px] font-medium">{timeAgo(vid.created_at)}</span>
                                                            </div>
                                                        </a>
                                                    ))
                                                ) : (
                                                    <div className="py-10 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500">
                                                        <Eye className="w-8 h-8 opacity-40 mb-2" />
                                                        <p className="text-[13px] font-bold">Tidak ada riwayat aktivitas ditemukan.</p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- SIDEBAR STATISTIK USER --- */}
                    <aside className="order-2 lg:order-1 block lg:col-span-3 mt-2 sm:mt-10 z-10 transition-all duration-300">
                        <div className="lg:sticky lg:top-28 flex flex-col z-10 transition-all duration-300">
                            <div className="w-full flex flex-col bg-white dark:bg-[#161B22] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] pb-2">
                                <div className={`${headerGradientClass} px-5 py-4 flex items-center gap-3 shrink-0`}>
                                    <BarChart2 className="w-6 h-6 text-white shrink-0" strokeWidth={2.5}/>
                                    <div>
                                        <h2 className="text-base font-black text-white leading-tight">Statistik User</h2>
                                        <p className="text-[10px] text-blue-100 font-medium mt-0.5">Ringkasan data profil kamu.</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-6 p-5">
                                    
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status Akun</span>
                                        <div className="flex flex-wrap items-center gap-4">
                                            {profile.is_premium ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                                    <Crown className="w-4 h-4 fill-current" /> <span className="text-xs font-bold">Premium VIP</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                                                    <User className="w-4 h-4 fill-current" /> <span className="text-xs font-bold">Global Member</span>
                                                </div>
                                            )}
                                            {profile.is_admin && (
                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                    <Shield className="w-4 h-4 fill-current" /> <span className="text-xs font-bold">Admin</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3.5">
                                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Informasi Dasar</span>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                <Calendar className="w-4 h-4 text-[#106EBE]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-500">Bergabung Sejak</span>
                                                <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{joinDate}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                <Shirt className="w-4 h-4 text-[#106EBE]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-500">Wardrobe Aktif</span>
                                                <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{activeFrameName}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                <Smile className="w-4 h-4 text-[#106EBE]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-500">Model Karakter</span>
                                                <span className="text-[13px] font-bold text-zinc-900 dark:text-white">{activeModelName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-2">
                                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Aktivitas Interaksi</span>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-zinc-50 dark:bg-[#1E242D] p-3 rounded-xl flex flex-col items-center justify-center text-center">
                                                <ThumbsUp className="w-5 h-5 text-[#106EBE] mb-1.5" />
                                                <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">{totalLikes}</span>
                                                <span className="text-[10px] font-medium text-zinc-500 mt-1">Video Disukai</span>
                                            </div>
                                            <div className="bg-zinc-50 dark:bg-[#1E242D] p-3 rounded-xl flex flex-col items-center justify-center text-center">
                                                <Bookmark className="w-5 h-5 text-[#106EBE] mb-1.5" />
                                                <span className="text-lg font-black text-zinc-900 dark:text-white leading-none">{totalSaved}</span>
                                                <span className="text-[10px] font-medium text-zinc-500 mt-1">Disimpan</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </aside>

                </div>

                <OutstreamAd />

            </main>

            <Footer />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 transition-colors">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">Hapus Akun Permanen?</h3>
                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            Semua data profil, poin, bingkai avatar, dan riwayat tontonan akan dihapus secara permanen.
                        </p>
                        <div className="flex w-full gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 py-3 rounded-2xl font-bold text-[13px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer">
                                Batal
                            </button>
                            <button onClick={executeDeleteAccount} disabled={isDeleting} className="flex-1 py-3 rounded-2xl font-bold text-[13px] bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md">
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}