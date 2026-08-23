import React, { useState, useRef } from 'react';
import { X, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Turnstile } from '@marsidev/react-turnstile';

const GOOGLE_CLIENT_ID = "584667592518-pg15b6l0jmud072lslgk9utaord83sif.apps.googleusercontent.com";

export default function ModalLoginWrapper(props) {
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
    const [showPassword, setShowPassword] = useState(false);

    // State untuk Satpam Cloudflare
    const [captchaToken, setCaptchaToken] = useState(null);
    const turnstileRef = useRef(null);

    if (!isOpen) return null;

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        // PENGAMAN SINKRON: Tolak jika captcha belum centang hijau
        if (!supabase || !captchaToken) {
            setErrorMsg('Silakan selesaikan verifikasi keamanan terlebih dahulu.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose(); // Sukses login, tutup modal
            } else {
                // 🔥 PERBAIKAN: Tambahkan Redirect URL agar email mengarah ke halaman sukses kita
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/verified-success`
                    }
                });
                if (error) throw error;

                // REDIRECT KE HALAMAN CEK EMAIL
                window.location.href = '/verify-email';
            }
        } catch (err) {
            setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
            // Reset Satpam jika password salah/error
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        if (!supabase) return;
        setLoading(true);
        setErrorMsg('');

        try {
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credentialResponse.credential,
            });

            if (error) throw error;
            onClose();

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
            className="fixed inset-0 z-[200] bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 border-none transition-colors"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[850px] bg-white dark:bg-zinc-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300 border-none overflow-hidden transition-colors flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >

                {/* KOLOM KIRI (GRADIENT ZINC GELAP PROFESIONAL) */}
                <div className="hidden md:flex md:w-[45%] relative items-center justify-center p-10 bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-zinc-950 dark:to-black border-none overflow-hidden rounded-l-[2.5rem] transition-colors">

                    <div className="relative z-10 text-center flex flex-col items-center border-none w-full">
                        <div className="flex items-center justify-center mb-8 border-none w-full">
                            <img
                                src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                                alt="Logo"
                                className="w-24 h-24 border-none object-contain drop-shadow-lg"
                            />
                        </div>

                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight border-none leading-none transition-colors">
                            Shadow<span className="text-zinc-500 dark:text-zinc-400">Clips</span>
                        </h3>

                        <div className="w-12 h-1 bg-zinc-400 dark:bg-zinc-700 rounded-full mb-6 transition-colors"></div>

                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed border-none px-4 drop-shadow-sm transition-colors">
                            Akses ribuan konten profesional, bangun identitas digital Anda, dan terhubung dengan jaringan komunitas tanpa batas.
                        </p>
                    </div>
                </div>

                {/* KOLOM KANAN (FORM LOGIN UTAMA) */}
                <div className="w-full md:w-[55%] p-8 sm:p-10 relative flex flex-col justify-center border-none bg-white dark:bg-zinc-900/50 transition-colors">

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors outline-none border-none cursor-pointer z-50"
                    >
                        <X className="w-5 h-5 border-none" />
                    </button>

                    <div className="text-center mb-8 border-none w-full">
                        <img
                            src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                            alt="Logo"
                            className="w-20 h-20 mx-auto mb-4 md:hidden drop-shadow-sm dark:drop-shadow-none border-none object-contain"
                        />
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight transition-colors border-none text-center">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 transition-colors border-none text-center">
                            {isLogin ? 'Sign in to unlock exclusive features' : 'Join us to get premium access'}
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px] rounded-xl text-center font-medium border-none transition-colors">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex justify-center w-full mb-6 border-none">
                        <div className="w-full overflow-hidden rounded-full flex justify-center border-none">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                size="large"
                                shape="pill"
                                text="continue_with"
                                useOneTap={false}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6 border-none">
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1 border-none transition-colors"></div>
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest border-none">OR EMAIL</span>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1 border-none transition-colors"></div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 border-none">
                        <div className="relative border-none">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 border-none pointer-events-none" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-zinc-100 dark:bg-zinc-950 py-3.5 pl-12 pr-4 rounded-2xl text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all border-none font-medium text-[15px]"
                            />
                        </div>

                        {/* INPUT PASSWORD SHOW/HIDE */}
                        <div className="relative border-none mb-2 group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 border-none pointer-events-none" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-zinc-100 dark:bg-zinc-950 py-3.5 pl-12 pr-12 rounded-2xl text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all border-none font-medium text-[15px]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none bg-transparent border-none outline-none cursor-pointer transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <div className="flex justify-center w-full overflow-hidden py-1 border-none">
                            <div className="transform scale-[0.85] sm:scale-[0.95] origin-center flex justify-center border-none w-full">
                                <Turnstile
                                    siteKey="0x4AAAAAAEI8owBAGHjSd7E5"
                                    onSuccess={(token) => setCaptchaToken(token)}
                                    onExpire={() => setCaptchaToken(null)}
                                    onError={() => setCaptchaToken(null)}
                                    options={{ theme: 'auto' }}
                                    ref={turnstileRef}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password || !captchaToken}
                            className="w-full bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white py-4 rounded-2xl font-black transition-all shadow-md mt-2 flex items-center justify-center gap-2 outline-none border-none cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin border-none" /> : (isLogin ? 'SIGN IN' : 'SIGN UP')}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-500 mt-6 border-none">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMsg('');
                                if (turnstileRef.current) turnstileRef.current.reset();
                                setCaptchaToken(null);
                            }}
                            className="text-[#106EBE] dark:text-[#0FFCBE] font-bold hover:underline outline-none border-none cursor-pointer"
                        >
                            {isLogin ? 'Sign up here' : 'Sign in here'}
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
}