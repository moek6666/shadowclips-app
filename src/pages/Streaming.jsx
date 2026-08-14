import { useState, useEffect } from 'react';
import { Play, Download, Clock, Eye, MonitorPlay, Share2, Heart, HardDrive, FolderArchive, Database, Server, X, ZoomIn, LayoutGrid, Loader2, ExternalLink, Lock, ChevronDown } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomPlayer from '../components/CustomPlayer';
import Komentar from '../components/Komentar';
import SynopsisTooltip from '../components/SynopsisTooltip';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';
const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

export default function Streaming({ supabase }) {
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeServer, setActiveServer] = useState('main');
    const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState('waiting');
    const [modalProgress, setModalProgress] = useState(0);

    const [isVipUnlocked, setIsVipUnlocked] = useState(true);
    const [hasCommented, setHasCommented] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchVideoDetails = async () => {
            if (!supabase) return;
            setLoading(true);
            const pathParts = window.location.pathname.split('/');
            const slug = decodeURIComponent(pathParts[2] || '');
            if (!slug) { window.location.href = '/'; return; }

            let query = supabase.from('videos').select('*').eq('slug', slug);
            const { data, error } = await query.single();

            const processVideo = async (vidData) => {
                setVideo(vidData);
                document.title = `${vidData.title} | ShadowClips`;
                await supabase.rpc('increment_views', { vid_id: vidData.id });
                setLikes(vidData.likes || 0);

                const userLiked = localStorage.getItem(`shadowclips_liked_${vidData.id}`);
                if (userLiked) setHasLiked(true);
                const userCommented = localStorage.getItem(`shadowclips_commented_${vidData.id}`);
                if (userCommented) setHasCommented(true);

                const isVipContent = String(vidData.category).toLowerCase().includes('exclusive') || String(vidData.category).toLowerCase().includes('vip');
                if (isVipContent) {
                    if (userLiked && userCommented) setIsVipUnlocked(true);
                    else setIsVipUnlocked(false);
                } else setIsVipUnlocked(true);

                const { data: relatedData } = await supabase.from('videos').select('*').eq('category', vidData.category).neq('id', vidData.id).limit(10).order('created_at', { ascending: false });
                if (relatedData) setRelatedVideos(relatedData);
            };

            if (!error && data) {
                await processVideo(data);
            } else {
                const { data: fallbackData } = await supabase.from('videos').select('*').eq('id', slug).single();
                if (fallbackData) await processVideo(fallbackData);
                else window.location.href = '/';
            }
            setLoading(false);
        };
        fetchVideoDetails();
    }, [supabase]);

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
        const newLikesCount = hasLiked ? (likes > 0 ? likes - 1 : 0) : likes + 1;
        setLikes(newLikesCount);
        setHasLiked(!hasLiked);

        if (hasLiked) {
            localStorage.removeItem(`shadowclips_liked_${video.id}`);
        } else {
            localStorage.setItem(`shadowclips_liked_${video.id}`, 'true');
            const isVipContent = String(video.category).toLowerCase().includes('exclusive') || String(video.category).toLowerCase().includes('vip');
            if (isVipContent && hasCommented) setIsVipUnlocked(true);
        }
        await supabase.rpc('update_likes', { vid_id: video.id, new_likes: newLikesCount });
    };

    const handleShare = async () => {
        try {
            if (navigator.share) await navigator.share({ title: video?.title || 'ShadowClips', url: window.location.href });
            else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
        } catch (err) { console.log('Share error:', err); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-t-[#106EBE] border-zinc-800 rounded-full animate-spin"></div></div>;
    if (!video) return null;

    const hasMain = video.trailer_url && video.trailer_url !== 'EMPTY' && String(video.trailer_url).trim() !== '';
    const hasAlternativeServer = video.alternative_server && video.alternative_server !== 'EMPTY' && String(video.alternative_server).trim() !== '';
    const hasAlternativeServer2 = video.alternative_server2 && video.alternative_server2 !== 'EMPTY' && String(video.alternative_server2).trim() !== '';

    let effectiveServer = activeServer;
    if (effectiveServer === 'main' && !hasMain) {
        if (hasAlternativeServer2) effectiveServer = 'alt2'; else if (hasAlternativeServer) effectiveServer = 'alt';
    } else if (effectiveServer === 'alt' && !hasAlternativeServer) {
        if (hasAlternativeServer2) effectiveServer = 'alt2'; else if (hasMain) effectiveServer = 'main';
    } else if (effectiveServer === 'alt2' && !hasAlternativeServer2) {
        if (hasAlternativeServer) effectiveServer = 'alt'; else if (hasMain) effectiveServer = 'main';
    }

    let currentVideoUrl = '';
    if (effectiveServer === 'main' && hasMain) currentVideoUrl = video.trailer_url;
    if (effectiveServer === 'alt' && hasAlternativeServer) currentVideoUrl = video.alternative_server;
    if (effectiveServer === 'alt2' && hasAlternativeServer2) currentVideoUrl = video.alternative_server2;

    const isDirectVideo = currentVideoUrl && typeof currentVideoUrl === 'string' && (currentVideoUrl.toLowerCase().includes('.mp4') || currentVideoUrl.toLowerCase().includes('.webm') || currentVideoUrl.toLowerCase().includes('.m3u8'));
    const isDeepFake = video.category && typeof video.category === 'string' && video.category.toLowerCase() === 'deepfake';
    const imageList = video.img ? String(video.img).split(',').map(img => img.trim()) : [];
    const hasDownloadLink = video.embed_url && video.embed_url.trim() !== '' && video.embed_url !== 'EMPTY';

    const serverOptions = [];
    if (hasMain) serverOptions.push({ id: 'main', label: 'Server 1' });
    if (hasAlternativeServer) serverOptions.push({ id: 'alt', label: 'Server 2' });
    if (hasAlternativeServer2) serverOptions.push({ id: 'alt2', label: 'Server 3' });
    const activeServerLabel = serverOptions.find(s => s.id === effectiveServer)?.label || 'Server';

    return (
        <>
            <Navbar isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-24 pb-20 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 min-h-screen relative">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    <div className="lg:col-span-8 flex flex-col gap-4">

                        <div className={`w-full ${currentVideoUrl || !isVipUnlocked ? 'aspect-video' : 'min-h-[400px] max-h-[80vh]'} bg-zinc-950 rounded-[1.5rem] overflow-hidden relative flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-none`}>
                            {!isVipUnlocked ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-900/95 backdrop-blur-3xl z-50 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#106EBE] to-[#0e5c9f] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,110,190,0.6)] mb-6 transform rotate-3 hover:rotate-0 transition-transform"><Lock className="w-10 h-10 text-white" /></div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">VIP Content Locked</h2>
                                    <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">This premium content is locked. Please <strong className="text-white">Like</strong> and leave a <strong className="text-white">Comment</strong> below to unlock full access immediately.</p>
                                </div>
                            ) : currentVideoUrl ? (
                                isDirectVideo ? (
                                    <CustomPlayer
                                        key={currentVideoUrl}
                                        src={currentVideoUrl}
                                        poster={getImageUrl(video.img)}
                                    />
                                ) : (
                                    <iframe key={currentVideoUrl} src={currentVideoUrl} className="w-full h-full object-contain border-none" frameBorder="0" allowFullScreen title={video.title}></iframe>
                                )
                            ) : isDeepFake && imageList.length > 0 ? (
                                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 custom-scrollbar" onContextMenu={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                                        {imageList.map((imgUrl, idx) => (
                                            <div key={idx} onClick={() => setSelectedImage(imgUrl)} className="relative group cursor-pointer aspect-[3/4] rounded-[4px] overflow-hidden bg-zinc-900 shadow-lg border-none">
                                                <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none" draggable="false" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ZoomIn className="w-6 h-6 text-white" /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (<div className="text-zinc-500 flex flex-col items-center p-12"><Play className="w-12 h-12 mb-2 opacity-50" /><p>Video unavailable</p></div>)}
                        </div>

                        {/* --- SIDE-BY-SIDE MOBILE DI SINI --- */}
                        {isVipUnlocked && (
                            <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-zinc-900/40 p-2.5 sm:p-4 rounded-[1.5rem] border-none">
                                <div className="flex items-center gap-2 relative min-w-0">
                                    <span className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mr-1 hidden sm:block">Server:</span>
                                    {serverOptions.length > 1 ? (
                                        <div className="relative min-w-0">
                                            <button onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)} className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-bold transition-all bg-[#106EBE] text-white shadow-[0_5px_15px_rgba(16,110,190,0.3)] border-none relative z-[101] max-w-full">
                                                <Server className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                <span className="truncate max-w-[70px] sm:max-w-none">{activeServerLabel}</span>
                                                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ml-0.5 shrink-0 ${isServerDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isServerDropdownOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsServerDropdownOpen(false)}></div>}
                                            <div className={`absolute top-full left-0 mt-2 w-32 sm:w-36 bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[100] flex flex-col py-1.5 transition-all duration-300 origin-top border-none ${isServerDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                                                {serverOptions.map(option => (
                                                    <button key={option.id} onClick={() => { setActiveServer(option.id); setIsServerDropdownOpen(false); }} className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-[11px] sm:text-[13px] font-bold transition-colors w-full text-left border-none ${effectiveServer === option.id ? 'text-[#0FFCBE] bg-zinc-800/50' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'}`}>
                                                        <Server className="w-3 h-3 shrink-0" /> {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : serverOptions.length === 1 ? (
                                        <button className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-bold transition-all bg-[#106EBE] text-white shadow-[0_5px_15px_rgba(16,110,190,0.3)] cursor-default border-none"><Server className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> {serverOptions[0].label}</button>
                                    ) : null}
                                </div>
                                {hasDownloadLink && (
                                    <button onClick={() => { setIsDownloadModalOpen(true); setModalStatus('waiting'); setModalProgress(0); }} className="flex items-center justify-center gap-1.5 bg-[#106EBE] hover:bg-[#0e5c9f] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-bold transition-all shadow-[0_5px_15px_rgba(16,110,190,0.3)] border-none shrink-0">
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /> Download
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="bg-zinc-900/40 p-5 sm:p-6 rounded-[1.5rem] flex flex-col gap-5 border-none">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight" title={video.title}>{video.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-[13px] text-zinc-400 font-medium">
                                <span className="flex items-center gap-1.5"><MonitorPlay className="w-3.5 h-3.5 text-[#106EBE]" /> <strong className="text-white">{formatViews(video.views)} Views</strong></span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#106EBE]" /> {new Date(video.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                {video.duration && video.duration !== 'EMPTY' && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#106EBE]" /> {video.duration}</span>}
                                {video.size && video.size !== 'EMPTY' && <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-[#106EBE]" /> {video.size}</span>}
                                {video.type && video.type !== 'EMPTY' && <span className="flex items-center gap-1.5"><FolderArchive className="w-3.5 h-3.5 text-[#106EBE]" /> {video.type}</span>}
                                {video.source && video.source !== 'EMPTY' && <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#106EBE]" /> {video.source}</span>}
                                <SynopsisTooltip text={video.sinopsis} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full pt-2">
                                <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm border-none ${hasLiked ? 'bg-[#106EBE] text-white shadow-[0_5px_15px_rgba(16,110,190,0.3)]' : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}>
                                    <Heart className={`w-4 h-4 transition-all duration-300 ${hasLiked ? 'fill-current scale-110' : ''}`} /> <span>{likes > 0 ? formatViews(likes) : 'Like'}</span>
                                </button>
                                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white border-none">
                                    <Share2 className="w-4 h-4" /> <span>Share</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-900/40 p-2 sm:p-6 rounded-[1.5rem] w-full border-none overflow-hidden">
                            <Komentar videoId={video.id} onCommentSuccess={() => {
                                setHasCommented(true);
                                const isVipContent = String(video?.category).toLowerCase().includes('exclusive') || String(video?.category).toLowerCase().includes('vip');
                                if (isVipContent && hasLiked) setIsVipUnlocked(true);
                            }} />
                        </div>
                    </div>

                    {/* WADAH SIDEBAR KANAN (lg:col-span-4) */}
                    <div className="lg:col-span-4 flex flex-col gap-4 w-full">

                        <div className="bg-zinc-900/40 p-3 sm:p-5 rounded-[1.5rem] flex flex-col gap-3 sm:gap-4 border-none">
                            <h3 className="text-[15px] sm:text-[16px] font-black text-white flex items-center gap-2 mb-1 px-1">
                                <LayoutGrid className="w-4 h-4 text-[#106EBE]" /> Related Videos
                            </h3>

                            {/* --- LIST RELATED VIDEOS --- */}
                            <div className="flex flex-col gap-4 sm:gap-5 border-none">
                                {relatedVideos.map((item) => (
                                    <div key={item.id} onClick={() => window.location.href = `/streaming/${item.slug || item.id}`} className="group cursor-pointer flex flex-row items-start gap-3 sm:gap-4 w-full border-none">

                                        {/* Thumbnail Sisi Kiri */}
                                        <div className="relative w-40 sm:w-52 aspect-video rounded-[8px] overflow-hidden bg-zinc-900 border-none shrink-0 shadow-md">
                                            <img src={getImageUrl(item.img)} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />

                                            {/* PERUBAHAN DI SINI: Tombol play disamakan putih tanpa background biru */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                <Play className="w-8 h-8 text-white/90 fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                                            </div>

                                            {item.duration && item.duration !== 'EMPTY' && (
                                                <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 bg-black/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 z-30 pointer-events-none">
                                                    {item.duration}
                                                </div>
                                            )}
                                        </div>

                                        {/* Teks Sisi Kanan */}
                                        <div className="flex flex-col flex-1 min-w-0 border-none pt-0.5 sm:pt-1">
                                            <h4 className="font-bold text-[12px] sm:text-[14px] text-zinc-100 group-hover:text-[#0FFCBE] transition-colors line-clamp-2 leading-snug mb-1.5" title={item.title}>
                                                {item.title}
                                            </h4>

                                            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-zinc-500 mb-1 border-none">
                                                <Clock className="w-3 h-3 text-[#106EBE]" />
                                                {new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>

                                            <div className="flex items-center gap-1.5 font-medium text-zinc-500 text-[10px] sm:text-[11px] border-none">
                                                <MonitorPlay className="w-3 h-3 text-[#106EBE]" /> {formatViews(item.views)} views
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
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 border-none" onClick={() => setSelectedImage(null)} onContextMenu={(e) => e.preventDefault()}>
                    <button className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-zinc-900 hover:bg-[#106EBE] text-white p-3 rounded-full transition-colors z-50 group border-none" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
                    <img src={selectedImage} alt="Fullscreen View" className="max-w-full max-h-full object-contain rounded-2xl select-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-none" draggable="false" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                </div>
            )}

            {isDownloadModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500 border-none">
                    <div className="w-full max-w-xl flex flex-col items-center text-center animate-in slide-in-from-bottom-10 duration-500 relative border-none">
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 w-full border-none">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_0_12px_rgba(16,110,190,0.8)] shrink-0 border-none">
                                <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" stroke="#106EBE" strokeWidth="8" strokeLinejoin="round" />
                                <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" stroke="#106EBE" strokeWidth="3.5" strokeLinejoin="round" opacity="0.9" />
                                <polygon points="43,36 64,50 43,64" stroke="#106EBE" strokeWidth="3" strokeLinejoin="round" fill="rgba(16, 110, 190, 0.3)" />
                            </svg>
                            <div className="flex flex-col justify-center text-left border-none">
                                <span className="text-2xl sm:text-4xl font-black tracking-tighter text-white leading-none mb-1 border-none">Shadow<span className="text-[#106EBE]">Clips</span></span>
                                <span className="text-[10px] sm:text-[12px] font-bold tracking-[0.22em] text-[#A0B3C6] uppercase ml-[1px] leading-none border-none">www.shadowclips.asia</span>
                            </div>
                        </div>
                        <div className="space-y-4 mb-10 w-full px-2 border-none">
                            <p className="text-zinc-300 text-base md:text-lg leading-relaxed md:leading-loose border-none">ShadowClips never sells or charges a single penny for this file. We provide this link 100% free for entertainment purposes.<br /><span className="text-zinc-500 text-sm mt-2 block border-none">Please be aware of any scams claiming to represent us.</span></p>
                        </div>
                        <div className="w-full max-w-sm mb-10 flex flex-col items-center border-none">
                            <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden mb-4 border-none"><div className="h-full bg-[#106EBE] transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(16,110,190,0.8)] border-none" style={{ width: `${modalProgress}%` }}></div></div>
                            <span className="text-[10px] md:text-xs text-zinc-500 tracking-wide h-4 border-none">{modalStatus === 'waiting' && `Preparing secure link... ${Math.ceil(4 - (modalProgress / 25))}s`}</span>
                        </div>
                        <div className="w-full max-w-sm border-none">
                            {modalStatus === 'waiting' ? (
                                <button disabled className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-3xl bg-zinc-900/40 text-zinc-600 cursor-wait transition-all border-none"><Loader2 className="w-5 h-5 animate-spin shrink-0 border-none" /><span className="border-none">Please wait...</span></button>
                            ) : (
                                <button onClick={() => { const targetUrl = video.embed_url || video.url_download; if (targetUrl) window.open(targetUrl, '_blank'); else alert("Download link is not available for this video."); setIsDownloadModalOpen(false); }} className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-3xl bg-[#106EBE] text-white hover:bg-[#0e5c9f] transition-all transform hover:scale-105 shadow-[0_15px_30px_rgba(16,110,190,0.4)] animate-in zoom-in duration-300 border-none"><ExternalLink className="w-5 h-5 shrink-0 border-none" /><span className="border-none">Continue to download page</span></button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}