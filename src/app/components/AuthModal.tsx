import { useState } from 'react';
import { API_BASE } from '../config/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AuthModalProps {
    children: React.ReactNode;
    defaultTab?: 'login' | 'register';
    defaultRole?: 'client' | 'lawyer';
    onSuccess?: (email: string) => void;
}

export function AuthModal({ children, defaultTab = 'login', defaultRole = 'client', onSuccess }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [role, setRole] = useState(defaultRole);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = (type: 'login' | 'register') => {
        if (type === 'login') {
            if (!loginEmail || !loginPassword) {
                setError('Mohon lengkapi semua bidang.');
                return false;
            }
        } else {
            if (!regName || !regEmail || !regPassword) {
                setError('Mohon lengkapi semua bidang untuk pendaftaran.');
                return false;
            }
            if (regPassword.length < 6) {
                setError('Kata sandi harus minimal 6 karakter.');
                return false;
            }
        }
        return true;
    };

    const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
        if (e) e.preventDefault();
        setError('');

        if (!customEmail && !validateForm('login')) return;

        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', customEmail || loginEmail);
            formData.append('password', customPassword || loginPassword);

            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Identitas tidak ditemukan atau sandi salah.');
            }

            localStorage.setItem("rci_token", data.access_token);
            localStorage.setItem("rci_user_email", customEmail || loginEmail);

            setIsOpen(false);
            if (onSuccess) {
                onSuccess(customEmail || loginEmail);
            }
            window.location.reload(); // Refresh to update Nav
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm('register')) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: regEmail,
                    full_name: regName,
                    password: regPassword,
                    role: role
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Gagal membuat identitas baru.');
            }

            // Auto login after registration
            await handleLogin(undefined, regEmail, regPassword);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            // Simulated Google Auth response
            const mockGoogleData = {
                email: "user.sample@gmail.com",
                name: "Elite Member",
                token: "mock-google-token"
            };

            const res = await fetch(`${API_BASE}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mockGoogleData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Google authentication failed.');
            }

            localStorage.setItem("rci_token", data.access_token);
            localStorage.setItem("rci_user_email", mockGoogleData.email);

            setIsOpen(false);
            if (onSuccess) {
                onSuccess(mockGoogleData.email);
            }
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Reset forms when switching tabs or opening/closing
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setError('');
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-white/5 bg-[#1A1C1E] rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
                <div className="px-10 py-12 relative overflow-hidden">
                    {/* Decorative Background Accent */}
                    <div className="absolute -top-20 -right-20 size-64 bg-[#D4AF37]/5 rounded-full blur-[100px]"></div>

                    <DialogHeader className="relative z-10 text-center mb-6">
                        <DialogTitle className="text-4xl font-black tracking-tighter text-white mb-2">
                            SIGNATURE <span className="text-[#D4AF37]">ACCESS</span>
                        </DialogTitle>
                        <DialogDescription className="text-white/40 font-medium text-[10px] uppercase tracking-[0.2em]">
                            {activeTab === 'login'
                                ? 'Pintu masuk eksklusif Anda'
                                : 'Mulai perjalanan legal Anda'}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl border border-red-500/20 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="size-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <Tabs value={activeTab} onValueChange={(val: any) => { setActiveTab(val); setError(''); }} className="w-full relative z-10">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-full mb-6 border border-white/5">
                            <TabsTrigger
                                value="login"
                                className="rounded-full font-black text-[10px] uppercase tracking-widest py-2.5 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1C1E] transition-all text-white/40"
                            >
                                Masuk
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-full font-black text-[10px] uppercase tracking-widest py-2.5 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1A1C1E] transition-all text-white/40"
                            >
                                Daftar
                            </TabsTrigger>
                        </TabsList>

                        {/* Social Auth Section */}
                        <div className="mb-6 space-y-4">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleGoogleAuth}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all active:scale-[0.98] group disabled:opacity-50"
                            >
                                <svg className="size-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        style={{ fill: '#4285F4' }}
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        style={{ fill: '#34A853' }}
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        style={{ fill: '#FBBC05' }}
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                        style={{ fill: '#EA4335' }}
                                    />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Continue with Google</span>
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="h-px bg-white/5 flex-1"></div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Or Identity</span>
                                <div className="h-px bg-white/5 flex-1"></div>
                            </div>
                        </div>

                        <TabsContent value="login" className="mt-0 outline-none">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4">
                                        Identitas Digital
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={loading}
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full h-14 rounded-2xl bg-white/5 border border-transparent focus:border-[#D4AF37]/20 px-6 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none transition-all disabled:opacity-50"
                                        placeholder="email@signature.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4">
                                        Sandi Keamanan
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        disabled={loading}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full h-14 rounded-2xl bg-white/5 border border-transparent focus:border-[#D4AF37]/20 px-6 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none transition-all disabled:opacity-50"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 mt-2 bg-white text-[#1A1C1E] rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#D4AF37] transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="size-4 border-2 border-[#1A1C1E]/20 border-t-[#1A1C1E] rounded-full animate-spin"></div>
                                    ) : 'Access Identity'}
                                </button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register" className="mt-0 outline-none">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-2">
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-3 ml-2">Pilih Peran Anda</p>
                                    <div className="flex gap-3">
                                        <label className={`flex-1 flex items-center justify-center cursor-pointer p-2.5 rounded-xl border transition-all ${role === 'client' ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1A1C1E]' : 'border-white/5 text-white/40 hover:bg-white/5'}`}>
                                            <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} className="hidden" />
                                            <span className="text-[9px] font-black uppercase tracking-tight">Klien</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center cursor-pointer p-2.5 rounded-xl border transition-all ${role === 'lawyer' ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1A1C1E]' : 'border-white/5 text-white/40 hover:bg-white/5'}`}>
                                            <input type="radio" name="role" value="lawyer" checked={role === 'lawyer'} onChange={() => setRole('lawyer')} className="hidden" />
                                            <span className="text-[9px] font-black uppercase tracking-tight">Advisor</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={loading}
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className="w-full h-14 rounded-2xl bg-white/5 border border-transparent focus:border-[#D4AF37]/20 px-6 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none transition-all disabled:opacity-50"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={loading}
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="w-full h-14 rounded-2xl bg-white/5 border border-transparent focus:border-[#D4AF37]/20 px-6 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none transition-all disabled:opacity-50"
                                        placeholder="email@signature.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4">
                                        Sandi
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        disabled={loading}
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="w-full h-14 rounded-2xl bg-white/5 border border-transparent focus:border-[#D4AF37]/20 px-6 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none transition-all disabled:opacity-50"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 mt-2 bg-[#D4AF37] text-[#1A1C1E] rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="size-4 border-2 border-[#1A1C1E]/20 border-t-[#1A1C1E] rounded-full animate-spin"></div>
                                    ) : 'Create Identity'}
                                </button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
