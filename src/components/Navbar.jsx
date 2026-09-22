import React, { useState, useEffect, useContext, useRef } from 'react';
import useSWR from 'swr';
import { Search, Menu, X, Home, Compass, Flame, FolderOpen, Crown, ChevronDown, Sun, Moon, LogIn, LogOut, User, Settings, Download, Bell, Activity, Bot, Coffee, MessageSquare, Pin } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import ModalLogin from './ModalLogin';
import Avatar from './Avatar';
import DOMPurify from 'dompurify';

const generateSeoSlug = (categoryName) => categoryName ? categoryName.toLowerCase().trim().replace(/\s+/g, '-') : '';

// ==========================================
// 🔥 DATABASE EMOJI 3D UNTUK NOTIFIKASI 🔥
// ==========================================
const animatedEmojis = {
    ':love:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Heart-Eyes.png',
    ':api:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fire.png',
    ':ketawa:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Rolling%20on%20the%20Floor%20Laughing.png',
    ':jempol:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Thumbs%20Up.png',
    ':marah:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Angry%20Face.png',
    ':mahkota:': 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Crown.png',
};

const parseNotification = (text) => {
    if (!text || typeof text !== 'string') return '';
    let html = text.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    
    html = html.replace(/(:[a-zA-Z0-9_]+:)/g, (match) => {
        if (animatedEmojis[match]) {
            return `<img src="${animatedEmojis[match]}" alt="${match}" class="inline-block w-[18px] h-[18px] object-contain shrink-0 align-middle drop-shadow-sm mx-0.5 border-none" draggable="false" />`;
        }
        return match;
    });
    return html;
};

export default function Navbar({ isScrolled, supabase }) {
    const themeContext = useContext(ThemeContext);
    const theme = themeContext?.theme || 'dark';
    const toggleTheme = themeContext?.toggleTheme || (() => { });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isMobilePremiumOpen, setIsMobilePremiumOpen] = useState(false);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pcServerStatus, setPcServerStatus] = useState('offline');

    const profileDropdownRef = useRef(null);
    const notificationRef = useRef(null);

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const getImageUrl = (url) => url || '';

    const fetchProfile = async (userId) => {
        if (!supabase || !userId) return;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
            if (error) throw error;
            if (data) setProfile(data);
        } catch (err) { console.error('Error fetching profile:', err.message); }
    };

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            if (currentSession?.user) fetchProfile(currentSession.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
            if (currentSession?.user) fetchProfile(currentSession.user.id);
            else setProfile(null);
        });
        return () => subscription?.unsubscribe();
    }, [supabase]);

    // Listener Status Server
    useEffect(() => {
        if (!supabase) return;

        const fetchInitialServerStatus = async () => {
            try {
                const { data, error } = await supabase.from('server_status').select('status').limit(1).maybeSingle();
                if (data) setPcServerStatus(data.status);
            } catch (err) {}
        };
        fetchInitialServerStatus();

        const channel = supabase.channel('public-server-status')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'server_status' }, (payload) => {
                const newStatus = payload.new?.status;
                if (newStatus) {
                    setPcServerStatus((prevStatus) => {
                        if (prevStatus !== newStatus) {
                            setUnreadCount(prev => prev + 1);
                        }
                        return newStatus;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    // 🔥 LISTENER GLOBAL & PERSONAL NOTIFICATIONS 🔥
    useEffect(() => {
        if (!supabase) return;

        const fetchNotifications = async () => {
            try {
                // 1. Ambil Notifikasi Global / Sistem (Batasi 2 teratas agar otomatis tergeser)
                const { data: globalData, error: globalError } = await supabase
                    .from('global_notifications')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(2);
                if (globalError && globalError.code !== '42P01') throw globalError;

                // 2. Ambil Notifikasi Personal (Jika User Login)
                let personalData = [];
                const userEmail = session?.user?.email;
                if (userEmail) {
                    const { data: pData, error: pError } = await supabase
                        .from('user_notifications')
                        .select('*')
                        .eq('user_email', userEmail)
                        .order('created_at', { ascending: false })
                        .limit(10);
                    if (!pError && pData) {
                        personalData = pData;
                    }
                }

                // Gabungkan untuk perhitungan badge unread
                const combined = [...(globalData || []), ...personalData];

                if (combined.length > 0) {
                    setNotifications(combined);
                    const readNotifs = JSON.parse(localStorage.getItem('shadowclips_read_notifs') || '[]');
                    const unread = combined.filter(n => !readNotifs.includes(n.id)).length;
                    setUnreadCount(unread);
                }
            } catch (err) { 
                console.error("Error fetching notifications:", err);
            }
        };

        fetchNotifications();

        const uniqueChannelId = Date.now();

        // Realtime Global (Sistem / Komentar Global) -> Maksimal 2 item
        const notifChannel = supabase.channel(`public:global_notifications_${uniqueChannelId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_notifications' }, (payload) => {
                if (payload.new) {
                    setNotifications(currentNotifs => {
                        const isDuplicate = currentNotifs.some(notif => notif.id === payload.new.id);
                        if (isDuplicate) return currentNotifs;
                        
                        setUnreadCount(prev => prev + 1);
                        // Pisahkan yang global dan user, lalu batasi global maksimal 2
                        const globals = [payload.new, ...currentNotifs.filter(n => n.type === 'global' || n.isGlobal || !n.user_email)].slice(0, 2);
                        const users = currentNotifs.filter(n => n.user_email);
                        return [...globals, ...users];
                    });
                }
            })
            .subscribe();

        // Realtime Personal (Khusus User Terkait)
        let personalChannel = null;
        const userEmail = session?.user?.email;
        if (userEmail) {
            personalChannel = supabase.channel(`public:user_notifications_${userEmail}_${uniqueChannelId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_email=eq.${userEmail}` }, (payload) => {
                    if (payload.new) {
                        setNotifications(currentNotifs => {
                            const isDuplicate = currentNotifs.some(notif => notif.id === payload.new.id);
                            if (isDuplicate) return currentNotifs;

                            setUnreadCount(prev => prev + 1);
                            return [payload.new, ...currentNotifs];
                        });
                    }
                })
                .subscribe();
        }

        return () => {
            supabase.removeChannel(notifChannel);
            if (personalChannel) supabase.removeChannel(personalChannel);
        };
    }, [supabase, session?.user?.email]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) setIsProfileDropdownOpen(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listener Tombol Escape untuk menutup modal & dropdown
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setShowSearchModal(false);
                setIsProfileDropdownOpen(false);
                setIsNotificationOpen(false);
                setIsMobileProfileDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        if (supabase) await supabase.auth.signOut();
        setIsProfileDropdownOpen(false);
        setIsMobileProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
        if (typeof window !== 'undefined') window.location.reload();
    };

    const handleToggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen);
        setIsProfileDropdownOpen(false);

        if (!isNotificationOpen && unreadCount > 0) {
            const readNotifs = JSON.parse(localStorage.getItem('shadowclips_read_notifs') || '[]');
            const newReads = [...new Set([...readNotifs, ...notifications.map(n => n.id)])];
            localStorage.setItem('shadowclips_read_notifs', JSON.stringify(newReads));
            setUnreadCount(0);
        }
    };

    const handleNotificationClick = (notif) => {
        setIsNotificationOpen(false);
        const targetUrl = notif?.url || notif?.link || notif?.target_url || (notif?.slug ? `/streaming/${notif.slug}` : (notif?.video_id ? `/streaming/${notif.video_id}` : null));
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    };

    useEffect(() => {
        if (showSearchModal || isLoginModalOpen || isMobileMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showSearchModal, isLoginModalOpen, isMobileMenuOpen]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(localSearch), 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    const fetchSearchResults = async (query) => {
        if (!supabase || !query) return [];
        const { data, error } = await supabase.from('videos').select('*').or(`title.ilike.%${query}%,category.ilike.%${query}%`).order('created_at', { ascending: false }).limit(24);
        if (error) throw new Error(error.message);
        return data || [];
    };

    const { data: searchResults = [], isLoading: isSearching } = useSWR(
        (showSearchModal && debouncedSearch && supabase) ? ['navbar_search', debouncedSearch] : null,
        () => fetchSearchResults(debouncedSearch), { revalidateOnFocus: false }
    );

    const fetchCategoriesWithLabel = async () => {
        if (!supabase) return [];
        const { data, error } = await supabase.from('videos').select('category, labels').not('category', 'is', null);
        if (error || !data) return [];

        const categories = [];
        data.forEach(item => {
            if (item.category && item.labels) {
                const labelStr = typeof item.labels === 'string' ? item.labels : JSON.stringify(item.labels);
                if (labelStr.toLowerCase().includes('profesional site')) categories.push(item.category);
            }
        });
        return [...new Set(categories)].filter(Boolean);
    };

    const { data: categoryList = [] } = useSWR(
        supabase ? 'categories_with_prof_site' : null, fetchCategoriesWithLabel, { revalidateOnFocus: false, dedupingInterval: 600000 }
    );

    const closeAndClearSearch = () => {
        setShowSearchModal(false);
        setLocalSearch('');
        setDebouncedSearch('');
    };

    // Pisahkan antara Global/Sistem (Pinned max 2) dan User Personal
    const globalNotifs = notifications.filter(n => !n.user_email).slice(0, 2);
    const userNotifs = notifications.filter(n => n.user_email);

    return (
        <>
            <ModalLogin isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} supabase={supabase} />
            <nav className={`fixed top-0 w-full z-[60] transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-zinc-950 dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-950 dark:to-[#106EBE]/10 backdrop-blur-md py-3 shadow-sm dark:shadow-none border-none' : 'bg-gradient-to-b from-white/90 dark:from-zinc-950/90 to-transparent dark:to-transparent py-5 border-none'}`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex justify-between items-center border-none">

                    <div className="flex items-center gap-8 lg:gap-12 border-none">
                        <a href="/" className="flex items-center gap-2.5 z-50 outline-none border-none cursor-pointer">
                            <img
                                src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/Avatar_Border_Animation/new/New%20Logo%20Shadowclips.webp"
                                alt="ShadowClips Logo"
                                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-none drop-shadow-lg object-contain"
                            />
                            <div className="flex flex-col justify-center border-none">
                                <span className="text-xl sm:text-[22px] font-black tracking-tighter text-zinc-900 dark:text-white leading-none mb-1 transition-colors border-none">
                                    Shadow<span className="text-[#106EBE]">Clips</span>
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] text-[#106EBE] dark:text-[#A0B3C6] uppercase ml-[1px] leading-none transition-colors border-none">
                                    www.shadowclips.asia
                                </span>
                            </div>
                        </a>

                        <div className="hidden md:flex items-center gap-6 text-sm font-bold z-50 border-none">
                            <a href="/" className={`flex items-center gap-1.5 group transition-colors outline-none border-none cursor-pointer ${pathname === '/' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Home className="w-4 h-4 border-none" /> Home
                            </a>
                            <a href="/jelajahi" className={`flex items-center gap-1.5 group transition-colors outline-none border-none cursor-pointer ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Compass className="w-4 h-4 border-none" /> Explore
                            </a>
                            <a href="/populer" className={`flex items-center gap-1.5 group transition-colors outline-none border-none cursor-pointer ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Flame className="w-4 h-4 border-none" /> Trending
                            </a>
                            <a href="/koleksi" className={`flex items-center gap-1.5 group transition-colors outline-none border-none cursor-pointer ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <FolderOpen className="w-4 h-4 border-none" /> Library
                            </a>
                            
                            <div className="relative group cursor-pointer py-2 ml-2 border-none">
                                <div className={`flex items-center gap-1.5 whitespace-nowrap transition-colors outline-none border-none ${pathname.startsWith('/category') ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                    <Crown className="w-4 h-4 transition-colors border-none" /> Profesional Site <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300 border-none" />
                                </div>
                                <div className="absolute top-full left-0 w-56 h-4 bg-transparent border-none"></div>
                                <div className="absolute top-[calc(100%+0.5rem)] left-0 w-56 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100">
                                    {categoryList.length > 0 ? (
                                        categoryList.map((cat, idx) => (
                                            <a key={idx} href={`/category/${generateSeoSlug(cat)}`} className="px-4 py-2.5 text-[13px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#106EBE] dark:hover:text-[#106EBE] hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors flex items-center gap-2 outline-none border-none cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#106EBE] border-none"></div> {cat}
                                            </a>
                                        ))
                                    ) : (
                                        <span className="px-4 py-2.5 text-[12px] text-zinc-400 italic">Memuat kategori...</span>
                                    )}
                                </div>
                            </div>

                            <a href="/ai" className={`flex items-center gap-1.5 group transition-colors outline-none border-none ml-2 cursor-pointer ${pathname === '/ai' ? 'text-indigo-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-indigo-500'}`}>
                                <Bot className="w-4 h-4 border-none" /> 
                                <span className="font-bold border-none">AI Shorts</span>
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-2 lg:gap-4 border-none relative">
                        <div className="hidden md:flex relative z-50 mr-1">
                            <a href="https://trakteer.id/shadowclips" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1.5 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors font-bold text-[13px] border-none outline-none group cursor-pointer bg-transparent">
                                <Coffee className="w-4 h-4 group-hover:animate-bounce border-none" /> Traktir
                            </a>
                        </div>

                        <div className="hidden md:flex relative z-50">
                            <button onClick={() => setShowSearchModal(true)} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none cursor-pointer bg-transparent">
                                <Search className="w-5 h-5 border-none" />
                            </button>
                        </div>

                        <div className="relative border-none z-50" ref={notificationRef}>
                            <button onClick={handleToggleNotification} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none cursor-pointer relative flex items-center justify-center bg-transparent">
                                <Bell className="w-5 h-5 border-none" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950 border-none shadow-sm animate-pulse"></span>
                                )}
                            </button>

                            {/* Dropdown Notifikasi */}
                            {isNotificationOpen && (
                                <div className="absolute top-[calc(100%+0.5rem)] right-[-3rem] sm:right-0 w-[90vw] max-w-[320px] md:max-w-[420px] md:w-[420px] bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border-none overflow-hidden z-[110] flex flex-col">
                                    <div className="px-5 py-4 bg-zinc-50/80 dark:bg-zinc-800/40 border-none flex justify-between items-center shrink-0">
                                        <h3 className="text-[15px] font-black text-zinc-900 dark:text-white">Notifikasi</h3>
                                        {unreadCount > 0 && <span className="text-[11px] bg-[#106EBE] text-white px-2.5 py-1 rounded-md font-bold shadow-sm">{unreadCount} Baru</span>}
                                    </div>
                                    
                                    {/* 1. STATUS SERVER */}
                                    <div className={`px-4 py-3 border-none flex items-center gap-3 ${pcServerStatus === 'online' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                                        <Activity className="w-5 h-5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-bold">
                                                {pcServerStatus === 'online' ? 'Original Server Online' : 'Original Server Offline'}
                                            </h4>
                                            <p className="text-[12px] opacity-90 truncate">
                                                {pcServerStatus === 'online' ? 'Server Utama sedang aktif & stabil.' : 'Server Utama sedang offline.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. AREA PINNED: NOTIFIKASI GLOBAL / SISTEM */}
                                    {globalNotifs.length > 0 && (
                                        <div className="bg-sky-50/80 dark:bg-sky-950/30 border-none flex flex-col gap-1">
                                            <div className="px-4 py-1.5 bg-sky-100/50 dark:bg-sky-900/30 text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1 border-none">
                                                <Pin className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Pinned System / Global Notification
                                            </div>
                                            {globalNotifs.map((notif, index) => (
                                                <div key={notif.id || index} onClick={() => handleNotificationClick(notif)} className="p-4 transition-colors border-none cursor-pointer hover:bg-sky-100/50 dark:hover:bg-sky-900/40">
                                                    <div className="flex gap-3.5 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5 border-none">
                                                            <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400 border-none" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 border-none">
                                                            <h4 className="text-[14px] font-bold text-sky-950 dark:text-sky-200 mb-1 leading-snug truncate border-none">
                                                                {notif.title || 'Pengumuman Sistem'}
                                                            </h4>
                                                            <p 
                                                                className="text-[13px] text-sky-900/80 dark:text-sky-300/80 leading-relaxed break-words whitespace-pre-wrap border-none"
                                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parseNotification(notif.message || notif.text)) }}
                                                            />
                                                            <span className="text-[11px] text-sky-600/70 dark:text-sky-400/70 font-medium mt-2.5 block border-none">
                                                                {new Date(notif.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 3. AREA SCROLLABLE: NOTIFIKASI USER */}
                                    <div className="max-h-[280px] overflow-y-auto overflow-x-hidden flex flex-col scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent border-none">
                                        {userNotifs.length > 0 ? (
                                            userNotifs.map((notif, index) => (
                                                <div key={notif.id || index} onClick={() => handleNotificationClick(notif)} className="p-4 md:p-5 border-none hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                                    <div className="flex gap-3.5 items-start border-none">
                                                        <div className="w-8 h-8 rounded-full bg-[#106EBE]/10 flex items-center justify-center shrink-0 mt-0.5 border-none">
                                                            <MessageSquare className="w-4 h-4 text-[#106EBE] border-none" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 border-none">
                                                            <h4 className="text-[14px] font-bold text-zinc-900 dark:text-white mb-1 leading-snug truncate border-none">
                                                                {notif.title || 'Pesan Baru'}
                                                            </h4>
                                                            <p 
                                                                className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed break-words whitespace-pre-wrap border-none"
                                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parseNotification(notif.message || notif.text)) }}
                                                            />
                                                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-2.5 block border-none">
                                                                {new Date(notif.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : globalNotifs.length === 0 ? (
                                            <div className="p-10 text-center flex flex-col items-center justify-center border-none">
                                                <Bell className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3 border-none" />
                                                <span className="text-zinc-500 dark:text-zinc-400 text-[13px] font-medium border-none">Belum ada aktivitas terbaru</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-4 border-none z-50 ml-1">
                            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 border-none"></div>

                            {session ? (
                                <div className="relative border-none" ref={profileDropdownRef}>
                                    <button onClick={() => { setIsProfileDropdownOpen(!isProfileDropdownOpen); setIsNotificationOpen(false); }} className="flex items-center gap-2.5 bg-transparent transition-opacity hover:opacity-80 outline-none border-none cursor-pointer">
                                        <Avatar url={profile?.avatar_url} frameId={profile?.active_frame} containerClass="w-9 h-9" scale={0.35} />
                                        <div className="flex flex-col items-start justify-center border-none">
                                            <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate leading-tight border-none">
                                                {profile?.name || (session?.user?.email || '').split('@')[0] || 'User'}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-0.5 border-none">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border-none"></span>
                                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-none">Online</span>
                                            </div>
                                        </div>
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border-none overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-5 py-4 bg-zinc-50/50 dark:bg-zinc-800/30 border-none">
                                                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 border-none">Masuk Sebagai</p>
                                                <p className="text-[13px] font-bold text-zinc-900 dark:text-white truncate border-none">{session?.user?.email}</p>
                                                {profile?.is_premium && <span className="inline-block mt-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-[4px] uppercase tracking-wider font-bold border-none">Premium VIP</span>}
                                            </div>

                                            <div className="flex flex-col p-2 border-none">
                                                <a href="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-zinc-600 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors outline-none border-none cursor-pointer">
                                                    <Settings className="w-4 h-4 border-none" /> Pengaturan Profil
                                                </a>

                                                <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-zinc-600 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-colors outline-none border-none cursor-pointer text-left">
                                                    {theme === 'dark' ? <Sun className="w-4 h-4 border-none" /> : <Moon className="w-4 h-4 border-none" />}
                                                    <span className="border-none">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                                </button>

                                                <div className="h-px bg-black/5 dark:bg-white/5 my-1 border-none"></div>

                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-red-500 dark:text-white hover:bg-red-50 dark:hover:bg-white/5 rounded-xl transition-colors outline-none border-none cursor-pointer text-left">
                                                    <LogOut className="w-4 h-4 border-none" /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-[13px] font-bold text-white bg-[#106EBE] hover:bg-[#0e5c9f] px-4 py-1.5 rounded-[10px] transition-all shadow-sm hover:shadow outline-none border-none cursor-pointer">
                                    <User className="w-4 h-4 border-none" /> Sign In
                                </button>
                            )}
                        </div>

                        <div className="flex items-center md:hidden z-50 border-none">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2.5 text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900/90 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full border-none outline-none cursor-pointer shadow-md transition-colors flex items-center justify-center"
                            >
                                <Menu className="w-6 h-6 border-none" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`md:hidden fixed inset-0 z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>

                <div className={`absolute top-0 right-0 w-[85%] max-w-[340px] h-full bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
                        {session ? (
                            <div className="flex flex-col w-full border-none pr-2">
                                <div className="flex items-center gap-3 cursor-pointer group border-none" onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}>
                                    <Avatar url={profile?.avatar_url} frameId={profile?.active_frame} containerClass="w-9 h-9 shrink-0" scale={0.35} />
                                    <div className="flex flex-col border-none min-w-0">
                                        <span className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[130px] border-none">{profile?.name || (session?.user?.email || '').split('@')[0]}</span>
                                        <span className="text-[10px] text-zinc-500 font-bold group-hover:text-[#106EBE] transition-colors flex items-center gap-1 border-none mt-0.5">
                                            Opsi Akun <ChevronDown className={`w-3 h-3 transition-transform ${isMobileProfileDropdownOpen ? 'rotate-180' : ''} border-none`} />
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex flex-col overflow-hidden transition-all duration-300 border-none ${isMobileProfileDropdownOpen ? 'max-h-[160px] mt-3 opacity-100' : 'max-h-0 opacity-0 mt-0'}`}>
                                    <a href="/profile" onClick={() => { setIsMobileMenuOpen(false); setIsMobileProfileDropdownOpen(false); }} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white font-bold transition-colors text-[12px] border-none outline-none cursor-pointer">
                                        <Settings className="w-3.5 h-3.5 border-none" /> Pengaturan Profil
                                    </a>
                                    <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2 mt-0.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white font-bold transition-colors text-[12px] border-none outline-none text-left cursor-pointer">
                                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5 border-none" /> : <Moon className="w-3.5 h-3.5 border-none" />}
                                        <span className="border-none">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                    </button>
                                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 mt-0.5 rounded-xl hover:bg-red-50 dark:hover:bg-white/10 text-red-500 font-bold transition-colors text-[12px] border-none outline-none text-left cursor-pointer">
                                        <LogOut className="w-3.5 h-3.5 border-none" /> Keluar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className="flex items-center gap-2 bg-[#106EBE] hover:bg-[#0e5c9f] text-white font-bold text-xs px-3.5 py-2 rounded-[10px] transition-colors shadow-sm outline-none border-none cursor-pointer">
                                <User className="w-4 h-4 border-none" /> Sign In
                            </button>
                        )}
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 shrink-0 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] transition-colors outline-none border-none cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5 custom-scrollbar">
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); setShowSearchModal(true); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-bold transition-colors w-full text-left mb-2 outline-none border-none cursor-pointer"
                        >
                            <Search className="w-4 h-4 text-[#106EBE]" /> Search videos...
                        </button>

                        <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors cursor-pointer">
                            <Home className="w-4 h-4 text-[#106EBE]" /> Home
                        </a>
                        <a href="/jelajahi" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors cursor-pointer">
                            <Compass className="w-4 h-4 text-[#106EBE]" /> Explore
                        </a>
                        <a href="/populer" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors cursor-pointer">
                            <Flame className="w-4 h-4 text-[#106EBE]" /> Trending
                        </a>
                        <a href="/koleksi" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors cursor-pointer">
                            <FolderOpen className="w-4 h-4 text-[#106EBE]" /> Library
                        </a>

                        <div className="flex flex-col gap-1 mt-1">
                            <button onClick={() => setIsMobilePremiumOpen(!isMobilePremiumOpen)} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold w-full text-left group cursor-pointer">
                                <div className="flex items-center gap-3"><Crown className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE]" /> Profesional Site</div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobilePremiumOpen ? 'rotate-180 text-[#106EBE]' : ''}`} />
                            </button>
                            <div className={`flex flex-col ml-8 overflow-hidden transition-all duration-300 ${isMobilePremiumOpen ? 'max-h-[400px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                {categoryList.map((cat, idx) => (
                                    <a key={idx} href={`/category/${generateSeoSlug(cat)}`} onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] transition-colors cursor-pointer">{cat}</a>
                                ))}
                            </div>
                        </div>

                        <a href="/ai" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors mt-1 cursor-pointer ${pathname === '/ai' ? 'text-indigo-500 font-bold' : 'text-zinc-900 dark:text-white font-bold hover:text-indigo-500'}`}>
                            <Bot className="w-4 h-4" /> 
                            <span>AI Shorts</span>
                        </a>

                        <a href="https://trakteer.id/shadowclips" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 transition-colors mt-1 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-bold group bg-transparent cursor-pointer">
                            <Coffee className="w-4 h-4 group-hover:animate-bounce" /> 
                            <span>Traktir Support</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Modal Pencarian */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar animate-in fade-in duration-300 border-none">
                    <div className="min-h-screen px-4 sm:px-8 py-10 md:py-16 flex flex-col items-center border-none">
                        <button onClick={closeAndClearSearch} className="fixed top-6 right-6 md:top-10 md:right-10 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] transition-colors bg-zinc-100 dark:bg-zinc-900 rounded-full z-50 shadow-md outline-none border-none cursor-pointer">
                            <X className="w-6 h-6 md:w-8 md:h-8 border-none" />
                        </button>
                        <div className="w-full max-w-4xl relative animate-in slide-in-from-top-8 duration-500 mb-10 sticky top-0 z-40 pt-4 border-none">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-zinc-400 dark:text-zinc-500 mt-2 border-none" />
                            <input autoFocus type="text" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Type keywords to search..." className="w-full bg-white dark:bg-zinc-900 rounded-full py-5 md:py-6 pl-16 md:pl-20 pr-8 text-lg md:text-2xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-0 shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all border-none outline-none" />
                        </div>
                        <div className="w-full max-w-[1440px] animate-in fade-in duration-700 border-none">
                            {isSearching ? (
                                <div className="flex justify-center py-32 border-none">
                                    <div className="w-14 h-14 border-4 border-zinc-200 dark:border-zinc-800 border-t-[#106EBE] rounded-full animate-spin shadow-md"></div>
                                </div>
                            ) : debouncedSearch && searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-y-8 md:gap-x-6 pb-20 border-none">
                                    {searchResults.map((video) => (
                                        <div key={video.id} onClick={() => { window.location.href = `/streaming/${video.slug || video.id}`; closeAndClearSearch(); }} className="group cursor-pointer flex flex-col gap-2 border-none">
                                            <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-200 dark:bg-zinc-900 border-none">
                                                <img src={getImageUrl(video.thumbnail_url || video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 border-none" loading="lazy" />
                                            </div>
                                            <div className="px-1 text-center border-none">
                                                <h3 className="font-bold text-[13px] md:text-[14px] text-zinc-800 dark:text-zinc-300 group-hover:text-[#106EBE] transition-colors line-clamp-2 leading-snug border-none" title={video.title}>
                                                    {video.title}
                                                </h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : debouncedSearch && searchResults.length === 0 ? (
                                <div className="text-center py-32 text-zinc-400 dark:text-zinc-500 border-none">
                                    <Search className="w-16 h-16 mx-auto mb-4 opacity-30 dark:opacity-20 border-none" />
                                    <p className="text-xl border-none">No results found for "{debouncedSearch}"</p>
                                </div>
                            ) : (
                                <div className="text-center py-32 text-zinc-500 dark:text-zinc-600 border-none">
                                    <p className="text-lg border-none">Type something to start searching for videos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}