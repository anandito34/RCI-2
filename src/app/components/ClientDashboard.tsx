import { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { MessageSquare, FileText, Clock, ArrowRight, LogOut, Settings, Home, Scale, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { NotificationCenter } from './NotificationCenter';

interface ClientDashboardProps {
    onBack: () => void;
    onConsult: () => void;
    userEmail: string;
    userName: string;
}

interface Consultation {
    id: number;
    status: string;
    scheduled_for: string | null;
    created_at: string | null;
    notes: string | null;
    lawyer_name: string;
    lawyer_specialty: string;
    lawyer_user_id: number | null;
}

interface ChatSession {
    lawyer_user_id: number;
    client_id: number;
}

export function ClientDashboard({ onBack, onConsult, userEmail, userName }: ClientDashboardProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'chats'>('overview');

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('rci_token');
            if (token) {
                try {
                    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentUserId(data.id);
                    }
                } catch (e) {
                    console.error("Failed fetching user", e);
                }
            }
        };
        fetchUser();
    }, []);

    // Fetch consultations and chat sessions
    useEffect(() => {
        if (!currentUserId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [consultRes, chatRes] = await Promise.all([
                    fetch(`${API_BASE}/api/clients/${currentUserId}/consultations`),
                    fetch(`${API_BASE}/api/clients/${currentUserId}/chat-sessions`),
                ]);
                if (consultRes.ok) {
                    const data = await consultRes.json();
                    setConsultations(data);
                }
                if (chatRes.ok) {
                    const data = await chatRes.json();
                    setChatSessions(data);
                }
            } catch (e) {
                console.error("Failed fetching data", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();

        // Poll chat sessions
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/api/clients/${currentUserId}/chat-sessions`);
                if (res.ok) setChatSessions(await res.json());
            } catch { }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUserId]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-500/10 text-blue-700 border-blue-200';
            case 'pending': return 'bg-amber-500/10 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-500/10 text-red-700 border-red-200';
            default: return 'bg-stone-100 text-stone-600 border-stone-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Aktif';
            case 'completed': return 'Selesai';
            case 'pending': return 'Menunggu';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            {/* Dashboard Header */}
            <header className="bg-white/40 backdrop-blur-3xl border-b border-[#1A1C1E]/5 px-8 py-6 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-black text-[#1A1C1E] tracking-tight">Client Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={onConsult}
                            className="bg-[#D4AF37] hover:bg-[#C5A028] text-[#1A1C1E] rounded-full font-black text-xs uppercase tracking-widest px-6 py-5 shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all"
                        >
                            <Scale className="size-4 mr-2" />
                            Konsultasi Baru
                        </Button>

                        <NotificationCenter />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-5 bg-[#1A1C1E] pl-6 pr-3 py-2.5 rounded-full shadow-xl shadow-black/10 hover:bg-[#1A1C1E]/90 transition-all active:scale-95 group cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.3em] leading-none mb-1">Client</p>
                                    <p className="text-xs font-black text-white leading-none">{userName || userEmail.split('@')[0]}</p>
                                </div>
                                <Avatar className="size-10 border-2 border-white/10 ring-2 ring-[#D4AF37]/20 group-hover:ring-white/30 transition-all">
                                    <AvatarFallback className="bg-[#D4AF37] text-[#1A1C1E] font-black text-xs">
                                        {(userName || userEmail).charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-[#1A1C1E]/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2">
                                        <div className="px-4 py-3 border-b border-[#1A1C1E]/5 mb-2">
                                            <p className="text-xs font-black text-[#1A1C1E] truncate">{userEmail}</p>
                                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-1">Client</p>
                                        </div>
                                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#1A1C1E]/70 hover:text-[#1A1C1E] hover:bg-stone-50 rounded-xl transition-colors">
                                            <Settings className="size-4" />
                                            Pengaturan
                                        </button>
                                        <button
                                            onClick={onBack}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <LogOut className="size-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12 lg:p-20">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-5xl font-black text-[#1A1C1E] tracking-tight mb-4">
                        Halo, {userName || userEmail.split('@')[0]}!
                    </h2>
                    <p className="text-[#1A1C1E]/60 text-lg max-w-2xl font-medium leading-relaxed">
                        Kelola semua konsultasi hukum Anda dalam satu tempat. Lihat riwayat kasus dan sesi chat aktif.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A1C1E]/5">
                        <p className="text-3xl font-black text-[#1A1C1E] mb-1">{consultations.length}</p>
                        <p className="text-[10px] font-black text-[#1A1C1E]/30 uppercase tracking-widest">Total Kasus</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A1C1E]/5">
                        <p className="text-3xl font-black text-emerald-600 mb-1">{consultations.filter(c => c.status === 'active').length}</p>
                        <p className="text-[10px] font-black text-[#1A1C1E]/30 uppercase tracking-widest">Kasus Aktif</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A1C1E]/5">
                        <p className="text-3xl font-black text-blue-600 mb-1">{consultations.filter(c => c.status === 'completed').length}</p>
                        <p className="text-[10px] font-black text-[#1A1C1E]/30 uppercase tracking-widest">Selesai</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#1A1C1E]/5">
                        <p className="text-3xl font-black text-[#D4AF37] mb-1">{chatSessions.length}</p>
                        <p className="text-[10px] font-black text-[#1A1C1E]/30 uppercase tracking-widest">Chat Aktif</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 shadow-sm border border-[#1A1C1E]/5 w-fit">
                    {(['overview', 'cases', 'chats'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-[#1A1C1E] text-white shadow-lg'
                                : 'text-[#1A1C1E]/40 hover:text-[#1A1C1E] hover:bg-stone-50'
                                }`}
                        >
                            {tab === 'overview' ? 'Ringkasan' : tab === 'cases' ? 'Riwayat Kasus' : 'Sesi Chat'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="size-16 rounded-full border-4 border-stone-200 border-t-[#D4AF37] animate-spin mb-6"></div>
                        <p className="text-sm font-bold text-[#1A1C1E]/40 uppercase tracking-widest">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Active Chat Sessions */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-[#1A1C1E]/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="size-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                                            <MessageSquare className="size-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[#1A1C1E]">Sesi Chat Aktif</h3>
                                            <p className="text-sm font-medium text-[#1A1C1E]/40">Chat yang sedang berlangsung</p>
                                        </div>
                                    </div>

                                    {chatSessions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="size-16 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4">
                                                <MessageSquare className="size-8 text-stone-200" />
                                            </div>
                                            <p className="text-sm font-medium text-stone-300">Tidak ada sesi chat aktif.</p>
                                            <Button onClick={onConsult} className="mt-4 bg-[#D4AF37] hover:bg-[#C5A028] text-[#1A1C1E] rounded-full font-bold text-xs px-6 py-3">
                                                Mulai Konsultasi
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {chatSessions.map((session, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        <div>
                                                            <p className="font-bold text-[#1A1C1E]">Chat dengan Pengacara #{session.lawyer_user_id}</p>
                                                            <p className="text-xs text-emerald-600 font-medium">Sesi aktif</p>
                                                        </div>
                                                    </div>
                                                    <Button onClick={onConsult} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs px-5 py-2.5">
                                                        Buka Chat
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Consultations */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-[#1A1C1E]/5">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <FileText className="size-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-[#1A1C1E]">Kasus Terbaru</h3>
                                                <p className="text-sm font-medium text-[#1A1C1E]/40">Riwayat konsultasi terakhir</p>
                                            </div>
                                        </div>
                                        {consultations.length > 3 && (
                                            <button onClick={() => setActiveTab('cases')} className="text-xs font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                Lihat Semua <ChevronRight className="size-3" />
                                            </button>
                                        )}
                                    </div>

                                    {consultations.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="size-16 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4">
                                                <FileText className="size-8 text-stone-200" />
                                            </div>
                                            <p className="text-sm font-medium text-stone-300">Belum ada riwayat konsultasi.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {consultations.slice(0, 3).map((c) => (
                                                <div key={c.id} className="flex items-center gap-5 p-5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 transition-all group">
                                                    <Avatar className="size-12 border-2 border-white shadow-md">
                                                        <AvatarFallback className="font-black text-sm bg-[#1A1C1E] text-white">{c.lawyer_name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[#1A1C1E] leading-none mb-1.5">{c.lawyer_name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{c.lawyer_specialty}</span>
                                                            <div className="size-1 rounded-full bg-[#1A1C1E]/15"></div>
                                                            <span className="text-[10px] font-medium text-[#1A1C1E]/30">{formatDate(c.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getStatusColor(c.status)}`}>
                                                        {getStatusLabel(c.status)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CASES TAB */}
                        {activeTab === 'cases' && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-[#1A1C1E]/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <FileText className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#1A1C1E]">Semua Riwayat Kasus</h3>
                                        <p className="text-sm font-medium text-[#1A1C1E]/40">{consultations.length} konsultasi tercatat</p>
                                    </div>
                                </div>

                                {consultations.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="size-24 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6">
                                            <FileText className="size-12 text-stone-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-stone-300 mb-2">Belum Ada Kasus</h3>
                                        <p className="text-sm text-stone-300 max-w-sm mx-auto mb-6">Mulai konsultasi pertama Anda dengan pengacara profesional kami.</p>
                                        <Button onClick={onConsult} className="bg-[#D4AF37] hover:bg-[#C5A028] text-[#1A1C1E] rounded-full font-black text-xs uppercase tracking-widest px-8 py-4">
                                            Mulai Konsultasi
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {consultations.map((c) => (
                                            <div key={c.id} className="p-6 rounded-2xl border border-[#1A1C1E]/5 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5 transition-all group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="size-14 border-2 border-stone-100 shadow-md">
                                                            <AvatarFallback className="font-black text-lg bg-[#1A1C1E] text-white">{c.lawyer_name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="font-black text-[#1A1C1E] text-lg leading-none mb-1.5">{c.lawyer_name}</h4>
                                                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{c.lawyer_specialty}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${getStatusColor(c.status)}`}>
                                                        {getStatusLabel(c.status)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-6 text-xs font-medium text-[#1A1C1E]/40">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-3.5" />
                                                        <span>Dibuat: {formatDate(c.created_at)}</span>
                                                    </div>
                                                    {c.scheduled_for && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="size-3.5" />
                                                            <span>Dijadwalkan: {formatDate(c.scheduled_for)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {c.notes && (
                                                    <p className="mt-3 text-sm text-[#1A1C1E]/50 font-medium bg-stone-50 rounded-xl p-4 border border-[#1A1C1E]/5">
                                                        {c.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CHATS TAB */}
                        {activeTab === 'chats' && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-[#1A1C1E]/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                                        <MessageSquare className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#1A1C1E]">Sesi Chat</h3>
                                        <p className="text-sm font-medium text-[#1A1C1E]/40">{chatSessions.length} sesi aktif</p>
                                    </div>
                                </div>

                                {chatSessions.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="size-24 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare className="size-12 text-stone-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-stone-300 mb-2">Belum Ada Chat Aktif</h3>
                                        <p className="text-sm text-stone-300 max-w-sm mx-auto mb-6">Mulai konsultasi untuk membuka sesi chat dengan pengacara.</p>
                                        <Button onClick={onConsult} className="bg-[#D4AF37] hover:bg-[#C5A028] text-[#1A1C1E] rounded-full font-black text-xs uppercase tracking-widest px-8 py-4">
                                            Mulai Konsultasi
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {chatSessions.map((session, idx) => (
                                            <button
                                                key={idx}
                                                onClick={onConsult}
                                                className="w-full flex items-center justify-between p-6 rounded-2xl bg-stone-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all group cursor-pointer active:scale-[0.99]"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <Avatar className="size-14 border-2 border-white shadow-lg">
                                                        <AvatarFallback className="font-black text-lg bg-emerald-100 text-emerald-700">P</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-left">
                                                        <h4 className="font-black text-[#1A1C1E] text-lg leading-none mb-1.5">Pengacara #{session.lawyer_user_id}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            <span className="text-xs font-medium text-emerald-600">Sesi aktif</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Buka Chat</span>
                                                    <ArrowRight className="size-5 text-stone-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
