import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    LogOut,
    Search,
    CheckCircle2,
    XCircle,
    Eye,
    CreditCard,
    AlertTriangle,
    Wallet,
    ChevronDown,
    FileText,
    MessageSquare,
    Scale
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface AdminDashboardProps {
    onLogout: () => void;
    userEmail: string;
}

interface LawyerProfile {
    id: number;
    bio: string;
    experience_years: number;
    hourly_rate: number;
    rating: number;
    is_verified: boolean;
    ktp_url?: string;
    certificate_url?: string;
    user: {
        id: number;
        full_name: string;
        email: string;
        profile_picture_url?: string;
    };
    specialty: {
        id: number;
        name: string;
    };
}

const MOCK_USERS = [
    { id: 1, name: "Sarah Mitchell", role: "lawyer", status: "Verified" },
    { id: 2, name: "Alex Johnson", role: "client", status: "Active" },
    { id: 3, name: "Rina Wijaya", role: "client", status: "Active" },
    { id: 4, name: "Budi Santoso", role: "lawyer", status: "Pending" },
];

const MOCK_TRANSACTIONS = [
    { id: "TRX-001", client: "Rina Sari", lawyer: "Andi Wijaya", amount: "Rp 500,000", date: "2026-02-25", status: "Completed" },
    { id: "TRX-002", client: "Budi Hartono", lawyer: "Sari Kusuma", amount: "Rp 700,000", date: "2026-02-26", status: "Ongoing" },
    { id: "TRX-003", client: "Dina Permata", lawyer: "Budi Santoso", amount: "Rp 450,000", date: "2026-02-24", status: "Completed" },
    { id: "TRX-004", client: "Lisa Wong", lawyer: "Putra Mahendra", amount: "Rp 650,000", date: "2026-02-27", status: "Paid" },
    { id: "TRX-005", client: "Melati Indah", lawyer: "Andi Wijaya", amount: "Rp 600,000", date: "2026-02-23", status: "Disputed" },
    { id: "TRX-006", client: "Rudi Hermawan", lawyer: "Sarah Wijaya", amount: "Rp 800,000", date: "2026-02-22", status: "Refunded" },
];

export function AdminDashboard({ onLogout, userEmail }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'verification' | 'users' | 'transactions' | 'disputes' | 'payouts'>('dashboard');
    const [pendingLawyers, setPendingLawyers] = useState<LawyerProfile[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

    useEffect(() => {
        fetchPendingLawyers();
    }, []);

    const fetchPendingLawyers = async () => {
        setIsLoadingProfiles(true);
        try {
            const token = localStorage.getItem('rci_token');
            const res = await fetch(`${API_BASE}/api/admin/lawyers/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingLawyers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const handleVerify = async (id: number, action: 'approve' | 'reject') => {
        try {
            const token = localStorage.getItem('rci_token');
            const res = await fetch(`${API_BASE}/api/admin/lawyers/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: action })
            });

            if (res.ok) {
                // Refresh list
                fetchPendingLawyers();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Ongoing': return 'bg-blue-100 text-blue-700';
            case 'Paid': return 'bg-purple-100 text-purple-700';
            case 'Disputed': return 'bg-red-100 text-red-700';
            case 'Refunded': return 'bg-gray-200 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden text-[#1E293B]">

            {/* Sidebar */}
            <aside className="w-64 bg-[#F8F9FA] flex flex-col transition-all duration-300 border-r border-gray-200 shrink-0">
                <div className="h-16 flex items-center px-8">
                    <span className="font-extrabold text-xl text-[#0F172A] tracking-tight">LOGO</span>
                </div>

                <div className="px-4 py-4 flex-1">
                    {/* Admin Header Info */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-200/50 rounded-lg mb-4 text-[#0F172A]">
                        <LayoutDashboard className="size-4" />
                        <span className="font-bold text-sm tracking-wide">ADMIN</span>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all text-sm ${activeTab === 'dashboard' ? 'bg-gray-200/50 text-[#0F172A] font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <LayoutDashboard className="size-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('verification')}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm ${activeTab === 'verification' ? 'bg-gray-200/50 text-[#0F172A] font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="size-4" />
                                Verify Lawyers
                            </div>
                            {pendingLawyers.length > 0 && (
                                <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeTab === 'verification' ? 'bg-gray-300 text-gray-800' : 'bg-gray-200 text-gray-600'}`}>
                                    {pendingLawyers.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all text-sm ${activeTab === 'users' ? 'bg-gray-200/50 text-[#0F172A] font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <Users className="size-4" />
                            All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all text-sm ${activeTab === 'transactions' ? 'bg-gray-200/50 text-[#0F172A] font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <CreditCard className="size-4" />
                            Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('disputes')}
                            className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all text-sm ${activeTab === 'disputes' ? 'bg-gray-200/50 text-[#0F172A] font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <AlertTriangle className="size-4" />
                            Disputes
                        </button>
                        <button
                            onClick={() => setActiveTab('payouts')}
                            className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all text-sm ${activeTab === 'payouts' ? 'bg-gray-200/50 text-[#0F172A] font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <Wallet className="size-4" />
                            Payouts
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200 border-dashed mb-4">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors w-full"
                    >
                        <LogOut className="size-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">

                {/* Header */}
                <header className="h-16 border-b border-gray-200 flex items-center justify-end px-8 shrink-0 bg-white">
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <Avatar className="size-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-transparent">
                            <span className="text-white">A</span>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-700">Admin</span>
                        <ChevronDown className="size-4 text-gray-400" />
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-10 bg-white">

                    {/* TAB: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                            <h1 className="text-2xl font-bold text-[#0F172A] mb-8">Dashboard</h1>

                            {/* Top Stats Row */}
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                {/* Total Users */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Total Users</p>
                                        <p className="text-3xl font-bold text-[#0F172A]">1,245</p>
                                    </div>
                                    <div className="size-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <Users className="size-6" />
                                    </div>
                                </div>
                                {/* Total Lawyers */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Total Lawyers</p>
                                        <p className="text-3xl font-bold text-[#0F172A]">132</p>
                                    </div>
                                    <div className="size-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <Scale className="size-6" />
                                    </div>
                                </div>
                                {/* Revenue */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Revenue</p>
                                        <p className="text-3xl font-bold text-[#0F172A]">Rp 85 jt</p>
                                    </div>
                                    <div className="size-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <Wallet className="size-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Middle Stats Row */}
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                {/* Today's Transactions */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Today's Transactions</p>
                                        <p className="text-3xl font-bold text-[#0F172A]">23</p>
                                    </div>
                                    <div className="size-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <FileText className="size-6" />
                                    </div>
                                </div>
                                {/* Active Consultations */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Active Consultations</p>
                                        <p className="text-3xl font-bold text-[#0F172A]">8</p>
                                    </div>
                                    <div className="size-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <MessageSquare className="size-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Recent Consultations Table */}
                            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recent Consultations</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Client</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Lawyer</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Amount</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {MOCK_TRANSACTIONS.slice(0, 3).map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{t.client.split(' ')[0]}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.lawyer.split(' ')[0]}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 border-none">{t.amount.replace('0,000', 'k').replace('00,000', '00k')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(t.status)}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: TRANSACTIONS */}
                    {activeTab === 'transactions' && (
                        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-bold text-[#0F172A]">Transactions</h1>
                                <div className="flex items-center gap-4">
                                    <div className="relative border border-gray-200 rounded-lg px-4 py-2 bg-white flex items-center gap-2 cursor-pointer shadow-sm">
                                        <span className="text-sm font-medium text-gray-700">All Status</span>
                                        <ChevronDown className="size-4 text-gray-400" />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search transactions..."
                                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/80 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Transaction ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Client Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Lawyer Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Amount</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-center">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {MOCK_TRANSACTIONS.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{t.id}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.client}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.lawyer}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.amount}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full min-w-[90px] ${getStatusBadge(t.status)}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 transition-colors inline-block">
                                                        <Eye className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: VERIFICATION */}
                    {activeTab === 'verification' && (
                        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                            <h1 className="text-2xl font-bold text-[#0F172A] mb-8">Lawyer Verification Queue</h1>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                {isLoadingProfiles ? (
                                    <div className="p-8 text-center text-gray-500">Loading pending profiles...</div>
                                ) : pendingLawyers.length === 0 ? (
                                    <div className="p-8 text-center flex flex-col items-center">
                                        <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                                            <CheckCircle2 className="size-8 text-green-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
                                        <p className="text-gray-500 text-sm">There are no lawyer profiles waiting for verification.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Applicant</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Specialty & Exp.</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500">Documents</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {pendingLawyers.map(lawyer => (
                                                <tr key={lawyer.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="size-10 shadow-sm border border-gray-100">
                                                                <AvatarImage src={lawyer.user.profile_picture_url || ""} className="object-cover" />
                                                                <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">{lawyer.user.full_name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">{lawyer.user.full_name}</p>
                                                                <p className="text-xs text-gray-500">{lawyer.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-bold text-gray-800">{lawyer.specialty.name}</p>
                                                        <p className="text-xs text-gray-500">{lawyer.experience_years} Years Experience</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-2">
                                                            {lawyer.ktp_url ? (
                                                                <a href={lawyer.ktp_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline">
                                                                    <FileText className="size-3" /> View KTP
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-red-500 flex items-center gap-1"><XCircle className="size-3" /> No KTP</span>
                                                            )}

                                                            {lawyer.certificate_url ? (
                                                                <a href={lawyer.certificate_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline">
                                                                    <FileText className="size-3" /> View Certificate
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-red-500 flex items-center gap-1"><XCircle className="size-3" /> No Cert.</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                onClick={() => handleVerify(lawyer.id, 'reject')}
                                                                variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleVerify(lawyer.id, 'approve')}
                                                                className="bg-green-600 hover:bg-green-700 text-white h-9 shadow-sm"
                                                            >
                                                                Approve
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['users', 'disputes', 'payouts'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-500">
                            <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-400">
                                {activeTab === 'users' && <Users className="size-10" />}
                                {activeTab === 'disputes' && <AlertTriangle className="size-10" />}
                                {activeTab === 'payouts' && <Wallet className="size-10" />}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 capitalize mb-2">{activeTab.replace('-', ' ')}</h2>
                            <p className="text-gray-500 max-w-sm">
                                This module is currently under construction and will be available in the next release matching the Figma design system.
                            </p>
                        </div>
                    )}

                </div>
            </main>

        </div>
    );
}
