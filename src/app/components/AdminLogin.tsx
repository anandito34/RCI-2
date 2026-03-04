import { useState } from 'react';
import { API_BASE } from '../config/api';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface AdminLoginProps {
    onAuthSuccess: () => void;
}

export function AdminLogin({ onAuthSuccess }: AdminLoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Email atau kata sandi admin salah');
            }

            const data = await res.json();

            // Simpan token
            localStorage.setItem('rci_token', data.access_token);
            localStorage.setItem('rci_user_email', email);

            // Beri tahu App.tsx
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || 'Gagal login. Periksa koneksi Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1C1E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] size-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] size-[600px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-[#D4AF37] text-[#1A1C1E] mb-6 shadow-2xl shadow-[#D4AF37]/20">
                        <ShieldCheck className="size-8" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h1>
                    <p className="text-sm font-medium text-white/50">Restricted access for RCI administrators only.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold ring-1 ring-red-100 flex items-start gap-3">
                                <span className="text-red-500 uppercase tracking-widest text-[10px] mt-0.5 shrink-0">Error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/40 mb-2 ml-1">Admin Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#1A1C1E]/20" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@rci.com"
                                        className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all text-[#1A1C1E] placeholder:text-[#1A1C1E]/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/40 mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#1A1C1E]/20" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all text-[#1A1C1E] placeholder:text-[#1A1C1E]/20"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1A1C1E] hover:bg-[#D4AF37] text-white hover:text-[#1A1C1E] py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 hover:shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Secure Access</span>
                                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Text */}
                <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest mt-8">
                    &copy; 2026 Resolute Counsel Indonesia System
                </p>

            </div>
        </div>
    );
}
