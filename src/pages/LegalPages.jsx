import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, ChevronRight, Scale, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LegalPages() {
    const [activeTab, setActiveTab] = useState('dmca');
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        const page = pathParts[pathParts.length - 1];
        if (['dmca', 'privacy', 'terms', '2257'].includes(page)) {
            setActiveTab(page);
        }
    }, []);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        window.history.pushState(null, '', `/page/${tabId}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const menuItems = [
        { id: 'dmca', label: 'DMCA Notice', icon: <AlertTriangle className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy Policy', icon: <Shield className="w-5 h-5" /> },
        { id: 'terms', label: 'Terms of Service', icon: <FileText className="w-5 h-5" /> },
        { id: '2257', label: '18 U.S.C. 2257', icon: <Scale className="w-5 h-5" /> },
    ];

    return (
        <>
            <Navbar searchInput={searchInput} setSearchInput={setSearchInput} isScrolled={isScrolled} />

            <div className="pt-32 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen">

                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Legal & Policies</h1>
                    <p className="text-zinc-400">Informasi hukum, privasi, dan ketentuan layanan ShadowClips.</p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-zinc-800 to-transparent mb-8"></div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    <div className="w-full md:w-64 flex-shrink-0 md:border-r md:border-zinc-800/80 md:pr-8">
                        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible custom-scrollbar sticky top-28 pb-4 md:pb-0">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl font-bold transition-all whitespace-nowrap md:whitespace-normal group ${activeTab === item.id
                                        ? 'bg-[#106EBE] text-white shadow-[0_0_15px_rgba(16,110,190,0.4)] border-transparent'
                                        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-[#0FFCBE]'
                                        }`}
                                >
                                    <span className={`${activeTab === item.id ? 'text-white' : 'text-zinc-500 group-hover:text-[#0FFCBE]'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    <ChevronRight className={`w-4 h-4 ml-auto md:block hidden ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 text-zinc-300 leading-relaxed relative overflow-hidden md:pl-2">

                        {activeTab === 'dmca' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                                    <AlertTriangle className="w-6 h-6 text-[#106EBE]" /> DMCA Copyright Notice
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>ShadowClips menghormati kekayaan intelektual orang lain dan kami mengharapkan pengguna kami juga melakukan hal yang sama. Sesuai dengan Digital Millennium Copyright Act (DMCA), kami akan merespons pemberitahuan dugaan pelanggaran hak cipta secara cepat dan tegas.</p>

                                    <h3 className="text-lg font-bold text-white mt-8 mb-3">Prosedur Laporan</h3>
                                    <p>Jika Anda yakin bahwa konten apa pun di ShadowClips melanggar hak cipta Anda, silakan kirimkan pemberitahuan yang mencakup: identifikasi materi, URL spesifik, dan informasi kontak Anda melalui email ke:</p>

                                    <div className="inline-block mt-2">
                                        <a
                                            href="mailto:shadowclips666@outlook.com"
                                            className="inline-flex items-center gap-2.5 bg-zinc-900/50 border border-zinc-800 hover:border-[#0FFCBE] hover:bg-zinc-800 text-[#106EBE] hover:text-[#0FFCBE] font-bold px-5 py-3 rounded-xl transition-all shadow-md group"
                                        >
                                            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            shadowclips666@outlook.com
                                        </a>
                                    </div>

                                    <div className="bg-[#106EBE]/10 border border-[#106EBE]/30 rounded-xl p-5 mt-6">
                                        <p className="text-[#106EBE] font-medium">Harap dicatat bahwa semua konten video di ShadowClips tidak di-host di server kami sendiri. Kami hanya menyediakan tautan (embed) dari sumber pihak ketiga.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                                    <Shield className="w-6 h-6 text-[#106EBE]" /> Privacy Policy
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>Kebijakan Privasi ini menjelaskan bagaimana ShadowClips mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>
                                    <h3 className="text-lg font-bold text-white mt-8 mb-3">Pengumpulan Data</h3>
                                    <p>ShadowClips tidak mewajibkan pengguna untuk mendaftar. Namun, sistem kami mungkin mencatat informasi dasar seperti Alamat IP dan jenis browser untuk keperluan analitik standar.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'terms' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                                    <FileText className="w-6 h-6 text-[#106EBE]" /> Terms of Service
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>Dengan mengakses situs web ShadowClips, Anda setuju untuk terikat oleh Ketentuan Layanan ini.</p>
                                    <h3 className="text-lg font-bold text-white mt-8 mb-3">Penggunaan Layanan</h3>
                                    <p>Layanan kami disediakan "sebagaimana adanya". Anda dilarang menggunakan situs ini untuk tujuan ilegal. Sebagian besar tautan video diindeks dari penyedia eksternal, dan kami tidak bertanggung jawab atas isi konten pihak ketiga tersebut.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === '2257' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                                    <Scale className="w-6 h-6 md:w-8 md:h-8 text-[#106EBE]" /> 18 U.S.C. 2257 Compliance Statement
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>Semua model, aktor, aktris, dan persona lain yang muncul dalam konten visual apa pun di ShadowClips setidaknya berusia 18 (delapan belas) tahun pada saat pembuatan gambar atau video tersebut.</p>
                                    <p>Sesuai dengan <strong>18 U.S.C. § 2257</strong> dan peraturan terkait (Record-Keeping Requirements), ShadowClips menyatakan bahwa kami <strong>bukan produsen utama (primary producer)</strong> dari konten yang ada di platform ini. Konten yang disajikan bersumber sepenuhnya dari tautan pihak ketiga (embed) atau kreator independen yang diunggah di luar server kami.</p>

                                    <p>Meskipun demikian, kami berkomitmen penuh untuk mematuhi hukum yang berlaku. Kami memiliki kebijakan tanpa toleransi terhadap konten ilegal. Jika Anda menemukan konten yang melanggar ketentuan hukum, silakan hubungi kami di <a href="mailto:shadowclips666@outlook.com" className="text-[#106EBE] hover:text-[#0FFCBE] font-bold hover:underline transition-all">shadowclips666@outlook.com</a> agar dapat segera kami hapus dari indeks pencarian kami.</p>
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