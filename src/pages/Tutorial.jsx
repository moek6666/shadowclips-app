import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, ThumbsUp, MessageSquare, Unlock, Download, Users, Lightbulb, Crown, Globe, Star, Sparkles, Zap, UserCircle, Check, Gift } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Tutorial({ supabase }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState('guide');
    const [lang, setLang] = useState('id');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLang(prev => prev === 'id' ? 'en' : 'id');
    };

    const dict = {
        id: {
            titleGuide: 'Cara Akses Video',
            descGuide: 'Panduan singkat langkah demi langkah untuk membuka video premium dan mendapatkan tautan unduhan kecepatan tinggi.',
            titleVip: 'Hak Istimewa Premium VIP',
            descVip: 'Tingkatkan pengalaman Anda dengan fitur eksklusif, tampilan mewah, dan kebebasan penuh di komunitas ShadowClips.',
            titleAvatar: 'Membuka Bingkai Avatar',
            descAvatar: 'Panduan detail cara mengumpulkan poin interaksi dan mengaktifkan bingkai animasi eksklusif untuk profil Anda.',
            titleConcept: 'Filosofi Komunitas Kami',
            descConcept: 'Memahami alasan kami menggunakan sistem berbasis interaksi alih-alih biaya langganan bulanan yang mahal.',

            tabGuide: 'Panduan Akses',
            tabVip: 'Keuntungan VIP',
            tabAvatar: 'Buka Avatar',
            tabConcept: 'Mengapa Login?',
            langBtn: 'Switch to English',

            step1Title: 'Login dengan Aman',
            step1Desc: 'Untuk berinteraksi dengan konten premium kami, Anda harus login menggunakan akun Google. Proses ini cepat, aman, dan tanpa perlu mendaftar ribet.',
            step2Title: 'Like & Komentar',
            step2Desc: 'Klik tombol Like dan tinggalkan Komentar yang bermakna di kolom diskusi di bawah video yang terkunci.',
            step3Title: 'Nikmati Streaming & Download',
            step3Desc: 'Setelah Anda berhasil menyukai dan memposting komentar, pemutar video eksklusif dan tautan unduhan langsung terbuka untuk Anda nikmati.',

            vip1Title: 'Donasi via Saweria',
            vip1Desc: 'Klik tombol Donasi pada video Premium yang terkunci. Syarat mutlak: Anda wajib memasukkan alamat Email Google yang terdaftar di ShadowClips pada kolom pesan Saweria.',
            vip2Title: 'Akses Premium Otomatis',
            vip2Desc: 'Sistem webhook kami akan membaca transaksi Anda dan mengubah status akun menjadi VIP detik itu juga. Anda bisa langsung menonton video berbayar tanpa hambatan.',
            vip3Title: 'Bonus Poin & Mahkota Emas',
            vip3Desc: 'Setiap nominal donasi akan dikonversi menjadi poin dalam jumlah besar untuk membuka bingkai Avatar mewah secara instan, ditambah lencana Mahkota Emas permanen di nama Anda.',

            stepA1Title: 'Kumpulkan Poin Interaksi',
            stepA1Desc: 'Sistem bingkai avatar kami menggunakan poin sebagai syarat utama. Anda bisa mendapatkan poin dengan cara aktif memberikan Like dan memposting Komentar yang relevan pada video-video yang ada di platform ShadowClips.',
            stepA2Title: 'Cek Progres di Profil',
            stepA2Desc: 'Buka halaman Profil Anda. Di sana terdapat "Progress Bar" elegan yang menunjukkan jumlah "Total Points" Anda saat ini, serta pratinjau bingkai avatar dari target "Next Reward" selanjutnya.',
            stepA3Title: 'Pilih & Simpan Bingkai',
            stepA3Desc: 'Setelah poin Anda mencapai target, bingkai yang terkunci akan terbuka otomatis. Buka menu dropdown "Avatar Border" di pengaturan profil, pilih bingkai animasi tersebut, lalu klik tombol "Save Changes" untuk menerapkannya.',

            c1Title: 'Tanpa Paywall, Hanya Interaksi',
            c1Desc: 'Kami percaya konten eksklusif harus bisa diakses secara adil. Daripada membebankan biaya langganan bulanan yang kaku, kami menggunakan sistem berbasis interaksi atau donasi sukarela.',
            c2Title: 'Membangun Komunitas Asli',
            c2Desc: 'Dengan mewajibkan login Google yang aman untuk berkomentar, kami menyaring bot, spam, dan akun palsu. Ini memastikan bahwa setiap diskusi di ShadowClips adalah otentik dan aman.',
            c3Title: 'Mendukung Ekosistem',
            c3Desc: 'Setiap like, komentar bijak, dan donasi yang Anda berikan memotivasi kurator dan kreator kami untuk terus menghadirkan video eksklusif berkualitas tinggi secara konsisten.',
            c4Title: 'Privasi Terjaga:',
            c4Desc: 'Kami hanya menggunakan profil Google Anda untuk autentikasi dasar (Nama & Avatar). Kami tidak memiliki akses ke data rahasia Anda. 100% aman.'
        },
        en: {
            titleGuide: 'How to Unlock Videos',
            descGuide: 'A quick step-by-step guide to unlocking premium videos and getting high-speed download links.',
            titleVip: 'Premium VIP Privileges',
            descVip: 'Elevate your experience with exclusive features, luxurious displays, and ultimate freedom in the ShadowClips community.',
            titleAvatar: 'Unlocking Avatar Borders',
            descAvatar: 'A detailed guide on how to earn engagement points and activate exclusive animated frames for your profile.',
            titleConcept: 'Our Community Philosophy',
            descConcept: 'Understanding why we use an engagement-based unlock system instead of expensive paid monthly subscriptions.',

            tabGuide: 'Access Guide',
            tabVip: 'VIP Benefits',
            tabAvatar: 'Unlock Avatar',
            tabConcept: 'Why Login?',
            langBtn: 'Ganti ke Indonesia',

            step1Title: 'Sign In Securely',
            step1Desc: 'To interact with our premium content, you must first log in using your Google account. It\'s fast, secure, and requires no manual registration.',
            step2Title: 'Like & Comment',
            step2Desc: 'Show some love to the creators! Click the Like button and leave a meaningful Comment in the discussion section below the locked video.',
            step3Title: 'Enjoy Stream & Downloads',
            step3Desc: 'Once you have successfully liked and posted a comment, the exclusive video player and the high-speed download links will instantly unlock for you to enjoy.',

            vip1Title: 'Donate via Saweria',
            vip1Desc: 'Click the Donate button on locked Premium videos. Strict requirement: You must enter your exact Google Email registered on ShadowClips in the Saweria message box.',
            vip2Title: 'Automated Premium Access',
            vip2Desc: 'Our webhook system will read your transaction and upgrade your account to VIP instantly. You can immediately watch paid videos without any hurdles.',
            vip3Title: 'Bonus Points & Gold Crown',
            vip3Desc: 'Every donation amount is converted into massive points to unlock luxurious Avatar borders instantly, plus a permanent Gold Crown badge next to your name.',

            stepA1Title: 'Earn Engagement Points',
            stepA1Desc: 'Our avatar border system uses points as the main requirement. You can earn points by actively liking videos and posting relevant comments across the ShadowClips platform.',
            stepA2Title: 'Check Profile Progress',
            stepA2Desc: 'Navigate to your Profile page. There, you will find an elegant "Progress Bar" showing your current "Total Points", as well as a visual preview of your upcoming "Next Reward".',
            stepA3Title: 'Select & Save Border',
            stepA3Desc: 'Once you hit the points target, the locked borders will automatically unlock. Open the "Avatar Border" dropdown in your profile settings, select the animated frame, and click "Save Changes" to apply it.',

            c1Title: 'No Paywalls, Just Engagement',
            c1Desc: 'We believe exclusive content should be accessible fairly. Instead of rigid monthly fees, we use an engagement-based system and voluntary donations.',
            c2Title: 'Building an Authentic Community',
            c2Desc: 'By requiring a secure Google login to leave a comment, we effectively filter out bots and spam. This ensures that every discussion on ShadowClips is authentic.',
            c3Title: 'Supporting the Ecosystem',
            c3Desc: 'Every like, thoughtful comment, and donation you leave motivates our curators to keep delivering high-quality, exclusive videos consistently.',
            c4Title: 'Privacy First:',
            c4Desc: 'We only use your Google profile for basic authentication (Name & Avatar). We do not have access to your private data. 100% safe.'
        }
    };

    const text = dict[lang];

    const tabs = [
        { id: 'guide', label: text.tabGuide, icon: <Unlock className="w-5 h-5" /> },
        { id: 'vip', label: text.tabVip, icon: <Crown className="w-5 h-5" /> },
        { id: 'avatar', label: text.tabAvatar, icon: <UserCircle className="w-5 h-5" /> },
        { id: 'concept', label: text.tabConcept, icon: <Lightbulb className="w-5 h-5" /> }
    ];

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} supabase={supabase} />

            <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen transition-colors duration-300 border-none font-sans">
                <div className="mb-10 sm:mb-14 relative border-none">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-none">
                        <div className="border-none max-w-2xl">
                            <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight transition-colors border-none leading-tight">
                                {activeTab === 'guide' && text.titleGuide}
                                {activeTab === 'vip' && text.titleVip}
                                {activeTab === 'avatar' && text.titleAvatar}
                                {activeTab === 'concept' && text.titleConcept}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg transition-colors border-none leading-relaxed">
                                {activeTab === 'guide' && text.descGuide}
                                {activeTab === 'vip' && text.descVip}
                                {activeTab === 'avatar' && text.descAvatar}
                                {activeTab === 'concept' && text.descConcept}
                            </p>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#106EBE] dark:hover:text-[#106EBE] px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border-none shrink-0 cursor-pointer outline-none"
                        >
                            <Globe className="w-5 h-5 text-[#106EBE] border-none" />
                            {text.langBtn}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-10 lg:gap-20 border-none">
                    <div className="w-full md:w-56 flex-shrink-0 border-none">
                        <div className="flex flex-row md:flex-col gap-4 md:gap-6 sticky top-32 overflow-x-auto hide-scrollbar pb-2 md:pb-0 border-b border-zinc-200 dark:border-zinc-800/50 md:border-none transition-colors">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3.5 px-4 py-3 md:py-4 rounded-xl text-left transition-all group whitespace-nowrap border-none outline-none cursor-pointer ${activeTab === tab.id ? 'bg-[#106EBE]/10 text-[#106EBE] dark:text-[#106EBE] font-black' : 'text-zinc-500 dark:text-zinc-500 font-bold hover:text-[#106EBE] dark:hover:text-[#106EBE] hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                        }`}
                                >
                                    <span className={`transition-colors border-none ${activeTab === tab.id ? 'text-[#106EBE] dark:text-[#106EBE]' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE]'}`}>
                                        {tab.icon}
                                    </span>
                                    <span className="tracking-wide text-[14px] sm:text-[15px] border-none">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[400px] border-none">
                        {activeTab === 'guide' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl border-none">
                                <div className="flex flex-col gap-10 sm:gap-14 border-none">
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none border-none">01</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none">{text.step1Title}</h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.step1Desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none border-none">02</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.step2Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><ThumbsUp className="w-4 h-4 border-none" /> <MessageSquare className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.step2Desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-[#106EBE] dark:group-hover:text-[#106EBE] tracking-tighter leading-none mt-1 select-none border-none">03</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.step3Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Play className="w-4 h-4 border-none" /> <Download className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.step3Desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'vip' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl border-none">
                                <div className="flex flex-col gap-10 sm:gap-14 border-none">
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-amber-500 dark:group-hover:text-amber-500 tracking-tighter leading-none mt-1 select-none border-none">01</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.vip1Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Gift className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.vip1Desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-amber-500 dark:group-hover:text-amber-500 tracking-tighter leading-none mt-1 select-none border-none">02</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.vip2Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Crown className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.vip2Desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-amber-500 dark:group-hover:text-amber-500 tracking-tighter leading-none mt-1 select-none border-none">03</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.vip3Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Zap className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.vip3Desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'avatar' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl border-none">
                                <div className="flex flex-col gap-10 sm:gap-14 border-none">
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-teal-500 dark:group-hover:text-teal-500 tracking-tighter leading-none mt-1 select-none border-none">01</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.stepA1Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Star className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.stepA1Desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-teal-500 dark:group-hover:text-teal-500 tracking-tighter leading-none mt-1 select-none border-none">02</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.stepA2Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><UserCircle className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.stepA2Desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 sm:gap-8 group border-none">
                                        <div className="text-4xl sm:text-5xl font-black text-zinc-200 dark:text-zinc-800/80 transition-colors duration-500 group-hover:text-teal-500 dark:group-hover:text-teal-500 tracking-tighter leading-none mt-1 select-none border-none">03</div>
                                        <div className="pt-1 border-none">
                                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center flex-wrap gap-2 transition-colors border-none">
                                                {text.stepA3Title}
                                                <span className="flex items-center gap-1.5 ml-1 text-zinc-400 dark:text-zinc-500 border-none"><Check className="w-4 h-4 border-none" /></span>
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-[13px] sm:text-sm leading-relaxed transition-colors border-none">{text.stepA3Desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'concept' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 max-w-3xl border-none">
                                <div className="flex flex-col gap-10 sm:gap-12 pt-2 border-none">
                                    <div className="border-none">
                                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none flex items-center gap-3">
                                            <Star className="w-5 h-5 text-[#106EBE]" /> {text.c1Title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors border-none ml-8">{text.c1Desc}</p>
                                    </div>
                                    <div className="border-none">
                                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-[#106EBE]" /> {text.c2Title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors border-none ml-8">{text.c2Desc}</p>
                                    </div>
                                    <div className="border-none">
                                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight transition-colors border-none flex items-center gap-3">
                                            <ThumbsUp className="w-5 h-5 text-[#106EBE]" /> {text.c3Title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors border-none ml-8">{text.c3Desc}</p>
                                    </div>
                                    <div className="mt-4 pt-8 flex items-start gap-5 text-zinc-500 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors">
                                        <Users className="w-7 h-7 shrink-0 text-teal-500 dark:text-teal-400 border-none" />
                                        <p className="text-sm sm:text-base leading-relaxed border-none">
                                            <strong className="text-zinc-900 dark:text-white font-bold transition-colors border-none">{text.c4Title}</strong> {text.c4Desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}