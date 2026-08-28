import React, { useState, useEffect, useCallback } from 'react';
import { Play, Download, Clock, Share2, Heart, HardDrive, FolderArchive, Database, Server, X, ZoomIn, LayoutGrid, Loader2, ExternalLink, Lock, ChevronDown, Gift, Info, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomPlayer from '../components/CustomPlayer';
import Komentar from '../components/Komentar';
import SynopsisTooltip from '../components/SynopsisTooltip';
import IklanCustom from '../components/IklanCustom';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function Streaming({ supabase }) {
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const [deviceId, setDeviceId] = useState(() => {
        if (typeof window === 'undefined') return 'server';
        let id = localStorage.getItem('shadowclips_device_id');
        if (!id) {
            id = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now();
            localStorage.setItem('shadowclips_device_id', id);
        }
        return id;
    });

    const [activeServer, setActiveServer] = useState('main');
    const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState('waiting');
    const [modalProgress, setModalProgress] = useState(0);

    const [isVipUnlocked, setIsVipUnlocked] = useState(true);
    const [lockReason, setLockReason] = useState('none');
    const [hasCommented, setHasCommented] = useState(false);

    const [secureUrls, setSecureUrls] = useState({ main: '', alt: '', alt2: '', img: '' });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const checkVipAccess = useCallback(async (videoId, vidData, forceCommented = null, forceLiked = null) => {
        if (!supabase || !vidData) return;

        const categoryStr = String(vidData.category || '').toLowerCase().trim();
        const titleStr = String(vidData.title || '').toLowerCase().trim();
        const labelsStr = Array.isArray(vidData.labels) ? vidData.labels.join(' ').toLowerCase() : String(vidData.labels || '').toLowerCase();

        const isPaidContent = categoryStr.includes('payment') || labelsStr.includes('payment');
        const isExclusiveContent = (
            categoryStr.includes('exclusive') ||
            titleStr.includes('exclusive') ||
            labelsStr.includes('exclusive') ||
            labelsStr.includes('premium')
        ) && !isPaidContent;

        let isUserPremium = false;
        let userEmail = null;
        let activeDeviceId = deviceId;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                userEmail = session.user.email;
                activeDeviceId = session.user.id;
                setDeviceId(activeDeviceId);

                const { data: profileData } = await supabase.from('profiles').select('is_premium').eq('id', session.user.id).single();
                if (profileData?.is_premium) isUserPremium = true;
            }
        } catch (error) { console.error(error); }

        let isLiked = false;
        if (forceLiked !== null) {
            isLiked = forceLiked;
        } else {
            try {
                const { data: likeData } = await supabase.from('user_likes').select('id').eq('video_id', videoId).eq('device_id', activeDeviceId).maybeSingle();
                if (likeData) isLiked = true;
            } catch (error) { }
        }
        setHasLiked(isLiked);

        let isCommented = false;
        if (forceCommented !== null) {
            isCommented = forceCommented;
        } else if (userEmail) {
            try {
                const { data: commentData } = await supabase.from('comments').select('id').eq('video_id', String(videoId)).eq('email', userEmail).limit(1);
                if (commentData && commentData.length > 0) isCommented = true;
            } catch (error) { }
        }
        setHasCommented(isCommented);

        const uMain = vidData.trailer_url || '';
        const uAlt = vidData.alternative_server || '';
        const uAlt2 = vidData.alternative_server2 || '';
        const uImg = vidData.img || '';

        if (isPaidContent) {
            if (isUserPremium) {
                setIsVipUnlocked(true); setLockReason('none'); setSecureUrls({ main: uMain, alt: uAlt, alt2: uAlt2, img: uImg });
            } else {
                setIsVipUnlocked(false); setLockReason('payment'); setSecureUrls({ main: '', alt: '', alt2: '', img: uImg });
            }
        } else if (isExclusiveContent) {
            if (isUserPremium || (isLiked && isCommented)) {
                setIsVipUnlocked(true); setLockReason('none'); setSecureUrls({ main: uMain, alt: uAlt, alt2: uAlt2, img: uImg });
            } else {
                setIsVipUnlocked(false); setLockReason('exclusive'); setSecureUrls({ main: '', alt: '', alt2: '', img: uImg });
            }
        } else {
            setIsVipUnlocked(true); setLockReason('none'); setSecureUrls({ main: uMain, alt: uAlt, alt2: uAlt2, img: uImg });
        }

        try {
            const { data: currentVideo } = await supabase.from('videos').select('likes').eq('id', videoId).single();
            if (currentVideo) setLikes(currentVideo.likes || 0);
        } catch (e) { }

    }, [supabase, deviceId]);

    useEffect(() => {
        let isMounted = true;

        const fetchVideoDetails = async () => {
            if (!supabase) return;
            setLoading(true); setFetchError('');

            try {
                const pathParts = window.location.pathname.split('/');
                const slug = decodeURIComponent(pathParts[2] || '');
                if (!slug) { if (isMounted) setFetchError('URL tidak valid.'); return; }

                const processVideo = async (vidData) => {
                    if (!isMounted) return;
                    setVideo(vidData);
                    document.title = `${vidData.title || 'Video'} | ShadowClips`;

                    let hist = JSON.parse(localStorage.getItem('shadowclips_history') || '[]');
                    if (!hist.includes(vidData.id)) {
                        hist.unshift(vidData.id);
                        localStorage.setItem('shadowclips_history', JSON.stringify(hist.slice(0, 20)));
                    }

                    const addView = async () => { await supabase.rpc('increment_views', { vid_id: vidData.id }); };
                    addView();

                    await checkVipAccess(vidData.id, vidData);

                    const safeCategory = vidData.category || 'Uncategorized';
                    try {
                        const { data: relatedData } = await supabase.from('videos').select('*').eq('category', safeCategory).neq('id', vidData.id).limit(10).order('created_at', { ascending: false });
                        if (isMounted) setRelatedVideos(relatedData || []);
                    } catch (relError) { }
                };

                let query = supabase.from('videos').select('*').eq('slug', slug);
                const { data, error } = await query.single();

                if (!error && data) {
                    await processVideo(data);
                } else {
                    if (/^\d+$/.test(slug)) {
                        const { data: fallbackData } = await supabase.from('videos').select('*').eq('id', slug).single();
                        if (fallbackData) { await processVideo(fallbackData); return; }
                    }
                    if (isMounted) setFetchError('Video tidak ditemukan di database.');
                }
            } catch (err) { if (isMounted) setFetchError(`Sistem Gagal: ${err.message}`); }
            finally { if (isMounted) setLoading(false); }
        };
        fetchVideoDetails();
        return () => { isMounted = false; };
    }, [supabase, checkVipAccess]);

    useEffect(() => {
        if (selectedImage || isDownloadModalOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [selectedImage, isDownloadModalOpen]);

    useEffect(() => {
        let timer;
        if (isDownloadModalOpen && modalStatus === 'waiting') {
            let currentProgress = 0;
            timer = setInterval(() => {
                currentProgress += 1;
                setModalProgress(currentProgress);
                if (currentProgress >= 100) { clearInterval(timer); setModalStatus('ready'); }
            }, 40);
        }
        return () => clearInterval(timer);
    }, [isDownloadModalOpen, modalStatus]);

    const handleLike = async () => {
        if (!supabase || !video) return;
        const newHasLiked = !hasLiked;

        setHasLiked(newHasLiked);
        setLikes(prev => newHasLiked ? prev + 1 : Math.max(prev - 1, 0));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const exactDeviceId = session?.user ? session.user.id : deviceId;

            const { data: newTotalLikes } = await supabase.rpc('toggle_user_like', { p_video_id: video.id, p_device_id: exactDeviceId });
            if (newTotalLikes !== null) setLikes(newTotalLikes);

            if (session?.user?.email) {
                const pointToGive = newHasLiked ? 10 : -10;
                await supabase.rpc('increment_user_points', { p_email: session.user.email, p_points: pointToGive });
            }

            await checkVipAccess(video.id, video, hasCommented, newHasLiked);
        } catch (e) { console.error("Like Error:", e); }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) await navigator.share({ title: video?.title || 'ShadowClips', url: window.location.href });
            else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
        } catch (err) { }
    };

    if (loading) return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors border-none">
            <div className="w-14 h-14 border-4 border-zinc-200 dark:border-zinc-800 border-t-[#106EBE] dark:border-t-[#106EBE] rounded-full animate-spin mb-4 shadow-md"></div>
            <p className="text-zinc-500 font-bold animate-pulse border-none">Menyiapkan video...</p>
        </div>
    );

    if (fetchError || !video) return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors px-4 text-center border-none">
            <Navbar isScrolled={true} supabase={supabase} />
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm border-none mt-20">
                <Search className="w-10 h-10 text-zinc-400 border-none" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 border-none">Oops!</h2>
            <p className="text-zinc-500 font-medium mb-6 border-none max-w-lg">{fetchError}</p>
            <a href="/" className="px-6 py-3 bg-[#106EBE] text-white rounded-xl font-bold shadow-md hover:bg-[#0e5c9f] transition-colors outline-none border-none">Kembali ke Beranda</a>
        </div>
    );

    const hasMain = secureUrls.main && secureUrls.main !== 'EMPTY' && String(secureUrls.main).trim() !== '';
    const hasAlternativeServer = secureUrls.alt && secureUrls.alt !== 'EMPTY' && String(secureUrls.alt).trim() !== '';
    const hasAlternativeServer2 = secureUrls.alt2 && secureUrls.alt2 !== 'EMPTY' && String(secureUrls.alt2).trim() !== '';

    let effectiveServer = activeServer;
    if (effectiveServer === 'main' && !hasMain) {
        if (hasAlternativeServer2) effectiveServer = 'alt2'; else if (hasAlternativeServer) effectiveServer = 'alt';
    } else if (effectiveServer === 'alt' && !hasAlternativeServer) {
        if (hasAlternativeServer2) effectiveServer = 'alt2'; else if (hasMain) effectiveServer = 'main';
    } else if (effectiveServer === 'alt2' && !hasAlternativeServer2) {
        if (hasAlternativeServer) effectiveServer = 'alt'; else if (hasMain) effectiveServer = 'main';
    }

    let currentVideoUrl = '';
    if (effectiveServer === 'main' && hasMain) currentVideoUrl = secureUrls.main;
    if (effectiveServer === 'alt' && hasAlternativeServer) currentVideoUrl = secureUrls.alt;
    if (effectiveServer === 'alt2' && hasAlternativeServer2) currentVideoUrl = secureUrls.alt2;

    const isDirectVideo = currentVideoUrl && typeof currentVideoUrl === 'string' && (currentVideoUrl.toLowerCase().includes('.mp4') || currentVideoUrl.toLowerCase().includes('.webm') || currentVideoUrl.toLowerCase().includes('.m3u8'));
    const isDeepFake = video.category && typeof video.category === 'string' && video.category.toLowerCase().trim() === 'deepfake exclusive';

    const imageList = secureUrls.img ? String(secureUrls.img).split(',').map(img => img.trim()) : (video.img ? String(video.img).split(',').map(img => img.trim()) : []);
    const galleryImages = imageList.slice(1);
    const coverImage = imageList[0] || '';
    const showGallery = isDeepFake && !hasMain && !hasAlternativeServer && !hasAlternativeServer2 && galleryImages.length > 0;

    const hasDownloadLink = video.embed_url && video.embed_url.trim() !== '' && video.embed_url !== 'EMPTY';

    const serverOptions = [];
    if (hasMain) serverOptions.push({ id: 'main', label: 'Server 1' });
    if (hasAlternativeServer) serverOptions.push({ id: 'alt', label: 'Server 2' });
    if (hasAlternativeServer2) serverOptions.push({ id: 'alt2', label: 'Server 3' });
    const activeServerLabel = serverOptions.find(s => s.id === effectiveServer)?.label || 'Server';

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />
            <div className="pt-24 pb-20 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 min-h-screen relative transition-colors border-none">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-none">
                    <div className="lg:col-span-8 flex flex-col gap-4 border-none">

                        <div className={`w-full ${!isVipUnlocked ? 'aspect-auto min-h-[350px] sm:min-h-0 sm:aspect-video' : (currentVideoUrl || showGallery ? 'aspect-video' : 'min-h-[400px] max-h-[80vh]')} bg-zinc-100 dark:bg-zinc-950 rounded-[1.5rem] overflow-hidden relative flex items-center justify-center shadow-md dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-none transition-colors`}>
                            {!isVipUnlocked ? (
                                lockReason === 'payment' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl z-50 text-center transition-colors overflow-y-auto border-none">
                                        <div className="absolute inset-0 z-[-1] opacity-10 dark:opacity-20 pointer-events-none border-none">
                                            <img src={coverImage} className="w-full h-full object-cover blur-sm border-none" alt="locked background" />
                                        </div>
                                        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-amber-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-md dark:shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-3 sm:mb-6 transform rotate-3 hover:rotate-0 transition-transform shrink-0 border-none">
                                            <Lock className="w-6 h-6 sm:w-10 sm:h-10 text-white border-none" />
                                        </div>
                                        <h2 className="text-lg sm:text-3xl font-black text-zinc-900 dark:text-white mb-1.5 sm:mb-3 tracking-tight transition-colors border-none">Premium Content</h2>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] sm:text-base max-w-lg leading-tight sm:leading-relaxed transition-colors mb-4 sm:mb-6 px-2 border-none">
                                            Video eksklusif ini terkunci. Dukung admin untuk terus mengembangkan ShadowClips dengan memberikan <strong className="text-zinc-900 dark:text-white border-none">Donasi (Min. Rp 10.000)</strong> via Saweria untuk membuka akses penuh.
                                        </p>
                                        <div className="flex flex-col items-center gap-2.5 sm:gap-4 w-full max-w-sm px-2 sm:px-0 border-none">
                                            <a href="https://saweria.co/shadowclips" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 outline-none border-none text-[12px] sm:text-base">
                                                <Gift className="w-4 h-4 sm:w-5 sm:h-5 border-none shrink-0" /> Dukung & Donasi
                                            </a>
                                            <div className="flex items-start gap-2 sm:gap-3 w-full bg-[#106EBE]/5 dark:bg-[#106EBE]/10 border border-[#106EBE]/20 dark:border-[#106EBE]/30 p-2.5 sm:p-4 rounded-xl text-left shadow-sm">
                                                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#106EBE] dark:text-[#32ADFF] shrink-0 mt-0.5 border-none" />
                                                <p className="text-[9px] sm:text-[12px] text-zinc-700 dark:text-zinc-300 leading-snug sm:leading-relaxed border-none"><strong className="text-[#106EBE] dark:text-[#32ADFF] border-none">Perhatian:</strong> Wajib mencantumkan <strong className="border-none">Email Google</strong> Anda pada pesan donasi agar sistem memberikan akses.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl z-50 text-center transition-colors overflow-y-auto border-none">
                                        <div className="absolute inset-0 z-[-1] opacity-10 dark:opacity-20 pointer-events-none border-none">
                                            <img src={coverImage} className="w-full h-full object-cover blur-sm border-none" alt="locked background" />
                                        </div>
                                        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-[#106EBE] to-[#0e5c9f] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-md dark:shadow-[0_0_40px_rgba(16,110,190,0.6)] mb-3 sm:mb-6 transform rotate-3 hover:rotate-0 transition-transform shrink-0 border-none">
                                            <Lock className="w-6 h-6 sm:w-10 h-10 text-white border-none" />
                                        </div>
                                        <h2 className="text-lg sm:text-3xl font-black text-zinc-900 dark:text-white mb-1.5 sm:mb-3 tracking-tight transition-colors border-none">VIP Content Locked</h2>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] sm:text-base max-w-lg leading-tight sm:leading-relaxed transition-colors px-2 border-none">
                                            This premium content is locked. Please <strong className="text-zinc-900 dark:text-white border-none">Like</strong> and leave a <strong className="text-zinc-900 dark:text-white border-none">Comment</strong> below to unlock full access immediately.
                                        </p>
                                        <div className="flex flex-col items-center justify-center gap-1.5 mt-4 sm:mt-5 border-none z-20">
                                            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 drop-shadow-md border-none text-center">
                                                Bingung cara membuka videonya?
                                            </span>
                                            <a
                                                href="/tutorial"
                                                className="text-xs sm:text-sm font-bold text-[#106EBE] dark:text-[#32ADFF] hover:text-[#0e5c9f] dark:hover:text-white transition-colors underline decoration-[#106EBE] dark:decoration-[#32ADFF] hover:decoration-[#0e5c9f] dark:hover:decoration-white underline-offset-4 outline-none border-none cursor-pointer drop-shadow-md text-center"
                                            >
                                                Cek panduan (Tutorial) di sini
                                            </a>
                                        </div>
                                    </div>
                                )
                            ) : currentVideoUrl ? (
                                isDirectVideo ? <CustomPlayer key={currentVideoUrl} src={currentVideoUrl} poster={coverImage} /> : <iframe key={currentVideoUrl} src={currentVideoUrl} className="w-full h-full object-contain border-none" frameBorder="0" allowFullScreen title={video.title}></iframe>
                            ) : showGallery ? (
                                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-zinc-100 dark:bg-zinc-950/40 transition-colors border-none" onContextMenu={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 border-none">
                                        {galleryImages.map((imgUrl, idx) => (
                                            <div key={idx} onClick={() => setSelectedImage(imgUrl)} className="relative group cursor-pointer aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border-none shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-500">
                                                <img src={imgUrl} alt={`Gallery Image ${idx + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none border-none" draggable="false" loading="lazy" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 border-none">
                                                    <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-full transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-none"><ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md border-none" /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (<div className="text-zinc-400 dark:text-zinc-500 flex flex-col items-center p-12 border-none"><Play className="w-12 h-12 mb-2 opacity-50 border-none" /><p className="border-none">Video unavailable</p></div>)}
                        </div>

                        {/* 🔥 ACTION BAR: SERVER & DOWNLOAD (CENTER ALIGNED & BLUE CONSISTENT) 🔥 */}
                        {isVipUnlocked && (
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 mb-3 border-none w-full">

                                {/* Pilihan Server */}
                                <div className="relative min-w-0 border-none">
                                    {serverOptions.length > 1 ? (
                                        <>
                                            <button onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)} className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all bg-[#106EBE] hover:bg-[#0e5c9f] text-white shadow-md dark:shadow-[0_5px_15px_rgba(16,110,190,0.3)] border-none relative z-[101] outline-none cursor-pointer">
                                                <Server className="w-4 h-4 shrink-0 text-white border-none" />
                                                <span className="truncate border-none">{activeServerLabel}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 shrink-0 border-none ${isServerDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isServerDropdownOpen && <div className="fixed inset-0 z-[90] border-none" onClick={() => setIsServerDropdownOpen(false)}></div>}
                                            <div className={`absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-40 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-none overflow-hidden z-[100] flex flex-col py-1.5 transition-all duration-300 origin-top ${isServerDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                                                {serverOptions.map(option => (
                                                    <button key={option.id} onClick={() => { setActiveServer(option.id); setIsServerDropdownOpen(false); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-[12px] sm:text-[13px] font-bold transition-colors w-full text-left outline-none border-none cursor-pointer ${effectiveServer === option.id ? 'text-[#106EBE] dark:text-[#32ADFF] bg-zinc-50 dark:bg-zinc-800/50' : 'text-zinc-600 dark:text-zinc-300 hover:text-[#106EBE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                                                        <Server className="w-4 h-4 shrink-0 border-none" /> {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : serverOptions.length === 1 ? (
                                        <button className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all bg-[#106EBE] text-white shadow-md dark:shadow-[0_5px_15px_rgba(16,110,190,0.3)] cursor-default outline-none border-none">
                                            <Server className="w-4 h-4 shrink-0 text-white border-none" /> {serverOptions[0].label}
                                        </button>
                                    ) : null}
                                </div>

                                {/* Tombol Download */}
                                {hasDownloadLink && (
                                    <button onClick={() => { setIsDownloadModalOpen(true); setModalStatus('waiting'); setModalProgress(0); }} className="flex items-center justify-center gap-2 bg-[#106EBE] hover:bg-[#0e5c9f] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shadow-md hover:shadow-lg dark:shadow-[0_5px_15px_rgba(16,110,190,0.3)] outline-none border-none shrink-0 cursor-pointer">
                                        <Download className="w-4 h-4 shrink-0 border-none" /> Download
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="bg-zinc-100 dark:bg-zinc-900/40 p-5 sm:p-6 rounded-[1.5rem] flex flex-col gap-5 border-none shadow-none transition-colors">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white leading-snug tracking-tight transition-colors border-none" title={video?.title}>{video?.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 font-medium transition-colors border-none">
                                <span className="flex items-center gap-1.5 border-none"><Clock className="w-3.5 h-3.5 text-[#106EBE] border-none" /> {video?.created_at ? new Date(video.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                                {video?.duration && video.duration !== 'EMPTY' && <span className="flex items-center gap-1.5 border-none"><Clock className="w-3.5 h-3.5 text-[#106EBE] border-none" /> {video.duration}</span>}
                                {video?.size && video.size !== 'EMPTY' && <span className="flex items-center gap-1.5 border-none"><HardDrive className="w-3.5 h-3.5 text-[#106EBE] border-none" /> {video.size}</span>}
                                {video?.type && video.type !== 'EMPTY' && <span className="flex items-center gap-1.5 border-none"><FolderArchive className="w-3.5 h-3.5 text-[#106EBE] border-none" /> {video.type}</span>}
                                {video?.source && video.source !== 'EMPTY' && <span className="flex items-center gap-1.5 border-none"><Database className="w-3.5 h-3.5 text-[#106EBE] border-none" /> {video.source}</span>}
                                <SynopsisTooltip text={video?.sinopsis || ''} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full pt-2 border-none">
                                <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm outline-none border-none cursor-pointer ${hasLiked ? 'bg-[#106EBE] text-white shadow-md dark:shadow-[0_5px_15px_rgba(16,110,190,0.3)]' : 'bg-white dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}>
                                    <Heart className={`w-4 h-4 transition-all duration-300 border-none ${hasLiked ? 'fill-current scale-110' : ''}`} /> <span className="border-none">{likes > 0 ? formatViews(likes) : 'Like'}</span>
                                </button>
                                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm bg-white dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white outline-none border-none cursor-pointer">
                                    <Share2 className="w-4 h-4 border-none" /> <span className="border-none">Share</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-full border-none">
                            <IklanCustom className="border-none" />
                        </div>

                        <div className="bg-zinc-100 dark:bg-zinc-900/40 p-2 sm:p-6 rounded-[1.5rem] w-full border-none shadow-none overflow-hidden transition-colors">
                            <Komentar videoId={video?.id} supabase={supabase} onCommentSuccess={async () => {
                                setHasCommented(true);
                                try {
                                    const { data: { session } } = await supabase.auth.getSession();
                                    if (session?.user?.email) {
                                        await supabase.rpc('increment_user_points', { p_email: session.user.email, p_points: 25 });
                                    }
                                } catch (e) { }
                                await checkVipAccess(video.id, video, true, hasLiked);
                            }} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-4 w-full border-none">
                        <div className="bg-zinc-100 dark:bg-zinc-900/40 p-3 sm:p-5 rounded-[1.5rem] flex flex-col gap-3 sm:gap-4 border-none shadow-none transition-colors">
                            <h3 className="text-[15px] sm:text-[16px] font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-1 px-1 transition-colors border-none">
                                <LayoutGrid className="w-4 h-4 text-[#106EBE] border-none" /> Related Videos
                            </h3>
                            <div className="flex flex-col gap-4 sm:gap-5 border-none">

                                {relatedVideos?.map((item) => (
                                    <div key={item.id} onClick={() => window.location.href = `/streaming/${item.slug || item.id}`} className="group cursor-pointer flex flex-row items-start gap-3 sm:gap-4 w-full border-none">
                                        <div className="relative w-[110px] min-[400px]:w-[130px] sm:w-[180px] aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border-none shrink-0 shadow-sm dark:shadow-none transition-colors">
                                            <img src={getImageUrl(item.img)} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 border-none" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 border-none">
                                                <Play className="w-8 h-8 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300 border-none" />
                                            </div>
                                            {item.duration && item.duration !== 'EMPTY' && (
                                                <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 bg-black/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none border-none">
                                                    {item.duration}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0 border-none pt-0.5 sm:pt-1">
                                            <h4 className="font-bold text-[12px] min-[400px]:text-[13px] sm:text-[14px] text-zinc-800 dark:text-zinc-100 group-hover:text-[#106EBE] dark:group-hover:text-[#32ADFF] transition-colors line-clamp-3 sm:line-clamp-2 leading-relaxed sm:leading-snug mb-1 sm:mb-1.5 border-none" title={item.title}>
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-zinc-500 border-none transition-colors mt-auto">
                                                <Clock className="w-3 h-3 text-[#106EBE] border-none shrink-0" />
                                                <span className="truncate border-none">{new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 border-none transition-colors" onClick={() => setSelectedImage(null)} onContextMenu={(e) => e.preventDefault()}>
                    <button className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-zinc-200 dark:bg-zinc-900 hover:bg-[#106EBE] dark:hover:bg-[#106EBE] text-zinc-600 hover:text-white dark:text-white p-3 rounded-full transition-colors z-50 group border-none cursor-pointer"><X className="w-6 h-6 group-hover:rotate-90 transition-transform border-none" /></button>
                    <img src={selectedImage} alt="Fullscreen View" className="max-w-full max-h-full object-contain rounded-2xl select-none shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-none" draggable="false" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                </div>
            )}

            {/* 🔥 MODAL DOWNLOAD (KOTAK BERSIH & MODERN) 🔥 */}
            {isDownloadModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 border-none transition-colors">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative border-none">

                        <button onClick={() => setIsDownloadModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors outline-none border-none cursor-pointer">
                            <X className="w-5 h-5 border-none" />
                        </button>

                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 w-full border-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12 shrink-0 border-none drop-shadow-md">
                                <defs>
                                    <clipPath id="play-clip-modal">
                                        <path d="M22 25.5C22 18.5 29.5 14 35.5 17.5L82.5 44.5C88.5 48 88.5 57 82.5 60.5L35.5 87.5C29.5 91 22 86.5 22 79.5V25.5Z" />
                                    </clipPath>
                                    <linearGradient id="grad-top-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#32ADFF" />
                                        <stop offset="100%" stopColor="#007AFF" />
                                    </linearGradient>
                                    <linearGradient id="grad-left-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#007AFF" />
                                        <stop offset="100%" stopColor="#0052CC" />
                                    </linearGradient>
                                    <linearGradient id="grad-bottom-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#003D82" />
                                        <stop offset="100%" stopColor="#001233" />
                                    </linearGradient>
                                </defs>
                                <g clipPath="url(#play-clip-modal)">
                                    <polygon points="0,0 100,0 100,52.5 45,52.5" fill="url(#grad-top-modal)" />
                                    <polygon points="0,100 45,52.5 100,52.5 100,100" fill="url(#grad-bottom-modal)" />
                                    <polygon points="0,0 45,52.5 0,100" fill="url(#grad-left-modal)" />
                                </g>
                            </svg>
                            <div className="flex flex-col justify-center text-left border-none">
                                <span className="text-xl sm:text-2xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none mb-1 border-none transition-colors">Shadow<span className="text-[#106EBE]">Clips</span></span>
                                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] text-[#106EBE] dark:text-[#A0B3C6] uppercase ml-[1px] leading-none border-none transition-colors">www.shadowclips.asia</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8 w-full border-none">
                            <p className="text-zinc-600 dark:text-zinc-300 text-[13px] sm:text-[14px] leading-relaxed border-none transition-colors">
                                ShadowClips never sells or charges a single penny for this file. We provide this link 100% free for entertainment purposes.<br />
                                <span className="text-zinc-500 text-[11px] mt-2 block border-none">Please be aware of any scams claiming to represent us.</span>
                            </p>
                        </div>

                        <div className="w-full mb-8 flex flex-col items-center border-none">
                            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3 border-none transition-colors">
                                <div className="h-full bg-[#106EBE] transition-all duration-75 ease-linear shadow-md dark:shadow-[0_0_15px_rgba(16,110,190,0.8)] border-none" style={{ width: `${modalProgress}%` }}></div>
                            </div>
                            <span className="text-[11px] font-bold text-zinc-500 tracking-wide h-4 border-none">
                                {modalStatus === 'waiting' && `Preparing secure link... ${Math.ceil(4 - (modalProgress / 25))}s`}
                            </span>
                        </div>

                        <div className="w-full border-none">
                            {modalStatus === 'waiting' ? (
                                <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 cursor-wait transition-all border-none outline-none font-bold text-[13px]">
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0 border-none" /><span className="border-none">Please wait...</span>
                                </button>
                            ) : (
                                <button onClick={() => {
                                    const targetUrl = video.embed_url || video.url_download;
                                    if (targetUrl) window.open(targetUrl, '_blank');
                                    else alert("Download link is not available for this video.");
                                    setIsDownloadModalOpen(false);
                                }} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#106EBE] text-white hover:bg-[#0e5c9f] transition-all transform hover:-translate-y-0.5 shadow-md dark:shadow-[0_10px_20px_rgba(16,110,190,0.3)] border-none outline-none cursor-pointer font-bold text-[13px]">
                                    <ExternalLink className="w-4 h-4 shrink-0 border-none" /><span className="border-none">Continue to download</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}