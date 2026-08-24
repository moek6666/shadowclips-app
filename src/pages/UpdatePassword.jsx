import React, { useState, useEffect } from 'react';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function UpdatePassword({ supabase }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Mengecek apakah user benar-benar datang dari link reset password
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setErrorMsg('Sesi tidak valid atau telah kedaluwarsa. Silakan minta link reset password baru.');
            }
        };
        checkUserSession();
    }, [supabase.auth]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password !== confirmPassword) {
            setErrorMsg('Password tidak cocok. Silakan periksa kembali.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Password harus terdiri dari minimal 6 karakter.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccessMsg('Password berhasil diperbarui! Anda sekarang bisa login dengan password baru.');
            setPassword('');
            setConfirmPassword('');

            // Opsi: Redirect otomatis ke halaman login setelah 3 detik
            setTimeout(() => {
                window.location.href = '/'; // Sesuaikan dengan route login web Bos
            }, 3000);

        } catch (err) {
            setErrorMsg(err.message || 'Gagal memperbarui password. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0D14] flex items-center justify-center p-4 transition-colors">

            {/* Ambient Glow Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-transparent dark:bg-blue-600/20 blur-[100px] rounded-full pointer-events-none z-0 transition-colors"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-transparent dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0 transition-colors"></div>

            <div className="relative z-10 w-full max-w-[450px] bg-white dark:bg-[#0E1116] rounded-2xl md:rounded-[1.5rem] shadow-2xl shadow-slate-300/50 dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-8 sm:p-12 border-none transition-colors">

                <div className="flex flex-col items-center mb-8 border-none text-center">
                    <img
                        src="https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp"
                        alt="ShadowClips Logo"
                        className="w-14 h-14 mb-5 object-contain border-none"
                    />
                    <h2 className="text-[28px] sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 border-none transition-colors">
                        Reset Password
                    </h2>
                    <p className="text-[13px] text-slate-500 dark:text-zinc-400 border-none transition-colors">
                        Buat password baru yang kuat dan aman untuk akun ShadowClips Anda.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[13px] rounded-xl font-medium transition-colors border-none text-center">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 bg-green-100 dark:bg-green-500/10 flex flex-col items-center gap-2 rounded-xl transition-colors border-none text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400 text-[13px] font-medium">{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 border-none">

                    <div className="flex flex-col gap-1.5 border-none">
                        <label className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 ml-1 border-none transition-colors">Password Baru</label>
                        <div className="relative group border-none">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#3b82f6] transition-colors pointer-events-none border-none" strokeWidth={1.5} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password baru"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={successMsg !== ''}
                                className="w-full bg-slate-100 dark:bg-[#161921] py-3 pl-11 pr-11 rounded-[8px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all text-[13px] border-none disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={successMsg !== ''}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 focus:outline-none bg-transparent cursor-pointer transition-colors border-none disabled:opacity-50"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4 border-none" strokeWidth={1.5} /> : <Eye className="w-4 h-4 border-none" strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 border-none">
                        <label className="text-[12px] font-semibold text-slate-700 dark:text-zinc-300 ml-1 border-none transition-colors">Konfirmasi Password Baru</label>
                        <div className="relative group border-none">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#3b82f6] transition-colors pointer-events-none border-none" strokeWidth={1.5} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Ulangi password baru"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={successMsg !== ''}
                                className="w-full bg-slate-100 dark:bg-[#161921] py-3 pl-11 pr-11 rounded-[8px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 transition-all text-[13px] border-none disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={successMsg !== ''}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 focus:outline-none bg-transparent cursor-pointer transition-colors border-none disabled:opacity-50"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4 border-none" strokeWidth={1.5} /> : <Eye className="w-4 h-4 border-none" strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password || !confirmPassword || successMsg !== ''}
                        className="w-full bg-[#1D4ED8] hover:bg-[#2563EB] disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-500 text-white py-3.5 rounded-[8px] font-semibold transition-colors flex items-center justify-center gap-2 outline-none cursor-pointer disabled:cursor-not-allowed border-none mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin border-none" /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}