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

            <div className="pt-32 pb-20 max-w-[1440px] mx-auto px-4 sm:px-8 min-h-screen transition-colors">

                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2 transition-colors">Legal & Policies</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 transition-colors">Legal information, privacy, and terms of service for ShadowClips.</p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent mb-8 transition-colors"></div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    <div className="w-full md:w-64 flex-shrink-0 md:border-r md:border-zinc-200 dark:md:border-zinc-800/80 md:pr-8 transition-colors">
                        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible custom-scrollbar sticky top-28 pb-4 md:pb-0">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl font-bold transition-all whitespace-nowrap md:whitespace-normal group border-transparent ${activeTab === item.id
                                        ? 'bg-[#106EBE] text-white shadow-md dark:shadow-[0_0_15px_rgba(16,110,190,0.4)]'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-[#106EBE] dark:hover:text-[#0FFCBE]'
                                        }`}
                                >
                                    <span className={`${activeTab === item.id ? 'text-white' : 'text-zinc-500 group-hover:text-[#106EBE] dark:group-hover:text-[#0FFCBE]'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    <ChevronRight className={`w-4 h-4 ml-auto md:block hidden ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 text-zinc-700 dark:text-zinc-300 leading-relaxed relative overflow-hidden md:pl-2 transition-colors">

                        {activeTab === 'dmca' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 transition-colors">
                                    <AlertTriangle className="w-6 h-6 text-[#106EBE]" /> DMCA Copyright Notice
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>ShadowClips respects the intellectual property of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to notices of alleged copyright infringement promptly and decisively.</p>

                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-8 mb-3 transition-colors">Reporting Procedure</h3>
                                    <p>If you believe that any content on ShadowClips violates your copyright, please send a notice including: material identification, specific URL, and your contact information via email to:</p>

                                    <div className="inline-block mt-2">
                                        <a
                                            href="mailto:shadowclips666@outlook.com"
                                            className="inline-flex items-center gap-2.5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-[#106EBE] dark:hover:border-[#0FFCBE] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[#106EBE] dark:text-[#106EBE] dark:hover:text-[#0FFCBE] font-bold px-5 py-3 rounded-xl transition-all shadow-sm dark:shadow-md group"
                                        >
                                            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            shadowclips666@outlook.com
                                        </a>
                                    </div>

                                    <div className="bg-[#106EBE]/5 dark:bg-[#106EBE]/10 border border-[#106EBE]/20 dark:border-[#106EBE]/30 rounded-xl p-5 mt-6 transition-colors">
                                        <p className="text-[#106EBE] font-medium">Please note that all video content on ShadowClips is not hosted on our servers. We only provide links (embeds) from third-party sources.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 transition-colors">
                                    <Shield className="w-6 h-6 text-[#106EBE]" /> Privacy Policy
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>This Privacy Policy explains how ShadowClips collects, uses, and protects your information.</p>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-8 mb-3 transition-colors">Data Collection</h3>
                                    <p>ShadowClips does not require users to register. However, our system may log basic information such as IP Addresses and browser types for standard analytics purposes.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'terms' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 transition-colors">
                                    <FileText className="w-6 h-6 text-[#106EBE]" /> Terms of Service
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>By accessing the ShadowClips website, you agree to be bound by these Terms of Service.</p>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-8 mb-3 transition-colors">Use of Service</h3>
                                    <p>Our services are provided "as is". You are prohibited from using this site for illegal purposes. Most video links are indexed from external providers, and we are not responsible for the content of such third parties.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === '2257' && (
                            <div className="animate-in fade-in duration-500 relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 transition-colors">
                                    <Scale className="w-6 h-6 md:w-8 md:h-8 text-[#106EBE]" /> 18 U.S.C. 2257 Compliance Statement
                                </h2>
                                <div className="space-y-6 text-sm sm:text-base">
                                    <p>All models, actors, actresses, and other personas appearing in any visual content on ShadowClips were at least 18 (eighteen) years of age at the time the images or videos were produced.</p>
                                    <p>In compliance with <strong className="text-zinc-900 dark:text-white transition-colors">18 U.S.C. § 2257</strong> and related regulations (Record-Keeping Requirements), ShadowClips declares that we are <strong className="text-zinc-900 dark:text-white transition-colors">not the primary producer</strong> of the content on this platform. The content presented is sourced entirely from third-party links (embeds) or independent creators uploaded outside our servers.</p>

                                    <p>Nevertheless, we are fully committed to complying with applicable laws. We have a zero-tolerance policy for illegal content. If you find content that violates legal provisions, please contact us at <a href="mailto:shadowclips666@outlook.com" className="text-[#106EBE] dark:hover:text-[#0FFCBE] font-bold hover:underline transition-all">shadowclips666@outlook.com</a> so we can immediately remove it from our search index.</p>
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