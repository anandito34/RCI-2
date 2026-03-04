import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config/api';
import { Bell, Check, CheckCheck, CreditCard, MessageSquare, UserPlus, FileText, X } from 'lucide-react';

interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    related_id: number | null;
    created_at: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showToast, setShowToast] = useState<Notification | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef(0);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Fetch notifications
    const fetchNotifications = async () => {
        const token = localStorage.getItem('rci_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const data: Notification[] = await res.json();
                // Show toast for new notifications
                const newUnread = data.filter(n => !n.is_read).length;
                if (newUnread > prevCountRef.current && prevCountRef.current > 0) {
                    const newest = data.find(n => !n.is_read);
                    if (newest) {
                        setShowToast(newest);
                        setTimeout(() => setShowToast(null), 4000);
                    }
                }
                prevCountRef.current = newUnread;
                setNotifications(data);
            }
        } catch (e) {
            console.error('Failed fetching notifications', e);
        }
    };

    // Poll every 5 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        const token = localStorage.getItem('rci_token');
        if (!token) return;
        await fetch(`${API_BASE}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllRead = async () => {
        const token = localStorage.getItem('rci_token');
        if (!token) return;
        await fetch(`${API_BASE}/api/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'payment_success': return <CreditCard className="size-4" />;
            case 'new_client': return <UserPlus className="size-4" />;
            case 'new_message': return <MessageSquare className="size-4" />;
            default: return <FileText className="size-4" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'payment_success': return 'bg-emerald-500/10 text-emerald-600';
            case 'new_client': return 'bg-blue-500/10 text-blue-600';
            case 'new_message': return 'bg-[#D4AF37]/10 text-[#D4AF37]';
            default: return 'bg-stone-100 text-stone-500';
        }
    };

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        return `${Math.floor(diff / 86400)} hari lalu`;
    };

    return (
        <>
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="bg-[#1A1C1E] text-white rounded-2xl shadow-2xl shadow-black/30 border border-white/10 p-5 max-w-sm flex items-start gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${getIconColor(showToast.type)}`}>
                            {getIcon(showToast.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white leading-tight">{showToast.title}</p>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed line-clamp-2">{showToast.message}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(null)}
                            className="size-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all shrink-0"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bell Icon + Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative size-12 rounded-full border border-[#1A1C1E]/10 flex items-center justify-center text-[#1A1C1E]/50 hover:text-[#1A1C1E] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all active:scale-95"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-lg shadow-red-500/30">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-[#1A1C1E]/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-[#1A1C1E]/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black text-[#1A1C1E]">Notifikasi</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                        {unreadCount} baru
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:text-[#1A1C1E] transition-colors"
                                >
                                    <CheckCheck className="size-3.5" />
                                    Baca Semua
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="size-14 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4">
                                        <Bell className="size-7 text-stone-200" />
                                    </div>
                                    <p className="text-sm font-medium text-stone-300">Belum ada notifikasi</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-all hover:bg-stone-50 active:bg-stone-100 border-b border-[#1A1C1E]/[0.03] last:border-0 ${!notif.is_read ? 'bg-[#D4AF37]/[0.03]' : ''
                                            }`}
                                    >
                                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getIconColor(notif.type)}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm leading-tight ${!notif.is_read ? 'font-black text-[#1A1C1E]' : 'font-bold text-[#1A1C1E]/60'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <div className="size-2 rounded-full bg-[#D4AF37] shrink-0"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#1A1C1E]/40 leading-relaxed line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] font-bold text-[#1A1C1E]/20 mt-1.5">{timeAgo(notif.created_at)}</p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="shrink-0 mt-1">
                                                <Check className="size-4 text-[#D4AF37]" />
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
