import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TelegramCallback({ supabase }) {
    const [statusText, setStatusText] = useState('Memproses autentikasi Telegram...');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const handleTelegramAuth = async () => {
            if (!supabase) return;

            try {
                const params = new URLSearchParams(window.location.search);
                const tgId = params.get('id');
                const firstName = params.get('first_name');
                const username = params.get('username') || `user_${tgId}`;
                const hash = params.get('hash');

                if (!tgId || !hash) {
                    setErrorMsg('Data verifikasi Telegram tidak valid.');
                    return;
                }

                const syntheticEmail = `tg_${tgId}@shadowclips.asia`;
                const syntheticPassword = `tg_secure_${tgId}_shadowclips`;

                // Coba login langsung jika akun sudah ada
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: syntheticEmail,
                    password: syntheticPassword,
                });

                if (!signInError && signInData.session) {
                    setStatusText('Login berhasil! Mengalihkan ke beranda...');
                    setTimeout(() => { window.location.href = '/'; }, 1500);
                    return;
                }

                // Jika belum ada, buat akun baru otomatis
                const { error: signUpError } = await supabase.auth.signUp({
                    email: syntheticEmail,
                    password: syntheticPassword,
                    options: {
                        data: {
                            full_name: firstName,
                            preferred_username: username,
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Login otomatis setelah sign up
                const { error: autoLoginError } = await supabase.auth.signInWithPassword({
                    email: syntheticEmail,
                    password: syntheticPassword,
                });

                if (autoLoginError) throw autoLoginError;

                setStatusText('Akun berhasil dibuat! Masuk ke sistem...');
                setTimeout(() => { window.location.href = '/'; }, 1500);

            } catch (err) {
                console.error("Telegram Auth Error:", err);
                setErrorMsg(err.message || 'Gagal memproses autentikasi Telegram.');
            }
        };

        handleTelegramAuth();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0D14] flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-[400px] bg-white dark:bg-[#0E1116] rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center">
                <img
                    src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                    alt="Logo"
                    className="w-12 h-12 mb-4 object-contain"
                />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Telegram Login</h3>

                {errorMsg ? (
                    <div className="p-3 bg-red-500/10 text-red-500 text-[13px] rounded-xl mb-4 font-medium">
                        {errorMsg}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[#2AABEE] animate-spin" />
                        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{statusText}</p>
                    </div>
                )}
            </div>
        </div>
    );
}