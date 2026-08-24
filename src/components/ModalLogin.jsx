import React, { useState, useRef, useEffect, memo } from 'react';
import { X, Mail, Lock, Loader2, Eye, EyeOff, User, MonitorPlay, Zap, Radio, Play, ArrowLeft } from 'lucide-react';
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

// =========================================================================
// KOMPONEN WIDGET TELEGRAM (ANTI HILANG)
// Menggunakan memo() agar React tidak menghapus tombol saat form diketik
// =========================================================================
const TelegramWidget = memo(() => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && containerRef.current.children.length === 0) {
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', 'shadowclipsauth_bot');
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-radius', '8');
            script.setAttribute('data-request-access', 'write');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.async = true;
            containerRef.current.appendChild(script);
        }
    }, []);

    return <div ref={containerRef} className="flex justify-center items-center w-full h-[40px] overflow-hidden rounded-[8px] bg-transparent" />;
});

function ModalLogin({ isOpen, onClose, supabase }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPass, setIsForgotPass] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [captchaToken, setCaptchaToken] = useState(null);
    const turnstileRef = useRef(null);

    // =========================================================================
    // LISTENER DATA DARI WIDGET TELEGRAM (DIJAMIN DIEKSEKUSI)
    // =========================================================================
    useEffect(() => {
        window.onTelegramAuth = async (user) => {
            if (!supabase) return;

            console.log("Data Telegram Berhasil Diterima Web:", user);
            setLoading(true);
            setErrorMsg('');

            try {
                // 1. Eksekusi fungsi master di database Supabase
                const { data: rpcData, error: rpcError } = await supabase.rpc('handle_telegram_auth', {
                    p_telegram_id: user.id,
                    p_first_name: user.first_name,
                    p_username: user.username || `user_${user.id}`,
                    p_photo_url: user.photo_url || null
                });

                if (rpcError) {
                    console.error("Supabase DB Error:", rpcError);
                    throw new Error('Gagal menyimpan profil ke database.');
                }

                // 2. Login menggunakan kredensial sintetis dari database
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: rpcData.email,
                    password: rpcData.password,
                });

                if (signInError) {
                    console.error("Supabase Auth Error:", signInError);
                    throw new Error('Gagal memulai sesi login.');
                }

                // 3. Sukses! Tutup modal dan refresh agar Navbar update
                onClose();
                window.location.reload();
            } catch (err) {
                console.error("Gagal Total Telegram Auth:", err);
                setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
                setLoading(false);
            }
        };

        // Bersihkan fungsi global saat komponen ditutup agar aman
        return () => {
            window.onTelegramAuth = undefined;
        };
    }, [supabase, onClose]);

    if (!isOpen) return null;

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!supabase || !captchaToken) {
            setErrorMsg('Silakan selesaikan verifikasi keamanan terlebih dahulu.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isForgotPass) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setSuccessMsg('Instruksi reset password telah dikirim ke email Anda!');
            } else if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
                window.location.reload();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/verified-success`
                    }
                });
                if (error) throw error;
                window.location.href = '/verify-email';
            }
        } catch (err) {
            let customError = err.message;
            if (customError.includes("Password should contain at least one character of each")) {
                customError = "Password terlalu lemah. Gunakan minimal 1 huruf besar, angka, dan simbol.";
            } else if (customError.includes("Invalid login credentials")) {
                customError = "Email/Password salah, atau akun belum diverifikasi via email.";
            } else if (customError.includes("For security purposes, you can only request this once every")) {
                customError = "Anda sudah meminta reset password baru-baru ini. Silakan cek email Anda.";
            }

            setErrorMsg(customError || 'Terjadi kesalahan sistem.');
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
            window.location.reload();
        } catch (err) {
            setErrorMsg('Autentikasi Google ditolak oleh sistem.');
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setErrorMsg('Proses login Google dibatalkan atau gagal.');
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 border-none transition-colors"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[1000px] bg-white dark:bg-[#0E1116] rounded-2xl md:rounded-[1.5rem] shadow-2xl shadow-slate-300/50 dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300 border-none overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-colors"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ========================================== */}
                {/* KOLOM KIRI (POSTER & FITUR)                */}
                {/* ========================================== */}
                <div className="hidden md:flex flex-col w-[55%] p-10 lg:p-12 relative overflow-hidden bg-slate-100 dark:bg-[#07090D] border-none transition-colors">

                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 blur-[100px] rounded-full pointer-events-none z-0"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 blur-[100px] rounded-full pointer-events-none z-0"></div>

                    <div
                        className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-85 dark:opacity-90 transition-opacity"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to top right, transparent 10%, black 85%)',
                            maskImage: 'linear-gradient(to top right, transparent 10%, black 85%)'
                        }}
                    >
                        <div className="absolute top-[5%] -left-[5%] w-48 h-72 rounded-2xl shadow-2xl transform -rotate-6 overflow-hidden bg-zinc-800 border border-white/10">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/Cia.webp" alt="Poster Cia" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-[12%] left-[28%] w-56 h-80 rounded-2xl shadow-2xl transform rotate-3 overflow-hidden bg-zinc-800 z-10 border border-white/15">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/Rizkysuryai.webp" alt="Poster Rizkysuryai" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute top-[5%] -right-[5%] w-48 h-72 rounded-2xl shadow-2xl transform rotate-6 overflow-hidden bg-zinc-800 border border-white/10">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/Khofifah.webp" alt="Poster Khofifah" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/60 to-transparent dark:from-[#07090D] dark:via-[#07090D]/70 dark:to-transparent z-0 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col h-full justify-end pb-2 lg:pb-4">
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                                    alt="Logo"
                                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain drop-shadow-md"
                                />
                                <h3 className="text-[28px] lg:text-[32px] font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                    Shadow<span className="text-[#3b82f6]">Clips</span>
                                </h3>
                            </div>
                            <p className="text-slate-700 dark:text-zinc-200 text-[13px] lg:text-[14px] leading-relaxed font-semibold">
                                Nikmati konten-konten exclusive setiap hari dan selamat menikmati.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                            <div className="flex flex-col gap-1">
                                <MonitorPlay className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 leading-none">Exclusive</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug font-medium">Premium access only</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 leading-none">Viral</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug font-medium">Trending content</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 leading-none">DeepFake</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug font-medium">AI-generated realistic content</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Radio className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 leading-none">Live</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug font-medium">Record or replay streaming</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* KOLOM KANAN (FORM LOGIN)                   */}
                {/* ========================================== */}
                <div className="w-full md:w-[45%] p-8 sm:p-12 flex flex-col justify-center relative bg-white dark:bg-[#0E1116]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-slate-400 dark:text-zinc-500 rounded-full transition-colors cursor-pointer z-50 border-none"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-full max-w-[340px] mx-auto flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-[28px] sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-1.5">
                                {isForgotPass ? 'Reset Password' : (isLogin ? 'Welcome back' : 'Create an account')}
                            </h2>
                            <p className="text-[13px] text-slate-500 dark:text-zinc-400">
                                {isForgotPass
                                    ? 'Enter your email address to receive a reset link.'
                                    : (isLogin ? 'Login to continue watching' : 'Sign up to unlock all features')}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 p-3.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px] rounded-xl font-medium text-center">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-6 p-3.5 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[13px] rounded-xl font-medium text-center">
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#3b82f6]" strokeWidth={1.5} />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); setSuccessMsg(''); }}
                                        required
                                        className="w-full bg-slate-100 dark:bg-[#161921] py-3 pl-11 pr-4 rounded-[8px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 text-[13px] border-none"
                                    />
                                </div>
                            </div>

                            {!isForgotPass && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#3b82f6]" strokeWidth={1.5} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                                            required={isLogin}
                                            minLength={6}
                                            className="w-full bg-slate-100 dark:bg-[#161921] py-3 pl-11 pr-11 rounded-[8px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 text-[13px] border-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent cursor-pointer border-none"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isLogin && !isForgotPass && (
                                <div className="flex justify-end -mt-1 mb-1">
                                    <button
                                        type="button"
                                        onClick={() => { setIsForgotPass(true); setErrorMsg(''); setSuccessMsg(''); }}
                                        className="text-[12px] text-[#3b82f6] hover:underline font-medium bg-transparent cursor-pointer border-none"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {isForgotPass && (
                                <div className="flex items-center gap-1.5 -mt-1 mb-1">
                                    <button
                                        type="button"
                                        onClick={() => { setIsForgotPass(false); setErrorMsg(''); setSuccessMsg(''); }}
                                        className="text-[12px] text-[#3b82f6] hover:underline font-medium bg-transparent cursor-pointer border-none flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-center w-full overflow-hidden">
                                <div className="transform scale-[0.90] origin-center flex justify-center w-full">
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
                                disabled={loading || !email || (!isForgotPass && isLogin && !password) || !captchaToken}
                                className="w-full bg-[#1D4ED8] hover:bg-[#2563EB] disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white py-3.5 rounded-[8px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed border-none mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isForgotPass ? 'Send Reset Code' : (isLogin ? 'Login' : 'Sign Up'))}
                            </button>
                        </form>

                        {!isForgotPass && (
                            <>
                                <div className="flex items-center gap-4 my-6">
                                    <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
                                    <span className="text-[10px] font-medium text-slate-400 tracking-wider">OR CONTINUE WITH</span>
                                    <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                    {/* TOMBOL GOOGLE */}
                                    <div className="relative w-full h-[40px] rounded-[8px] bg-slate-100 dark:bg-[#161921] hover:bg-slate-200 dark:hover:bg-[#1E222D] transition-colors cursor-pointer overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-700 dark:text-zinc-200 pointer-events-none">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-[13px] font-medium">Google</span>
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-full opacity-0 z-10 cursor-pointer flex items-center justify-center transform scale-[2.5]">
                                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} />
                                        </div>
                                    </div>

                                    {/* TOMBOL TELEGRAM WIDGET ASLI (TIDAK AKAN DIBLOKIR) */}
                                    <TelegramWidget />
                                </div>
                            </>
                        )}

                        <p className="text-center text-[13px] text-slate-500 dark:text-zinc-400 mt-2">
                            {isForgotPass ? "" : (isLogin ? "Don't have an account? " : "Already have an account? ")}
                            {!isForgotPass && (
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
                                    className="text-[#3b82f6] hover:underline font-semibold bg-transparent cursor-pointer border-none"
                                >
                                    {isLogin ? 'Sign up' : 'Login'}
                                </button>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}