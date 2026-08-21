import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';

export default function ModalLogin({ isOpen, onClose, supabase }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!supabase) {
            setErrorMsg('Koneksi Supabase belum siap. Silakan coba lagi.');
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

    const handleGoogleLogin = async () => {
        if (!supabase) {
            setErrorMsg('Koneksi Supabase belum siap.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : '' }
            });
            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Gagal login dengan Google.');
            setLoading(false);
        }
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

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white py-3.5 rounded-2xl font-bold transition-all mb-6 outline-none border-none shadow-sm dark:shadow-none cursor-pointer"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                </button>

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