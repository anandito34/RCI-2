import { useState, useEffect, useRef } from 'react';
import { API_BASE, WS_BASE } from '../config/api';
import { Send, ArrowLeft, Phone, Video, Paperclip, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { PaymentModal } from './PaymentModal';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'lawyer';
    sender_id?: number;
    timestamp: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
}

interface Lawyer {
    id: number;
    name: string;
    email: string;
    specialization: string;
    image: string;
    status: 'online' | 'offline';
    description: string;
    rating: number;
    experience_years: number;
    user_id: number;
    hourly_rate: number;
}

interface ConsultationViewProps {
    onBack: () => void;
    userEmail: string;
}

export function ConsultationView({ onBack, userEmail }: ConsultationViewProps) {
    const [view, setView] = useState<'lobby' | 'chat'>('lobby');
    const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [isLoadingLawyers, setIsLoadingLawyers] = useState(true);
    const [paymentLawyer, setPaymentLawyer] = useState<Lawyer | null>(null);

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

    // Fetch verified lawyers from database
    useEffect(() => {
        const fetchLawyers = async () => {
            setIsLoadingLawyers(true);
            try {
                const res = await fetch(`${API_BASE}/api/lawyers/verified`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped: Lawyer[] = data.map((lp: any) => ({
                        id: lp.id,
                        user_id: lp.user_id,
                        name: lp.user.full_name,
                        email: lp.user.email,
                        specialization: lp.specialty?.name || 'Umum',
                        image: lp.user.profile_picture_url || lp.profile_picture_url || '',
                        status: 'online' as const,
                        description: lp.bio,
                        rating: lp.rating,
                        experience_years: lp.experience_years,
                        hourly_rate: lp.hourly_rate || 500000,
                    }));
                    setLawyers(mapped);
                }
            } catch (e) {
                console.error("Failed fetching lawyers", e);
            } finally {
                setIsLoadingLawyers(false);
            }
        };
        fetchLawyers();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>({});

    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedLawyer, chatHistories, view]);

    const handleEnterChat = async (lawyer: Lawyer) => {
        setSelectedLawyer(lawyer);
        setView('chat');

        // Close any existing WS
        if (wsRef.current) {
            wsRef.current.close();
        }

        if (currentUserId) {
            // Load chat history from API
            const roomId = `${Math.min(currentUserId, lawyer.user_id)}_${Math.max(currentUserId, lawyer.user_id)}`;
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
                        sender: msg.sender_id === currentUserId ? 'user' : 'lawyer',
                        sender_id: msg.sender_id,
                        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: msg.message_type,
                        file_url: msg.file_url,
                    }));
                    setChatHistories(prev => ({
                        ...prev,
                        [lawyer.id]: mappedHistory,
                    }));
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            }

            // Connect WebSocket for real-time messages
            const ws = new WebSocket(`${WS_BASE}/ws/chat/${currentUserId}/${lawyer.user_id}`);
            ws.onopen = () => {
                console.log('WebSocket connected to room:', currentUserId, lawyer.user_id);
            };
            ws.onmessage = (event) => {
                const data: Message = JSON.parse(event.data);
                const formattedMsg = {
                    ...data,
                    sender: data.sender_id === currentUserId ? 'user' : 'lawyer'
                } as Message;

                setChatHistories(prev => ({
                    ...prev,
                    [lawyer.id]: [...(prev[lawyer.id] || []), formattedMsg]
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
        if (!inputText.trim() || !selectedLawyer || !currentUserId) return;

        const newMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: 'user', // We don't use this directly anymore, but keep for type
            sender_id: currentUserId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(newMessage));
        } else {
            console.error("WebSocket is not connected.");
        }
        setInputText('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedLawyer || !currentUserId) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_BASE}/api/chat/upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                const fileMessage: Message = {
                    id: Date.now(),
                    text: `📎 ${data.file_name}`,
                    sender: 'user',
                    sender_id: currentUserId,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    file_url: data.file_url,
                    file_name: data.file_name,
                    file_type: data.file_type,
                };

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify(fileMessage));
                }
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (view === 'lobby') {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
                {/* Lobby Header */}
                <header className="bg-white/40 backdrop-blur-3xl border-b border-[#1A1C1E]/5 px-8 py-6 sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-black text-[#1A1C1E] tracking-tight">Executive Hub</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-[#1A1C1E] px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                <ArrowLeft className="size-4" />
                                Beranda
                            </button>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-5 bg-[#1A1C1E] pl-6 pr-3 py-2.5 rounded-full shadow-xl shadow-black/10 hover:bg-[#1A1C1E]/90 transition-all active:scale-95 group cursor-pointer"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.3em] leading-none mb-1 transition-colors">Authenticated</p>
                                        <p className="text-xs font-black text-white leading-none">{userEmail.split('@')[0]}</p>
                                    </div>
                                    <Avatar className="size-10 border-2 border-white/10 ring-2 ring-[#D4AF37]/20 group-hover:ring-white/30 transition-all">
                                        <AvatarFallback className="bg-[#D4AF37] text-[#1A1C1E] font-black text-xs transition-colors">
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

                {/* Lobby Content */}
                <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12 lg:p-20">
                    <div className="mb-20">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#1A1C1E]/5 shadow-sm mb-8">
                            <div className="size-2 rounded-full bg-[#D4AF37]"></div>
                            <span className="text-[9px] font-black tracking-[0.3em] text-[#1A1C1E] uppercase">Select Your Advisor</span>
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black text-[#1A1C1E] mb-6 tracking-tight">Para Pakar Berpengalaman.</h2>
                        <p className="text-[#1A1C1E]/40 text-lg max-w-xl font-medium leading-relaxed">Pilih konsultan hukum terbaik untuk mendampingi setiap langkah strategis Anda.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                        {isLoadingLawyers ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <div className="size-16 rounded-full border-4 border-stone-200 border-t-[#D4AF37] animate-spin mb-6"></div>
                                <p className="text-sm font-bold text-[#1A1C1E]/40 uppercase tracking-widest">Memuat daftar pengacara...</p>
                            </div>
                        ) : lawyers.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <div className="size-24 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                                    <svg className="size-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-[#1A1C1E]/60 mb-2">Belum Ada Pengacara Tersedia</h3>
                                <p className="text-sm font-medium text-[#1A1C1E]/30 max-w-sm text-center">Pengacara yang sudah diverifikasi oleh admin akan muncul di sini. Silakan kembali lagi nanti.</p>
                            </div>
                        ) : lawyers.map((lawyer) => (
                            <div key={lawyer.id} className="group relative">
                                {/* Luxury Card Frame */}
                                <div className="absolute -inset-2 border border-[#1A1C1E]/5 rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700"></div>

                                <div className="relative z-10 bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(26,28,30,0.05)] border border-[#1A1C1E]/5 transition-all duration-500 hover:-translate-y-2">
                                    <div className="flex flex-col items-center mb-10">
                                        <div className="relative mb-6">
                                            <Avatar className="size-32 border-[6px] border-[#F8F9FA] shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                                <AvatarImage src={lawyer.image} className="object-cover" />
                                                <AvatarFallback className="font-black text-2xl bg-stone-100">{lawyer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {lawyer.status === 'online' && (
                                                <div className="absolute bottom-2 right-2 size-6 bg-[#D4AF37] rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-black text-2xl text-[#1A1C1E] mb-2">{lawyer.name}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                                                {lawyer.specialization}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[#1A1C1E]/60 text-sm leading-relaxed mb-10 text-center font-medium">
                                        "{lawyer.description}"
                                    </p>

                                    <div className="flex items-center justify-center gap-6 mb-10 py-6 border-y border-[#1A1C1E]/5">
                                        <div className="text-center">
                                            <p className="text-lg font-black text-[#1A1C1E] leading-none mb-1">{lawyer.rating > 0 ? lawyer.rating.toFixed(1) : 'N/A'}</p>
                                            <p className="text-[8px] font-black text-[#1A1C1E]/30 uppercase tracking-widest">Rating</p>
                                        </div>
                                        <div className="w-px h-8 bg-[#1A1C1E]/5"></div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-[#1A1C1E] leading-none mb-1">{lawyer.experience_years} Th</p>
                                            <p className="text-[8px] font-black text-[#1A1C1E]/30 uppercase tracking-widest">Pengalaman</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setPaymentLawyer(lawyer)}
                                        className="w-full bg-[#1A1C1E] hover:bg-[#D4AF37] text-white hover:text-[#1A1C1E] py-8 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-black/10 hover:shadow-[#D4AF37]/20 active:scale-95"
                                    >
                                        Mulai Sesi
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Payment Modal */}
                {paymentLawyer && (
                    <PaymentModal
                        isOpen={!!paymentLawyer}
                        onClose={() => setPaymentLawyer(null)}
                        onPaymentSuccess={() => {
                            const lawyer = paymentLawyer;
                            setPaymentLawyer(null);
                            handleEnterChat(lawyer);
                        }}
                        lawyer={{
                            id: paymentLawyer.id,
                            name: paymentLawyer.name,
                            specialization: paymentLawyer.specialization,
                            image: paymentLawyer.image,
                            rating: paymentLawyer.rating,
                            experience_years: paymentLawyer.experience_years,
                            hourly_rate: paymentLawyer.hourly_rate ?? 500000,
                        }}
                    />
                )}
            </div>
        );
    }

    // Chat Room View
    if (!selectedLawyer) return null;
    const currentMessages = chatHistories[selectedLawyer.id] || [];

    return (
        <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
            <div className="flex-1 flex flex-col m-3 bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(26,28,30,0.1)] border border-[#1A1C1E]/5 overflow-hidden">
                {/* Chat Header */}
                <header className="h-20 shrink-0 border-b border-[#1A1C1E]/5 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-5">
                        <button onClick={() => setView('lobby')} className="size-10 flex items-center justify-center rounded-full hover:bg-stone-50 transition-all border border-[#1A1C1E]/5 active:scale-90">
                            <ArrowLeft className="size-4 text-[#1A1C1E]/40" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="size-12 border-2 border-stone-50 shadow-lg">
                                    <AvatarImage src={selectedLawyer.image} className="object-cover" />
                                    <AvatarFallback className="font-black text-xl">{selectedLawyer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className={`absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-white shadow-sm ${selectedLawyer.status === 'online' ? 'bg-[#D4AF37]' : 'bg-stone-300'}`}></div>
                            </div>
                            <div>
                                <h3 className="font-black text-[#1A1C1E] text-lg leading-none mb-1 tracking-tight">{selectedLawyer.name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{selectedLawyer.specialization}</span>
                                    <div className="size-1 rounded-full bg-[#1A1C1E]/20"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1A1C1E]/30">Live Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="size-10 rounded-full border border-[#1A1C1E]/5 flex items-center justify-center text-[#1A1C1E]/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all shadow-sm">
                            <Phone className="size-4" />
                        </button>
                        <button className="size-10 rounded-full border border-[#1A1C1E]/5 flex items-center justify-center text-[#1A1C1E]/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all shadow-sm">
                            <Video className="size-4" />
                        </button>
                    </div>
                </header>

                {/* Message Area */}
                <ScrollArea className="flex-1 bg-[#F8F9FA]/30 overflow-y-auto" ref={scrollRef}>
                    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-6">
                        <div className="flex justify-center mb-8">
                            <div className="bg-white px-8 py-2.5 rounded-full border border-[#1A1C1E]/5 shadow-sm">
                                <p className="text-[9px] font-black text-[#1A1C1E]/30 uppercase tracking-[0.3em]">End-to-End Encrypted Session</p>
                            </div>
                        </div>

                        {currentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}
                            >
                                <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`px-8 py-6 rounded-[2.5rem] text-base font-medium leading-relaxed shadow-xl ${msg.sender === 'user'
                                            ? 'bg-[#1A1C1E] text-white rounded-br-none shadow-black/10'
                                            : 'bg-white text-[#1A1C1E] border border-[#1A1C1E]/5 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.file_url ? (
                                            msg.file_type?.startsWith('image/') ? (
                                                <div>
                                                    <img src={msg.file_url} alt={msg.file_name || 'image'} className="max-w-xs rounded-2xl mb-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.file_url, '_blank')} />
                                                    <p className="text-xs opacity-70">{msg.file_name}</p>
                                                </div>
                                            ) : (
                                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                    <div className={`size-10 rounded-xl flex items-center justify-center ${msg.sender === 'user' ? 'bg-white/20' : 'bg-[#1A1C1E]/5'}`}>
                                                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm leading-none mb-1">{msg.file_name || 'Dokumen'}</p>
                                                        <p className="text-[10px] opacity-60">Klik untuk unduh</p>
                                                    </div>
                                                </a>
                                            )
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 px-3">
                                        <span className="text-[9px] font-black text-[#1A1C1E]/20 uppercase tracking-widest">
                                            {msg.timestamp}
                                        </span>
                                        {msg.sender === 'user' && <div className="size-1 rounded-full bg-[#D4AF37]"></div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-[#1A1C1E]/5 shrink-0">
                    <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`size-12 rounded-2xl border border-[#1A1C1E]/5 flex items-center justify-center transition-all ${isUploading ? 'text-[#D4AF37] animate-pulse' : 'text-[#1A1C1E]/20 hover:text-[#1A1C1E] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5'}`}
                        >
                            {isUploading ? (
                                <div className="size-6 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin"></div>
                            ) : (
                                <Paperclip className="size-6" />
                            )}
                        </button>
                        <div className="flex-1 relative group">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Tanyakan sesuatu pada ${selectedLawyer.name.split(' ')[0]}...`}
                                className="w-full bg-stone-50 border border-transparent focus:border-[#1A1C1E]/5 focus:bg-white h-14 rounded-2xl px-6 focus:outline-none text-[#1A1C1E] placeholder:text-stone-300 font-medium text-base transition-all shadow-inner"
                            />
                        </div>
                        <button
                            type="submit"
                            className="size-14 rounded-2xl bg-[#1A1C1E] hover:bg-[#D4AF37] text-white hover:text-[#1A1C1E] shadow-2xl shadow-black/10 active:scale-95 flex items-center justify-center transition-all disabled:opacity-20 disabled:grayscale"
                            disabled={!inputText.trim()}
                        >
                            <Send className="size-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

}
