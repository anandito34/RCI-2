import { useState, useRef, useEffect } from 'react';
import { API_BASE, WS_BASE } from '../config/api';
import { User, ShieldCheck, LogOut, Settings, Send, ArrowLeft, MessageSquare, Bell, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { ProfileSetupModal } from './ProfileSetupModal';
import { NotificationCenter } from './NotificationCenter';

interface AdvisorDashboardProps {
    onBack: () => void;
    userEmail: string;
}

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'lawyer';
    sender_id?: number;
    timestamp: string;
}

interface ActiveClient {
    client_id: number;
    client_name: string;
    client_email: string;
}

export function AdvisorDashboard({ onBack, userEmail }: AdvisorDashboardProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'chat'>('dashboard');
    const [selectedClient, setSelectedClient] = useState<ActiveClient | null>(null);
    const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>({});
    const [inputText, setInputText] = useState('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch current user (lawyer) ID
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

    // Poll for active client sessions every 3 seconds
    useEffect(() => {
        if (!currentUserId) return;

        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/lawyers/${currentUserId}/active-sessions`);
                if (res.ok) {
                    const data: ActiveClient[] = await res.json();
                    setActiveClients(data);
                }
            } catch (e) {
                console.error("Failed fetching sessions", e);
            }
        };

        // Fetch immediately
        fetchSessions();

        // Then poll every 3 seconds
        pollingRef.current = setInterval(fetchSessions, 3000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
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

    // Auto-scroll messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistories, selectedClient]);

    const connectToClient = async (client: ActiveClient) => {
        setSelectedClient(client);
        setCurrentView('chat');

        if (wsRef.current) {
            wsRef.current.close();
        }

        if (currentUserId) {
            // Load chat history from API
            const roomId = `${Math.min(client.client_id, currentUserId)}_${Math.max(client.client_id, currentUserId)}`;
            try {
                const token = localStorage.getItem('rci_token');
                const historyRes = await fetch(`${API_BASE}/api/chat/history/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    const mappedHistory = historyData.map((msg: any) => ({
                        id: msg.id,
                        text: msg.message,
                        sender: msg.sender_id === currentUserId ? 'lawyer' : 'user',
                        sender_id: msg.sender_id,
                        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: msg.message_type,
                        file_url: msg.file_url,
                    }));
                    setChatHistories(prev => ({
                        ...prev,
                        [client.client_id]: mappedHistory,
                    }));
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            }

            // Connect WebSocket for real-time messages
            const ws = new WebSocket(`${WS_BASE}/ws/chat/${client.client_id}/${currentUserId}`);
            ws.onopen = () => {
                console.log('Lawyer WebSocket connected to client:', client.client_id);
            };
            ws.onmessage = (event) => {
                const data: ChatMessage = JSON.parse(event.data);
                const formattedMsg = {
                    ...data,
                    sender: data.sender_id === currentUserId ? 'lawyer' : 'user'
                } as ChatMessage;

                setChatHistories(prev => ({
                    ...prev,
                    [client.client_id]: [...(prev[client.client_id] || []), formattedMsg]
                }));
            };
            ws.onerror = (err) => {
                console.error('WebSocket error:', err);
            };
            wsRef.current = ws;
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedClient || !currentUserId) return;

        const newMessage: ChatMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'lawyer',
            sender_id: currentUserId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(newMessage));
        }
        setInputText('');
    };

    // CHAT VIEW
    if (currentView === 'chat' && selectedClient) {
        return (
            <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
                <div className="flex-1 flex flex-col m-3 bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(26,28,30,0.1)] border border-[#1A1C1E]/5 overflow-hidden">
                    {/* Chat Header */}
                    <header className="h-20 shrink-0 border-b border-[#1A1C1E]/5 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setCurrentView('dashboard'); if (wsRef.current) wsRef.current.close(); }} className="size-10 flex items-center justify-center rounded-full hover:bg-stone-50 transition-all border border-[#1A1C1E]/5 active:scale-90">
                                <ArrowLeft className="size-4 text-[#1A1C1E]/40" />
                            </button>
                            <div className="flex items-center gap-4">
                                <Avatar className="size-12 border-2 border-stone-50 shadow-lg">
                                    <AvatarFallback className="font-black text-lg bg-blue-100 text-blue-700">{selectedClient.client_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-[#1A1C1E] text-xl leading-none mb-1 tracking-tight">{selectedClient.client_name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">Client Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Messages */}
                    <ScrollArea className="flex-1 bg-[#F8F9FA]/30 overflow-y-auto" ref={scrollRef}>
                        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="bg-white px-8 py-2.5 rounded-full border border-[#1A1C1E]/5 shadow-sm">
                                    <p className="text-[9px] font-black text-[#1A1C1E]/30 uppercase tracking-[0.3em]">End-to-End Encrypted Session</p>
                                </div>
                            </div>

                            {(chatHistories[selectedClient.client_id] || []).length === 0 && (
                                <div className="text-center py-20">
                                    <div className="size-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare className="size-10 text-stone-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-400 mb-2">Menunggu Pesan</h3>
                                    <p className="text-sm text-stone-300">Pesan dari klien akan muncul secara otomatis di sini.</p>
                                </div>
                            )}

                            {(chatHistories[selectedClient.client_id] || []).map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'lawyer' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                >
                                    <div className={`flex flex-col max-w-[75%] ${msg.sender === 'lawyer' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`px-7 py-5 rounded-[2rem] text-base font-medium leading-relaxed shadow-lg ${msg.sender === 'lawyer'
                                                ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-600/20'
                                                : 'bg-white text-[#1A1C1E] border border-[#1A1C1E]/5 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 px-3">
                                            <span className="text-[9px] font-black text-[#1A1C1E]/20 uppercase tracking-widest">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-[#1A1C1E]/5 shrink-0">
                        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={`Balas pesan ${selectedClient.client_name}...`}
                                    className="w-full bg-stone-50 border border-transparent focus:border-[#1A1C1E]/5 focus:bg-white h-14 rounded-2xl px-6 focus:outline-none text-[#1A1C1E] placeholder:text-stone-300 font-medium text-base transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="size-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center transition-all disabled:opacity-20"
                                disabled={!inputText.trim()}
                            >
                                <Send className="size-6" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // DASHBOARD VIEW (Default)
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            {/* Dashboard Header */}
            <header className="bg-white/40 backdrop-blur-3xl border-b border-[#1A1C1E]/5 px-8 py-6 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-black text-[#1A1C1E] tracking-tight">Advisor Control Panel</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-5 bg-[#1A1C1E] pl-6 pr-3 py-2.5 rounded-full shadow-xl shadow-black/10 hover:bg-[#1A1C1E]/90 transition-all active:scale-95 group cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.3em] leading-none mb-1 transition-colors">Status: Online</p>
                                    <p className="text-xs font-black text-white leading-none">{userEmail.split('@')[0]}</p>
                                </div>
                                <Avatar className="size-10 border-2 border-white/10 ring-2 ring-emerald-500/20 group-hover:ring-white/30 transition-all">
                                    <AvatarFallback className="bg-emerald-500 text-white font-black text-xs transition-colors">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-[#1A1C1E]/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2">
                                        <div className="px-4 py-3 border-b border-[#1A1C1E]/5 mb-2">
                                            <p className="text-xs font-black text-[#1A1C1E] truncate">{userEmail}</p>
                                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-1">Advisor</p>
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
                <div className="mb-12">
                    <h2 className="text-5xl font-black text-[#1A1C1E] tracking-tight mb-4">Selamat Datang, Partner.</h2>
                    <p className="text-[#1A1C1E]/60 text-lg max-w-2xl font-medium leading-relaxed">
                        Dashboard aktif memantau klien yang memulai sesi. Klik pada klien untuk membuka ruang percakapan.
                    </p>
                </div>

                {/* Active Client Sessions */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-[#1A1C1E]/5 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Bell className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#1A1C1E]">Klien Aktif</h3>
                                <p className="text-sm font-medium text-[#1A1C1E]/40">Sesi yang sedang berjalan — klik untuk membalas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {activeClients.length > 0 && (
                                <span className="bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full animate-pulse">
                                    {activeClients.length} aktif
                                </span>
                            )}
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    {activeClients.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="size-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="size-10 text-stone-200" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-300 mb-2">Belum Ada Klien</h3>
                            <p className="text-sm text-stone-300 max-w-sm mx-auto">
                                Ketika klien memulai sesi konsultasi dengan Anda, mereka akan muncul di sini secara otomatis.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeClients.map((client) => (
                                <button
                                    key={client.client_id}
                                    onClick={() => connectToClient(client)}
                                    className="w-full flex items-center gap-5 p-5 rounded-2xl bg-stone-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all group cursor-pointer active:scale-[0.99]"
                                >
                                    <Avatar className="size-14 border-2 border-white shadow-lg">
                                        <AvatarFallback className="font-black text-lg bg-blue-100 text-blue-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                                            {client.client_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-black text-[#1A1C1E] text-lg leading-none mb-1.5">{client.client_name}</h4>
                                        <p className="text-xs font-medium text-[#1A1C1E]/40">{client.client_email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Menunggu</span>
                                        </div>
                                        <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <Send className="size-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Status Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-[#1A1C1E]/5 flex flex-col items-center justify-center text-center">
                        <div className="size-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                            <ShieldCheck className="size-10" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1A1C1E] mb-2">Sistem Enkripsi Aktif</h3>
                        <p className="text-sm font-medium text-[#1A1C1E]/60 mb-8 max-w-sm">Jalur komunikasi Anda dengan calon klien dilindungi enkripsi end-to-end tingkat militer.</p>
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Siap Menerima Klien
                        </div>
                    </div>

                    {/* Profile Setup */}
                    <div className="bg-[#1A1C1E] rounded-[2rem] p-8 shadow-xl border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="size-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                                <User className="size-8 text-[#D4AF37]" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Lengkapi Profil Anda</h3>
                            <p className="text-sm font-medium text-white/60 mb-8 max-w-sm">Tambahkan foto profesional, spesialisasi hukum, dan dokumen legalitas agar klien dapat menemukan Anda.</p>
                        </div>
                        <Button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full bg-[#D4AF37] hover:bg-white text-[#1A1C1E] rounded-xl font-black text-xs uppercase tracking-widest py-6 transition-colors shadow-lg shadow-[#D4AF37]/20"
                        >
                            Lengkapi Sekarang
                        </Button>
                    </div>
                </div>
            </main>

            <ProfileSetupModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userEmail={userEmail}
            />
        </div>
    );
}
