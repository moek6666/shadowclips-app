import React from 'react';
import { MailCheck, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function VerifyEmail() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">

            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-zinc-100 dark:border-zinc-800/50 text-center relative overflow-hidden">

                {/* Efek Cahaya di Belakang */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#106EBE]/20 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-[#106EBE]/10 dark:bg-[#106EBE]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MailCheck className="w-10 h-10 text-[#106EBE] dark:text-[#0FFCBE]" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                        Cek Kotak Masuk Anda!
                    </h1>

                    <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                        Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan klik tautan tersebut untuk mengaktifkan akun <strong className="text-zinc-800 dark:text-zinc-200">ShadowClips</strong> Anda.
                    </p>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-8 border border-zinc-100 dark:border-zinc-700/50 flex items-start gap-3 text-left">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200 mb-1">Tidak menerima email?</h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Coba periksa folder <strong>Spam</strong> atau <strong>Junk</strong> Anda. Proses pengiriman biasanya memakan waktu kurang dari 1 menit.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-4 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                    </button>
                </div>
            </div>

            <p className="text-zinc-400 dark:text-zinc-600 text-[11px] font-medium mt-8">
                © {new Date().getFullYear()} ShadowClips. All rights reserved.
            </p>
        </div>
    );
}