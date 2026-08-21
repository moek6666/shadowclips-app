import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Masukkan Client ID Google Bos di sini (Ini ID dari riwayat percakapan kita sebelumnya)
const GOOGLE_CLIENT_ID = "584667592518-5j301svkhtkoij6dudhscof5ucj4ge16.apps.googleusercontent.com";

export default function ModalLoginWrapper(props) {
    // Membungkus modal dengan Provider Google agar sistem Client-Side aktif
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <ModalLogin {...props} />
        </GoogleOAuthProvider>
    );
}

function ModalLogin({ isOpen, onClose, supabase }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!supabase) {
            setErrorMsg('Koneksi sistem belum siap. Silakan coba lagi.');
            return;
        }
        setLoading(true);
        setErrorMsg('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) setErrorMsg(error.message);
                else onClose();
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) setErrorMsg(error.message);
                else {
                    setErrorMsg('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
        } finally {
            setLoading(false);
        }
    };

    // TRIK BYPASS: Menangkap Token langsung dari Google (Tanpa lewat URL Supabase)
    const handleGoogleSuccess = async (credentialResponse) => {
        if (!supabase) return;
        setLoading(true);
        setErrorMsg('');

        try {
            // Mengirimkan Token Kunci langsung ke database Supabase
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credentialResponse.credential,
            });

            if (error) throw error;
            onClose(); // Sukses login, tutup modal!

        } catch (err) {
            console.error("ID Token Error:", err);
            setErrorMsg('Autentikasi Google ditolak oleh sistem.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setErrorMsg('Proses login Google dibatalkan atau gagal.');
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 border-none transition-colors"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-8 animate-in zoom-in-95 duration-300 border-none overflow-hidden transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors outline-none border-none cursor-pointer"
                >
                    <X className="w-5 h-5 border-none" />
                </button>

                <div className="text-center mb-8 border-none">
                    <img
                        src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                        alt="Logo"
                        className="w-16 h-16 mx-auto mb-3 drop-shadow-sm dark:drop-shadow-none border-none object-contain"
                    />
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight transition-colors border-none">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 transition-colors border-none">
                        {isLogin ? 'Sign in to unlock exclusive features' : 'Join us to get premium access'}
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium border-none transition-colors">
                        {errorMsg}
                    </div>
                )}

                {/* TOMBOL RESMI GOOGLE (Bypass Redirect) */}
                <div className="flex justify-center w-full mb-6 border-none">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        size="large"
                        shape="pill"
                        width="320"
                        text="continue_with"
                        useOneTap={false} // Dimatikan agar tidak mengganggu UI lain
                    />
                </div>

                <div className="flex items-center gap-4 mb-6 border-none">
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1 border-none transition-colors"></div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-none">OR</span>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1 border-none transition-colors"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 border-none">
                    <div className="relative border-none">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 border-none" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-zinc-100 dark:bg-zinc-900 py-3.5 pl-12 pr-4 rounded-2xl text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all border-none"
                        />
                    </div>
                    <div className="relative border-none">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 border-none" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 py-3.5 pl-12 pr-4 rounded-2xl text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all border-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white py-3.5 rounded-2xl font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2 outline-none border-none cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin border-none" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500 mt-6 border-none">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                        className="text-[#106EBE] dark:text-[#0FFCBE] font-bold hover:underline outline-none border-none cursor-pointer"
                    >
                        {isLogin ? 'Sign up here' : 'Sign in here'}
                    </button>
                </p>
            </div>
        </div>
    );
}