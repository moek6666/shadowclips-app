import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Crown, Star, Settings, LogOut, Camera, Save, Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile({ supabase }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    // Form States
    const [editName, setEditName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');

    useEffect(() => {
        if (!supabase) return;

        const getProfileData = async () => {
            setLoading(true);
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (currentSession?.user) {
                setSession(currentSession);
                const { data } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
                if (data) {
                    setProfile(data);
                    setEditName(data.name || '');
                    setEditAvatarUrl(data.avatar_url || '');
                }
            } else {
                // Jika belum login, lempar ke beranda
                window.location.href = '/';
            }
            setLoading(false);
        };

        getProfileData();
    }, [supabase]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!supabase || !session) return;

        setIsSaving(true);
        setNotification(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: editName,
                    avatar_url: editAvatarUrl
                })
                .eq('id', session.user.id);

            if (error) throw error;

            setProfile(prev => ({ ...prev, name: editName, avatar_url: editAvatarUrl }));
            setNotification({ type: 'success', message: 'Profil berhasil diperbarui!' });

            // Hilangkan notifikasi setelah 3 detik
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            setNotification({ type: 'error', message: 'Gagal memperbarui profil.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors">
                <div className="w-14 h-14 border-4 border-zinc-200 dark:border-zinc-800 border-t-[#106EBE] rounded-full animate-spin mb-4 shadow-md"></div>
                <p className="text-zinc-500 font-bold animate-pulse">Memuat Profil...</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors font-sans">
            <Navbar isScrolled={true} supabase={supabase} />

            <div className="pt-32 pb-20 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Profil */}
                <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mb-8 border-none transition-colors">
                    {/* Background Cover */}
                    <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-[#106EBE] to-[#0e5c9f] relative">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://nmeaifqvxgyzvwavijhb.supabase.co/storage/v1/object/public/shadowclips/shadow.webp')] bg-cover bg-center mix-blend-overlay"></div>
                    </div>

                    <div className="px-6 sm:px-10 pb-8 relative border-none">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 mb-6 border-none">
                            {/* Avatar */}
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 p-1.5 shadow-xl border-none">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-none">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-zinc-400" />
                                        )}
                                    </div>
                                </div>
                                {profile.is_admin ? (
                                    <div className="absolute bottom-2 right-2 bg-white dark:bg-zinc-900 rounded-full p-1 shadow-md" title="Verified Admin">
                                        <BadgeCheck className="w-8 h-8 text-[#106EBE] dark:text-[#0FFCBE] fill-white dark:fill-[#106EBE]" />
                                    </div>
                                ) : profile.is_premium ? (
                                    <div className="absolute bottom-2 right-2 bg-white dark:bg-zinc-900 rounded-full p-1 shadow-md" title="Premium VIP Member">
                                        <Crown className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                                    </div>
                                ) : null}
                            </div>

                            {/* Info Singkat */}
                            <div className="flex-1 text-center sm:text-left border-none">
                                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight border-none mb-1">
                                    {profile.name || 'Pengguna Tanpa Nama'}
                                </h1>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 border-none">
                                    <Mail className="w-4 h-4" /> {session.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Statistik / Card Badge */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-none">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl flex items-center gap-4 border-none transition-colors">
                                <div className="w-12 h-12 rounded-full bg-[#106EBE]/10 dark:bg-[#106EBE]/20 flex items-center justify-center shrink-0 border-none">
                                    <Star className="w-6 h-6 text-[#106EBE] dark:text-[#0FFCBE]" />
                                </div>
                                <div className="flex flex-col border-none">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-none">Shadow Points</span>
                                    <span className="text-xl font-black text-zinc-900 dark:text-white leading-none border-none">{profile.points || 0}</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl flex items-center gap-4 border-none transition-colors ${profile.is_admin ? 'bg-[#106EBE]/5 dark:bg-[#106EBE]/10' : profile.is_premium ? 'bg-amber-500/5 dark:bg-amber-500/10' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-none ${profile.is_admin ? 'bg-[#106EBE]/20' : profile.is_premium ? 'bg-amber-500/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    {profile.is_admin ? <Shield className="w-6 h-6 text-[#106EBE]" /> : profile.is_premium ? <Crown className="w-6 h-6 text-amber-500" /> : <User className="w-6 h-6 text-zinc-500" />}
                                </div>
                                <div className="flex flex-col border-none">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-none">Status Akun</span>
                                    <span className={`text-xl font-black leading-none border-none ${profile.is_admin ? 'text-[#106EBE] dark:text-[#0FFCBE]' : profile.is_premium ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>
                                        {profile.is_admin ? 'Administrator' : profile.is_premium ? 'Premium VIP' : 'Pengguna Standar'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Edit Profil */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-10 border-none transition-colors">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-6 border-none">
                        <Settings className="w-5 h-5 text-[#106EBE]" /> Pengaturan Profil
                    </h2>

                    {notification && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border-none transition-all ${notification.type === 'success' ? 'bg-[#106EBE]/10 text-[#106EBE] dark:text-[#0FFCBE]' : 'bg-red-500/10 text-red-500'}`}>
                            {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <BadgeCheck className="w-5 h-5" />}
                            {notification.message}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 border-none">
                        <div className="flex flex-col gap-2 border-none">
                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 border-none">Nama Tampilan</label>
                            <div className="relative border-none">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 border-none" />
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Masukkan nama Anda"
                                    required
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 py-3.5 pl-12 pr-4 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all border border-zinc-200 dark:border-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border-none">
                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 border-none">URL Foto Profil (Avatar)</label>
                            <div className="relative border-none">
                                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 border-none" />
                                <input
                                    type="url"
                                    value={editAvatarUrl}
                                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                                    placeholder="https://contoh.com/foto.jpg"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 py-3.5 pl-12 pr-4 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#106EBE]/50 transition-all border border-zinc-200 dark:border-zinc-800"
                                />
                            </div>
                            <p className="text-xs text-zinc-500 border-none mt-1">Kosongkan jika ingin menggunakan foto default.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4 border-none pt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="submit"
                                disabled={isSaving || !editName.trim()}
                                className="flex-1 bg-[#106EBE] hover:bg-[#0e5c9f] disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin border-none" /> : <Save className="w-5 h-5 border-none" />}
                                Simpan Perubahan
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="sm:w-auto w-full bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3.5 px-8 rounded-xl font-bold transition-all flex items-center justify-center gap-2 outline-none border-none cursor-pointer"
                            >
                                <LogOut className="w-5 h-5 border-none" /> Keluar
                            </button>
                        </div>
                    </form>
                </div>

            </div>
            <Footer />
        </div>
    );
}