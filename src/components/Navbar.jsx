import React, { useState, useEffect, useContext, useRef } from 'react';
import useSWR from 'swr';
import { Search, Menu, X, Home, Compass, Flame, FolderOpen, Crown, ChevronDown, Sun, Moon, LogIn, LogOut, User, Settings, Download } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import ModalLogin from './ModalLogin';
import Avatar from './Avatar';

const generateSeoSlug = (categoryName) => categoryName ? categoryName.toLowerCase().trim().replace(/\s+/g, '-') : '';

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

    const profileDropdownRef = useRef(null);

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const getImageUrl = (url) => url || '';

    const fetchProfile = async (userId) => {
        if (!supabase || !userId) return;
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
            if (error) throw error;
            if (data) setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setIsProfileDropdownOpen(false);
        setIsMobileProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    useEffect(() => {
        if (showSearchModal || isLoginModalOpen || isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showSearchModal, isLoginModalOpen, isMobileMenuOpen]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(localSearch), 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    const fetchSearchResults = async (query) => {
        if (!supabase || !query) return [];
        const { data, error } = await supabase.from('videos')
            .select('*').or(`title.ilike.%${query}%,category.ilike.%${query}%`)
            .order('created_at', { ascending: false }).limit(24);
        if (error) throw new Error(error.message);
        return data || [];
    };

    const { data: searchResults = [], isLoading: isSearching } = useSWR(
        (showSearchModal && debouncedSearch && supabase) ? ['navbar_search', debouncedSearch] : null,
        () => fetchSearchResults(debouncedSearch), { revalidateOnFocus: false }
    );

    const fetchCategoriesWithLabel = async () => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('videos')
            .select('category, labels')
            .not('category', 'is', null);

        if (error || !data) return [];

        const categories = [];
        data.forEach(item => {
            if (item.category && item.labels) {
                const labelStr = typeof item.labels === 'string' ? item.labels : JSON.stringify(item.labels);
                if (labelStr.toLowerCase().includes('profesional site')) {
                    categories.push(item.category);
                }
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

    return (
        <>
            <ModalLogin isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} supabase={supabase} />
            <nav className={`fixed top-0 w-full z-[60] transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-zinc-950 dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-950 dark:to-[#106EBE]/10 backdrop-blur-md py-3 shadow-sm dark:shadow-none border-none' : 'bg-gradient-to-b from-white/90 dark:from-zinc-950/90 to-transparent dark:to-transparent py-5 border-none'}`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex justify-between items-center border-none">

                    <div className="flex items-center gap-8 lg:gap-12 border-none">
                        <a href="/" className="flex items-center gap-2.5 z-50 outline-none border-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-none drop-shadow-lg">
                                <defs>
                                    <clipPath id="play-clip">
                                        <path d="M22 25.5C22 18.5 29.5 14 35.5 17.5L82.5 44.5C88.5 48 88.5 57 82.5 60.5L35.5 87.5C29.5 91 22 86.5 22 79.5V25.5Z" />
                                    </clipPath>
                                    <linearGradient id="grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#32ADFF" />
                                        <stop offset="100%" stopColor="#007AFF" />
                                    </linearGradient>
                                    <linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#007AFF" />
                                        <stop offset="100%" stopColor="#0052CC" />
                                    </linearGradient>
                                    <linearGradient id="grad-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#003D82" />
                                        <stop offset="100%" stopColor="#001233" />
                                    </linearGradient>
                                </defs>
                                <g clipPath="url(#play-clip)">
                                    <polygon points="0,0 100,0 100,52.5 45,52.5" fill="url(#grad-top)" />
                                    <polygon points="0,100 45,52.5 100,52.5 100,100" fill="url(#grad-bottom)" />
                                    <polygon points="0,0 45,52.5 0,100" fill="url(#grad-left)" />
                                </g>
                            </svg>

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
                            <a href="/" className={`flex items-center gap-1.5 group transition-colors outline-none border-none ${pathname === '/' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Home className="w-4 h-4 border-none" /> Home
                            </a>
                            <a href="/jelajahi" className={`flex items-center gap-1.5 group transition-colors outline-none border-none ${pathname === '/jelajahi' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Compass className="w-4 h-4 border-none" /> Explore
                            </a>
                            <a href="/populer" className={`flex items-center gap-1.5 group transition-colors outline-none border-none ${pathname === '/populer' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Flame className="w-4 h-4 border-none" /> Trending
                            </a>
                            <a href="/koleksi" className={`flex items-center gap-1.5 group transition-colors outline-none border-none ${pathname === '/koleksi' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <FolderOpen className="w-4 h-4 border-none" /> Library
                            </a>

                            <div className="relative group cursor-pointer py-2 ml-2 border-none">
                                <div className={`flex items-center gap-1.5 transition-colors outline-none border-none ${pathname.startsWith('/category') ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                    <Crown className="w-4 h-4 transition-colors border-none" /> Profesional Site <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300 border-none" />
                                </div>
                                <div className="absolute top-full left-0 w-full h-4 bg-transparent border-none"></div>
                                <div className="absolute top-[calc(100%+0.5rem)] left-0 w-56 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100">
                                    {categoryList.length > 0 ? (
                                        categoryList.map((cat, idx) => (
                                            <a key={idx} href={`/category/${generateSeoSlug(cat)}`} className="px-4 py-2.5 text-[13px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#106EBE] dark:hover:text-[#106EBE] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2 outline-none border-none">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#106EBE] border-none"></div> {cat}
                                            </a>
                                        ))
                                    ) : (
                                        <span className="px-4 py-2.5 text-[12px] text-zinc-400 italic">Memuat kategori...</span>
                                    )}
                                </div>
                            </div>

                            <a href="/download-apk" className={`flex items-center gap-1.5 group transition-colors outline-none border-none ml-2 ${pathname === '/download-apk' ? 'text-[#106EBE]' : 'text-zinc-600 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE]'}`}>
                                <Download className="w-4 h-4 border-none" /> APK
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-none">
                        <div className="hidden md:flex relative group cursor-text z-50" onClick={() => setShowSearchModal(true)}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors w-4 h-4 border-none" />
                            <div className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-900 rounded-full py-2 pl-11 pr-5 w-56 lg:w-64 transition-colors duration-300 text-sm text-zinc-500 flex items-center select-none border-none outline-none">
                                Search videos...
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-4 border-none z-50 ml-2">
                            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 border-none"></div>

                            {session ? (
                                <div className="relative border-none" ref={profileDropdownRef}>
                                    <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2.5 p-1 pl-3 bg-zinc-100 dark:bg-zinc-900/80 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors outline-none border-none cursor-pointer">
                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate border-none">
                                            {profile?.name || (session?.user?.email || '').split('@')[0] || 'User'}
                                        </span>
                                        <Avatar url={profile?.avatar_url} frameId={profile?.active_frame} containerClass="w-8 h-8" scale={0.32} />
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-none overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-none border-b border-zinc-100 dark:border-zinc-800">
                                                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 border-none">Masuk Sebagai</p>
                                                <p className="text-[13px] font-bold text-zinc-900 dark:text-white truncate border-none">{session?.user?.email}</p>
                                                {profile?.is_premium && <span className="inline-block mt-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-[4px] uppercase tracking-wider font-bold border-none">Premium VIP</span>}
                                            </div>

                                            <div className="flex flex-col p-2 border-none">
                                                <a href="/profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-zinc-600 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/10 rounded-xl transition-colors outline-none border-none cursor-pointer">
                                                    <Settings className="w-4 h-4 border-none" /> Pengaturan Profil
                                                </a>

                                                <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-zinc-600 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/10 rounded-xl transition-colors outline-none border-none cursor-pointer text-left">
                                                    {theme === 'dark' ? <Sun className="w-4 h-4 border-none" /> : <Moon className="w-4 h-4 border-none" />}
                                                    <span className="border-none">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                                </button>

                                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 border-none"></div>

                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-red-500 dark:text-white hover:bg-red-50 dark:hover:bg-white/10 rounded-xl transition-colors outline-none border-none cursor-pointer text-left">
                                                    <LogOut className="w-4 h-4 border-none" /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-[13px] font-bold text-white bg-[#106EBE] hover:bg-[#0e5c9f] px-4 py-1.5 rounded-[10px] transition-all shadow-sm hover:shadow outline-none border-none cursor-pointer">
                                    <User className="w-4 h-4 border-none" /> Login
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 md:hidden z-50 border-none">
                            <button onClick={() => setShowSearchModal(true)} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors border-none outline-none cursor-pointer">
                                <Search className="w-5 h-5 border-none" />
                            </button>
                            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 ml-1 text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full border-none outline-none cursor-pointer shadow-sm transition-colors">
                                <Menu className="w-5 h-5 border-none" />
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            <div className={`md:hidden fixed inset-0 z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>

                <div className={`absolute top-0 right-0 w-[80%] max-w-[320px] h-full bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    <div className="p-5 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800/60">
                        {session ? (
                            <div className="flex flex-col w-full border-none pr-3">
                                <div className="flex items-center gap-3 cursor-pointer group border-none" onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}>
                                    <Avatar url={profile?.avatar_url} frameId={profile?.active_frame} containerClass="w-10 h-10 shrink-0" scale={0.4} />
                                    <div className="flex flex-col border-none min-w-0">
                                        <span className="text-sm font-black text-zinc-900 dark:text-white truncate max-w-[140px] border-none">{profile?.name || (session?.user?.email || '').split('@')[0]}</span>
                                        <span className="text-[10px] text-zinc-500 font-bold group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors flex items-center gap-1 border-none mt-0.5">
                                            Opsi Akun <ChevronDown className={`w-3 h-3 transition-transform ${isMobileProfileDropdownOpen ? 'rotate-180' : ''} border-none`} />
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex flex-col overflow-hidden transition-all duration-300 border-none ${isMobileProfileDropdownOpen ? 'max-h-[160px] mt-4 opacity-100' : 'max-h-0 opacity-0 mt-0'}`}>
                                    <a href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white font-bold transition-colors text-[13px] border-none outline-none">
                                        <Settings className="w-4 h-4 border-none" /> Pengaturan Profil
                                    </a>

                                    <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white font-bold transition-colors text-[13px] border-none outline-none text-left">
                                        {theme === 'dark' ? <Sun className="w-4 h-4 border-none" /> : <Moon className="w-4 h-4 border-none" />}
                                        <span className="border-none">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                    </button>

                                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl hover:bg-red-50 dark:hover:bg-white/10 text-red-500 dark:text-white font-bold transition-colors text-[13px] border-none outline-none text-left">
                                        <LogOut className="w-4 h-4 border-none" /> Keluar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className="flex items-center gap-2 bg-[#106EBE] hover:bg-[#0e5c9f] text-white font-bold text-[13px] px-4 py-2 rounded-[10px] transition-colors shadow-sm outline-none border-none cursor-pointer">
                                <User className="w-4 h-4 border-none" /> Sign In
                            </button>
                        )}
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 shrink-0 self-start bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors outline-none border-none">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
                        <a href="/" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors">
                            <Home className="w-5 h-5 text-[#106EBE]" /> Home
                        </a>
                        <a href="/jelajahi" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors">
                            <Compass className="w-5 h-5 text-[#106EBE]" /> Explore
                        </a>
                        <a href="/populer" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors">
                            <Flame className="w-5 h-5 text-[#106EBE]" /> Trending
                        </a>
                        <a href="/koleksi" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors">
                            <FolderOpen className="w-5 h-5 text-[#106EBE]" /> Library
                        </a>

                        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/60 my-2"></div>

                        <div className="flex flex-col gap-1">
                            <button onClick={() => setIsMobilePremiumOpen(!isMobilePremiumOpen)} className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold w-full text-left group">
                                <div className="flex items-center gap-3"><Crown className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors" /> Profesional Site</div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobilePremiumOpen ? 'rotate-180 text-[#106EBE]' : ''}`} />
                            </button>
                            <div className={`flex flex-col ml-8 overflow-hidden transition-all duration-300 ${isMobilePremiumOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                {categoryList.map((cat, idx) => (
                                    <a key={idx} href={`/category/${generateSeoSlug(cat)}`} className="py-2.5 px-4 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors">{cat}</a>
                                ))}
                            </div>
                        </div>

                        <a href="/download-apk" className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white font-bold transition-colors mt-2">
                            <Download className="w-5 h-5 text-[#106EBE]" /> APK
                        </a>
                    </div>
                </div>
            </div>

            {showSearchModal && (
                <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar animate-in fade-in duration-300 border-none">
                    <div className="min-h-screen px-4 sm:px-8 py-10 md:py-16 flex flex-col items-center border-none">
                        <button onClick={closeAndClearSearch} className="fixed top-6 right-6 md:top-10 md:right-10 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-[#106EBE] dark:hover:text-[#106EBE] transition-colors bg-zinc-100 dark:bg-zinc-900 rounded-full z-50 shadow-md outline-none border-none cursor-pointer">
                            <X className="w-6 h-6 md:w-8 md:h-8 border-none" />
                        </button>
                        <div className="w-full max-w-4xl relative animate-in slide-in-from-top-8 duration-500 mb-10 sticky top-0 z-40 pt-4 border-none">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-zinc-400 dark:text-zinc-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] mt-2 border-none" />
                            <input autoFocus type="text" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Type keywords to search..." className="w-full bg-white dark:bg-zinc-900 rounded-full py-5 md:py-6 pl-16 md:pl-20 pr-8 text-lg md:text-2xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-0 shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all border-none outline-none group" />
                        </div>
                        <div className="w-full max-w-[1440px] animate-in fade-in duration-700 border-none">
                            {isSearching ? (
                                <div className="flex justify-center py-32 border-none">
                                    <div className="w-14 h-14 border-4 border-zinc-200 dark:border-zinc-800 border-t-[#106EBE] rounded-full animate-spin shadow-md"></div>
                                </div>
                            ) : debouncedSearch && searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-y-8 md:gap-x-6 pb-20 border-none">
                                    {searchResults.map((video) => (
                                        <div key={video.id} onClick={() => window.location.href = `/streaming/${video.slug || video.id}`} className="group cursor-pointer flex flex-col gap-2 border-none">
                                            <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-200 dark:bg-zinc-900 border-none">
                                                <img src={getImageUrl(video.img)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 border-none" loading="lazy" />
                                            </div>
                                            <div className="px-1 text-center border-none">
                                                <h3 className="font-bold text-[13px] md:text-[14px] text-zinc-800 dark:text-zinc-300 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] transition-colors line-clamp-2 leading-snug border-none" title={video.title}>
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