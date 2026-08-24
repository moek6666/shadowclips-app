import React, { useState, useRef } from 'react';
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

function ModalLogin({ isOpen, onClose, supabase }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPass, setIsForgotPass] = useState(false); // State khusus untuk mode Lupa Password (1 Kolom)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [captchaToken, setCaptchaToken] = useState(null);
    const turnstileRef = useRef(null);

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
                // Logika Kirim Email Reset Password
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setSuccessMsg('Instruksi reset password telah dikirim ke email Anda!');
            } else if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
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

    const handleDiscordLogin = async () => {
        if (!supabase) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: `${window.location.origin}/verified-success`
                }
            });
            if (error) throw error;
        } catch (err) {
            setErrorMsg(err.message || 'Login Discord gagal.');
            setLoading(false);
        }
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
                {/* 1. KOLOM KIRI (LIGHT & DARK MODE SOLID)    */}
                {/* ========================================== */}
                <div className="hidden md:flex flex-col w-[55%] p-10 lg:p-12 relative overflow-hidden bg-slate-50 dark:bg-[#0A0D14] border-none transition-colors">

                    {/* Efek Cahaya / Ambient Glow */}
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-transparent dark:bg-blue-600/20 blur-[100px] rounded-full pointer-events-none z-0 transition-colors"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-transparent dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0 transition-colors"></div>

                    {/* KARTU GAMBAR (EFEK TERHAPUS / FADE OUT MASKING) */}
                    <div
                        className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-75 transition-opacity"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to top right, transparent 15%, black 90%)',
                            maskImage: 'linear-gradient(to top right, transparent 15%, black 90%)'
                        }}
                    >
                        {/* Card 1 (Kiri Atas) - Cia */}
                        <div className="absolute top-[5%] -left-[5%] w-48 h-72 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:shadow-xl transform -rotate-6 overflow-hidden bg-zinc-200 dark:bg-zinc-900/50 transition-shadow">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/Cia.webp" alt="Poster Cia" className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/40 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/40 dark:border-white/20 transition-colors">
                                    <Play className="w-5 h-5 text-slate-800 dark:text-white ml-1 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                                </div>
                            </div>
                        </div>

                        {/* Card 2 (Tengah Utama / Fokus) - Rizkysuryai */}
                        <div className="absolute top-[12%] left-[28%] w-56 h-80 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform rotate-3 overflow-hidden bg-zinc-200 dark:bg-zinc-900 z-10 border border-white/50 dark:border-white/5 transition-all">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/Rizkysuryai.webp" alt="Poster Rizkysuryai" className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-white/40 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:shadow-lg border border-white/40 dark:border-white/20 transition-all">
                                    <Play className="w-6 h-6 text-slate-800 dark:text-white ml-1 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                                </div>
                            </div>
                        </div>

                        {/* Card 3 (Kanan Atas) - Khofifah */}
                        <div className="absolute top-[5%] -right-[5%] w-48 h-72 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:shadow-xl transform rotate-6 overflow-hidden bg-zinc-200 dark:bg-zinc-900/50 transition-shadow">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/Khofifah.webp" alt="Poster Khofifah" className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/40 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/40 dark:border-white/20 transition-colors">
                                    <Play className="w-5 h-5 text-slate-800 dark:text-white ml-1 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                                </div>
                            </div>
                        </div>

                        {/* Card 4 (Kiri Bawah) - Nuke */}
                        <div className="absolute bottom-[10%] left-[5%] w-52 h-72 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:shadow-xl transform rotate-2 overflow-hidden bg-zinc-200 dark:bg-zinc-900/50 transition-shadow">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/nuke.webp" alt="Poster Nuke" className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/40 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/40 dark:border-white/20 transition-colors">
                                    <Play className="w-5 h-5 text-slate-800 dark:text-white ml-1 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                                </div>
                            </div>
                        </div>

                        {/* Card 5 (Kanan Bawah) - Aliendiya */}
                        <div className="absolute bottom-[5%] right-[5%] w-56 h-80 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] dark:shadow-xl transform -rotate-3 overflow-hidden bg-zinc-200 dark:bg-zinc-900/50 transition-shadow">
                            <img src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/Login%20BG/aliendiya.webp" alt="Poster Aliendiya" className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/40 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/40 dark:border-white/20 transition-colors">
                                    <Play className="w-5 h-5 text-slate-800 dark:text-white ml-1 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gradient Fade Out agar teks terbaca */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-[#0A0D14] dark:via-[#0A0D14]/80 dark:to-transparent z-0 pointer-events-none border-none transition-colors"></div>

                    {/* KONTEN DITARIK KE BAWAH */}
                    <div className="relative z-10 flex flex-col h-full justify-end pb-4 lg:pb-8 border-none">

                        <div className="flex flex-col gap-2 mb-8 border-none">
                            <div className="flex items-center gap-3 border-none">
                                <img
                                    src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                                    alt="ShadowClips Logo"
                                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain drop-shadow-md border-none"
                                />
                                <h3 className="text-[28px] lg:text-[32px] font-black tracking-tighter text-slate-900 dark:text-white leading-none border-none transition-colors">
                                    Shadow<span className="text-[#3b82f6]">Clips</span>
                                </h3>
                            </div>

                            <p className="text-slate-600 dark:text-zinc-300 text-[13px] lg:text-[14px] leading-relaxed pr-4 lg:pr-8 border-none font-medium max-w-[95%] transition-colors">
                                Nikmati konten-konten exclusive setiap hari dan selamat menikmati.
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:gap-y-6 border-none">
                            <div className="flex flex-col gap-1 border-none">
                                <MonitorPlay className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] border-none mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 border-none leading-none transition-colors">Exclusive</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 border-none leading-snug font-medium transition-colors">Premium access only</p>
                            </div>
                            <div className="flex flex-col gap-1 border-none">
                                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] border-none mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 border-none leading-none transition-colors">Viral</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 border-none leading-snug font-medium transition-colors">Trending content</p>
                            </div>
                            <div className="flex flex-col gap-1 border-none">
                                <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] border-none mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 border-none leading-none transition-colors">DeepFake</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 border-none leading-snug font-medium transition-colors">AI-generated realistic content</p>
                            </div>
                            <div className="flex flex-col gap-1 border-none">
                                <Radio className="w-5 h-5 lg:w-6 lg:h-6 text-[#3b82f6] border-none mb-0.5" strokeWidth={2} />
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-900 dark:text-zinc-100 border-none leading-none transition-colors">Live</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 border-none leading-snug font-medium transition-colors">Record or replay streaming</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* 2. KOLOM KANAN (FORM LOGIN / FORGOT PASS)  */}
                {/* ========================================== */}
                <div className="w-full md:w-[45%] p-8 sm:p-12 flex flex-col justify-center relative bg-white dark:bg-[#0E1116] border-none transition-colors">

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 rounded-full transition-colors outline-none cursor-pointer z-50 border-none"
                    >
                        <X className="w-5 h-5 border-none" />
                    </button>

                    <div className="w-full max-w-[340px] mx-auto flex flex-col border-none">

                        <div className="mb-8 border-none">
                            <img
                                src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                                alt="Logo"
                                className="w-14 h-14 mb-5 md:hidden object-contain border-none"
                            />
                            {/* Judul Dinamis Berdasarkan Mode Forgot Password */}
                            <h2 className="text-[28px] sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-1.5 border-none transition-colors">
                                {isForgotPass ? 'Reset Password' : (isLogin ? 'Welcome back' : 'Create an account')}
                            </h2>
                            <p className="text-[13px] text-slate-500 dark:text-zinc-400 border-none transition-colors">
                                {isForgotPass
                                    ? 'Enter your email address and we will send you a link to reset your password.'
                                    : (isLogin ? 'Login to continue watching your favorite content' : 'Sign up to unlock all premium features and content')}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 p-3.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px] rounded-xl font-medium transition-colors border-none text-center">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-6 p-3.5 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[13px] rounded-xl font-medium transition-colors border-none text-center">
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 border-none">

                            <div className="flex flex-col gap-1.5 border-none">
                                <label className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 ml-1 border-none transition-colors">Email Address</label>
                                <div className="relative group border-none">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#3b82f6] transition-colors pointer-events-none border-none" strokeWidth={1.5} />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrorMsg('');
                                            setSuccessMsg('');
                                        }}
                                        required
                                        className="w-full bg-slate-100 dark:bg-[#161921] py-3 pl-11 pr-4 rounded-[8px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all text-[13px] border-none"
                                    />
                                </div>
                            </div>

                            {/* Kolom Password Disembunyikan Jika Sedang Mode Forgot Password */}
                            {!isForgotPass && (
                                <div className="flex flex-col gap-1.5 border-none">
                                    <label className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 ml-1 border-none transition-colors">Password</label>
                                    <div className="relative group border-none">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#3b82f6] transition-colors pointer-events-none border-none" strokeWidth={1.5} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setErrorMsg('');
                                            }}
                                            required={isLogin}
                                            minLength={6}
                                            className="w-full bg-slate-100 dark:bg-[#161921] py-3 pl-11 pr-11 rounded-[8px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all text-[13px] border-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 focus:outline-none bg-transparent cursor-pointer transition-colors border-none"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4 border-none" strokeWidth={1.5} /> : <Eye className="w-4 h-4 border-none" strokeWidth={1.5} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tombol Forgot Password / Back to Login */}
                            {isLogin && !isForgotPass && (
                                <div className="flex justify-end -mt-1 mb-1 border-none">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPass(true);
                                            setErrorMsg('');
                                            setSuccessMsg('');
                                        }}
                                        className="text-[12px] text-[#3b82f6] hover:text-[#60a5fa] hover:underline font-medium bg-transparent cursor-pointer transition-colors border-none"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {isForgotPass && (
                                <div className="flex items-center gap-1.5 -mt-1 mb-1 border-none">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPass(false);
                                            setErrorMsg('');
                                            setSuccessMsg('');
                                        }}
                                        className="text-[12px] text-[#3b82f6] hover:text-[#60a5fa] hover:underline font-medium bg-transparent cursor-pointer transition-colors border-none flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-center w-full overflow-hidden border-none">
                                <div className="transform scale-[0.90] origin-center flex justify-center w-full border-none">
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

                            {/* Tombol Aksi Utama (Login / Sign Up / Send Code) */}
                            <button
                                type="submit"
                                disabled={loading || !email || (!isForgotPass && isLogin && !password) || !captchaToken}
                                className="w-full bg-[#1D4ED8] hover:bg-[#2563EB] disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-500 text-white py-3.5 rounded-[8px] font-semibold transition-colors flex items-center justify-center gap-2 outline-none cursor-pointer disabled:cursor-not-allowed border-none mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin border-none" /> : (isForgotPass ? 'Send Reset Code' : (isLogin ? 'Login' : 'Sign Up'))}
                            </button>
                        </form>

                        {/* Sembunyikan bagian "OR CONTINUE WITH" jika sedang di mode Forgot Password */}
                        {!isForgotPass && (
                            <>
                                <div className="flex items-center gap-4 my-6 border-none">
                                    <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1 border-none transition-colors"></div>
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 tracking-wider border-none transition-colors">OR CONTINUE WITH</span>
                                    <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1 border-none transition-colors"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full mb-6 border-none">
                                    <div className="relative w-full h-[40px] rounded-[8px] bg-slate-100 dark:bg-[#161921] hover:bg-slate-200 dark:hover:bg-[#1E222D] transition-colors cursor-pointer overflow-hidden border-none">
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-700 dark:text-zinc-200 pointer-events-none border-none transition-colors">
                                            <svg className="w-4 h-4 border-none" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-[13px] font-medium border-none">Google</span>
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-full opacity-0 z-10 cursor-pointer overflow-hidden flex items-center justify-center transform scale-[2.5]">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                useOneTap={false}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleDiscordLogin}
                                        className="w-full h-[40px] flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#161921] hover:bg-slate-200 dark:hover:bg-[#1E222D] text-slate-700 dark:text-zinc-200 rounded-[8px] font-medium transition-colors border-none outline-none cursor-pointer"
                                    >
                                        <svg className="w-5 h-5 text-[#5865F2] border-none" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                                        </svg>
                                        <span className="text-[13px] font-medium border-none">Discord</span>
                                    </button>
                                </div>
                            </>
                        )}

                        <p className="text-center text-[13px] text-slate-500 dark:text-zinc-400 mt-2 border-none transition-colors">
                            {isForgotPass ? "" : (isLogin ? "Don't have an account? " : "Already have an account? ")}
                            {!isForgotPass && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setErrorMsg('');
                                        setSuccessMsg('');
                                        if (turnstileRef.current) turnstileRef.current.reset();
                                        setCaptchaToken(null);
                                    }}
                                    className="text-[#3b82f6] hover:text-[#60a5fa] font-semibold bg-transparent cursor-pointer transition-colors border-none outline-none"
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