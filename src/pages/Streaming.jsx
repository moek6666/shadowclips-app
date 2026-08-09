import { useState, useEffect, useRef } from 'react';
import {
    Play, Download, Clock, MonitorPlay, Share2, Heart,
    HardDrive, FolderArchive, Database, Server, X, ZoomIn,
    LayoutGrid, Loader2, ExternalLink
} from 'lucide-react';

// IMPORT ICON KATEGORI DINAMIS
import { SiOnlyfans, SiTelegram } from 'react-icons/si';
import { FaCrown, FaVideo, FaFire, FaBan, FaRandom, FaFilm, FaMask } from 'react-icons/fa';
import { FaClapperboard } from 'react-icons/fa6';
import { BiSolidCategory } from 'react-icons/bi';
import { MdLiveTv } from 'react-icons/md';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomPlayer from '../components/CustomPlayer';
import Komentar from '../components/Komentar';

const getImageUrl = (imgString) => imgString ? imgString.split(',')[0].trim() : '';

const formatViews = (views) => {
    if (!views) return '0';
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
};

// LOGIKA ICON DINAMIS UNTUK RELATED VIDEOS
const getCategoryIcon = (category) => {
    if (!category) return <BiSolidCategory className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors shrink-0" />;

    const name = String(category).toLowerCase();
    const iconClasses = "w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors shrink-0";

    if (name.includes('onlyfans')) return <SiOnlyfans className={iconClasses} />;
    if (name.includes('telegram')) return <SiTelegram className={iconClasses} />;
    if (name.includes('movie') || name.includes('scene')) return <FaClapperboard className={iconClasses} />;
    if (name.includes('live')) return <MdLiveTv className={iconClasses} />;
    if (name.includes('deepfake')) return <FaMask className={iconClasses} />;

    if (name.includes('kbj') || name.includes('korean')) {
        return (
            <div className="relative shrink-0 flex items-center justify-center">
                <FaVideo className={iconClasses} />
                <span className="absolute -bottom-1 -right-1 bg-zinc-800 border border-zinc-600 text-white text-[5px] font-black px-[2px] rounded-[1px] shadow-sm group-hover:border-[#0FFCBE] group-hover:text-[#0FFCBE] transition-colors leading-none">KR</span>
            </div>
        );
    }

    if (name.includes('jav') || name.includes('jepang') || name.includes('film')) {
        return (
            <div className="relative shrink-0 flex items-center justify-center">
                <FaFilm className={iconClasses} />
                <span className="absolute -bottom-1 -right-1 bg-zinc-800 border border-zinc-600 text-white text-[5px] font-black px-[2px] rounded-[1px] shadow-sm group-hover:border-[#0FFCBE] group-hover:text-[#0FFCBE] transition-colors leading-none">JP</span>
            </div>
        );
    }

    if (name.includes('exclusive') || name.includes('eksklusif')) return <FaCrown className={iconClasses} />;
    if (name.includes('viral')) return <FaFire className={iconClasses} />;
    if (name.includes('random') || name.includes('acak')) return <FaRandom className={iconClasses} />;
    if (name.includes('banned')) return <FaBan className={iconClasses} />;

    return <BiSolidCategory className={iconClasses} />;
};

export default function Streaming({ supabase }) {
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [activeServer, setActiveServer] = useState('main');
    const [selectedImage, setSelectedImage] = useState(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState('waiting');
    const [modalProgress, setModalProgress] = useState(0);

    const hilltopAdRef = useRef(null);

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

            if (!error && data) {
                setVideo(data);
                document.title = `${data.title} | ShadowClips`;

                await supabase.rpc('increment_views', { vid_id: data.id });

                setLikes(data.likes || 0);
                if (localStorage.getItem(`shadowclips_liked_${data.id}`)) setHasLiked(true);

                const { data: relatedData } = await supabase.from('videos').select('*').eq('category', data.category).neq('id', data.id).limit(10).order('created_at', { ascending: false });
                if (relatedData) setRelatedVideos(relatedData);
            } else {
                const { data: fallbackData } = await supabase.from('videos').select('*').eq('id', slug).single();
                if (fallbackData) {
                    setVideo(fallbackData);
                    document.title = `${fallbackData.title} | ShadowClips`;
                    setLikes(fallbackData.likes || 0);
                    if (localStorage.getItem(`shadowclips_liked_${fallbackData.id}`)) setHasLiked(true);
                } else { window.location.href = '/'; }
            }
            setLoading(false);
        };
        fetchVideoDetails();
    }, [supabase]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (video && hilltopAdRef.current && !hilltopAdRef.current.querySelector('script')) {
                const s = document.createElement('script');
                s.settings = {};
                s.src = "//winding-hurt.com/b.XwV/s-deGllV0BYEWYct/Senm/9XuBZgUFl/kQPfT/cMyeOITbA/4RNITRMkt/NvzGIu5qMyDHgD1jNCwo";
                s.async = true;
                s.referrerPolicy = "no-referrer-when-downgrade";
                hilltopAdRef.current.appendChild(s);
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [video]);

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
        }

        await supabase.rpc('update_likes', { vid_id: video.id, new_likes: newLikesCount });
    };

    const handleShare = async () => {
        try {
            if (navigator.share) await navigator.share({ title: video?.title || 'ShadowClips', url: window.location.href });
            else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
        } catch (err) { console.log('Share error:', err); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-zinc-800 border-t-[#106EBE] rounded-full animate-spin"></div></div>;
    if (!video) return null;

    // LOGIKA AUTO-FALLBACK & VALIDASI SERVER
    const hasMain = video.trailer_url && video.trailer_url !== 'EMPTY' && String(video.trailer_url).trim() !== '';
    const hasAlternativeServer = video.alternative_server && video.alternative_server !== 'EMPTY' && String(video.alternative_server).trim() !== '';
    const hasAlternativeServer2 = video.alternative_server2 && video.alternative_server2 !== 'EMPTY' && String(video.alternative_server2).trim() !== '';

    let effectiveServer = activeServer;
    if (effectiveServer === 'main' && !hasMain) {
        if (hasAlternativeServer2) effectiveServer = 'alt2';
        else if (hasAlternativeServer) effectiveServer = 'alt';
    } else if (effectiveServer === 'alt' && !hasAlternativeServer) {
        if (hasAlternativeServer2) effectiveServer = 'alt2';
        else if (hasMain) effectiveServer = 'main';
    } else if (effectiveServer === 'alt2' && !hasAlternativeServer2) {
        if (hasAlternativeServer) effectiveServer = 'alt';
        else if (hasMain) effectiveServer = 'main';
    }

    let currentVideoUrl = '';
    if (effectiveServer === 'main' && hasMain) currentVideoUrl = video.trailer_url;
    if (effectiveServer === 'alt' && hasAlternativeServer) currentVideoUrl = video.alternative_server;
    if (effectiveServer === 'alt2' && hasAlternativeServer2) currentVideoUrl = video.alternative_server2;

    const isDirectVideo = currentVideoUrl && typeof currentVideoUrl === 'string' && (currentVideoUrl.toLowerCase().includes('.mp4') || currentVideoUrl.toLowerCase().includes('.webm') || currentVideoUrl.toLowerCase().includes('.m3u8'));
    const isDeepFake = video.category && typeof video.category === 'string' && video.category.toLowerCase() === 'deepfake';
    const imageList = video.img ? String(video.img).split(',').map(img => img.trim()) : [];
    const hasDownloadLink = video.embed_url && video.embed_url.trim() !== '' && video.embed_url !== 'EMPTY';

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} />

            <div className="pt-24 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col gap-8 min-h-screen relative">
                <div className="w-full">
                    <div className={`w-full ${currentVideoUrl ? 'aspect-video' : 'min-h-[500px] max-h-[80vh]'} bg-zinc-950 rounded-2xl overflow-hidden relative flex items-center justify-center mb-6 shadow-2xl`}>
                        {currentVideoUrl ? (
                            isDirectVideo ? <CustomPlayer key={currentVideoUrl} src={currentVideoUrl} poster={getImageUrl(video.img)} /> : <iframe key={currentVideoUrl} src={currentVideoUrl} className="w-full h-full object-contain" frameBorder="0" allowFullScreen title={video.title}></iframe>
                        ) : isDeepFake && imageList.length > 0 ? (
                            <div className="w-full h-full overflow-y-auto p-4 sm:p-6 custom-scrollbar" onContextMenu={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {imageList.map((imgUrl, idx) => (
                                        <div key={idx} onClick={() => setSelectedImage(imgUrl)} className="relative group cursor-pointer aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 shadow-lg">
                                            <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none" draggable="false" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ZoomIn className="w-6 h-6 text-white" /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-zinc-500 flex flex-col items-center p-12"><Play className="w-12 h-12 mb-2 opacity-50" /><p>Video unavailable</p></div>
                        )}
                    </div>

                    {/* HANYA MUNCULKAN TOMBOL JIKA LINKNYA BENAR-BENAR ADA */}
                    {(hasMain || hasAlternativeServer || hasAlternativeServer2) && (
                        <div className="flex justify-center w-full mb-6">
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                                {hasMain && (
                                    <button onClick={() => setActiveServer('main')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${effectiveServer === 'main' ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.4)]' : 'bg-zinc-800/40 text-zinc-400 hover:text-[#0FFCBE]'}`}><Server className="w-4 h-4" /> Main</button>
                                )}

                                {hasAlternativeServer && (
                                    <button onClick={() => setActiveServer('alt')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${effectiveServer === 'alt' ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.4)]' : 'bg-zinc-800/40 text-zinc-400 hover:text-[#0FFCBE]'}`}><Server className="w-4 h-4" /> Hydrax</button>
                                )}

                                {hasAlternativeServer2 && (
                                    <button onClick={() => setActiveServer('alt2')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${effectiveServer === 'alt2' ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.4)]' : 'bg-zinc-800/40 text-zinc-400 hover:text-[#0FFCBE]'}`}><Server className="w-4 h-4" /> Vidara</button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="relative flex flex-col items-center justify-center w-full text-center">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-snug" title={video.title}>{video.title}</h1>

                        <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-zinc-300 font-medium mb-6">
                            <span className="flex items-center gap-1.5"><MonitorPlay className="w-4 h-4 text-[#106EBE]" /> <span className="font-bold text-white">{formatViews(video.views)} Views</span></span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#106EBE]" /> {new Date(video.created_at).toLocaleDateString('en-US')}</span>

                            {video.duration && video.duration !== 'EMPTY' && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#106EBE]" /> {video.duration}</span>}
                            {video.size && video.size !== 'EMPTY' && <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-[#106EBE]" /> {video.size}</span>}
                            {video.type && video.type !== 'EMPTY' && <span className="flex items-center gap-1.5"><FolderArchive className="w-4 h-4 text-[#106EBE]" /> {video.type}</span>}
                            {video.source && video.source !== 'EMPTY' && <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-[#106EBE]" /> {video.source}</span>}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xl">
                            <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${hasLiked ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.4)]' : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-[#0FFCBE]'}`}>
                                <Heart className={`w-4 h-4 transition-all duration-300 ${hasLiked ? 'fill-current scale-110' : ''}`} /> <span>{likes > 0 ? formatViews(likes) : 'Like'}</span>
                            </button>
                            <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-[#0FFCBE]">
                                <Share2 className="w-4 h-4" /> <span>Share</span>
                            </button>
                            {hasDownloadLink && (
                                <button onClick={() => { setIsDownloadModalOpen(true); setModalStatus('waiting'); setModalProgress(0); }} className="flex-1 flex items-center justify-center gap-2 bg-[#106EBE] hover:bg-[#0e5c9f] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,110,190,0.4)] hover:scale-105">
                                    <Download className="w-4 h-4 shrink-0" /> <span className="text-sm whitespace-nowrap">Download</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-center mt-2 mb-6 overflow-hidden min-h-[90px]">
                    <div ref={hilltopAdRef}></div>
                </div>

                <div className="w-full">
                    <Komentar videoId={video.id} />
                </div>

                <div className="w-full pt-4">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-[2px] w-full bg-gradient-to-l from-[#106EBE] to-transparent flex-1 rounded-full hidden sm:block"></div>
                        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 whitespace-nowrap"><LayoutGrid className="w-6 h-6 text-[#106EBE]" /> Related Videos</h3>
                        <div className="h-[2px] w-full bg-gradient-to-r from-[#106EBE] to-transparent flex-1 rounded-full hidden sm:block"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {relatedVideos.map((item) => (
                            <div key={item.id} onClick={() => window.location.href = `/streaming/${item.slug || item.id}`} className="group cursor-pointer">
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800/30 shadow-lg">
                                    <img src={getImageUrl(item.img)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-[#106EBE] rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(16,110,190,0.6)]">
                                            <Play className="w-5 h-5 fill-current ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2 text-center">
                                    <h4 className="font-bold text-sm mb-1.5 text-white group-hover:text-[#0FFCBE] transition-colors truncate" title={item.title}>{item.title}</h4>
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
                                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white group-hover:text-[#0FFCBE] transition-colors">
                                            {getCategoryIcon(item.category)} {item.category}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-white group-hover:text-[#0FFCBE] transition-colors">
                                            <MonitorPlay className="w-3.5 h-3.5 text-[#106EBE] group-hover:text-[#0FFCBE] transition-colors" /> {formatViews(item.views)} views
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />

            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)} onContextMenu={(e) => e.preventDefault()}>
                    <button className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-zinc-900/80 hover:bg-[#106EBE] text-white p-2.5 rounded-full transition-colors z-50 group" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}><X className="w-6 h-6 group-hover:scale-110 transition-transform" /></button>
                    <img src={selectedImage} alt="Fullscreen View" className="max-w-full max-h-full object-contain rounded-lg select-none" draggable="false" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                </div>
            )}

            {isDownloadModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-xl flex flex-col items-center text-center animate-in slide-in-from-bottom-10 duration-500 relative">

                        {/* UPDATE LOGO MODAL SESUAI DENGAN VERSI NAVBAR TERBARU */}
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 w-full">
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_0_12px_rgba(16,110,190,0.8)] shrink-0">
                                <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" stroke="#106EBE" strokeWidth="8" strokeLinejoin="round" />
                                <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" stroke="#106EBE" strokeWidth="3.5" strokeLinejoin="round" opacity="0.9" />
                                <polygon points="43,36 64,50 43,64" stroke="#106EBE" strokeWidth="3" strokeLinejoin="round" fill="rgba(16, 110, 190, 0.3)" />
                            </svg>
                            <div className="flex flex-col justify-center text-left">
                                <span className="text-2xl sm:text-4xl font-black tracking-tighter text-white leading-none mb-1">
                                    Shadow<span className="text-[#106EBE]">Clips</span>
                                </span>
                                <span className="text-[10px] sm:text-[12px] font-bold tracking-[0.22em] text-[#A0B3C6] uppercase ml-[1px] leading-none">
                                    www.shadowclips.asia
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10 w-full px-2">
                            <p className="text-zinc-300 text-base md:text-lg leading-relaxed md:leading-loose">ShadowClips never sells or charges a single penny for this file. We provide this link 100% free for entertainment purposes.<br /><span className="text-zinc-500 text-sm mt-2 block">Please be aware of any scams claiming to represent us.</span></p>
                        </div>
                        <div className="w-full max-w-sm mb-10 flex flex-col items-center">
                            <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#106EBE] transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(16,110,190,0.8)]" style={{ width: `${modalProgress}%` }}></div></div>
                            <span className="text-[10px] md:text-xs text-zinc-500 tracking-wide h-4">{modalStatus === 'waiting' && `Preparing secure link... ${Math.ceil(4 - (modalProgress / 25))}s`}</span>
                        </div>
                        <div className="w-full max-w-sm">
                            {modalStatus === 'waiting' ? (
                                <button disabled className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-zinc-900/40 text-zinc-600 cursor-wait transition-all"><Loader2 className="w-5 h-5 animate-spin shrink-0" /><span>Please wait...</span></button>
                            ) : (
                                <button onClick={() => { const targetUrl = video.embed_url || video.url_download; if (targetUrl) window.open(targetUrl, '_blank'); else alert("Download link is not available for this video."); setIsDownloadModalOpen(false); }} className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#106EBE] text-white hover:bg-[#0e5c9f] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,110,190,0.4)] animate-in zoom-in duration-300"><ExternalLink className="w-5 h-5 shrink-0" /><span>Continue to download page</span></button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}