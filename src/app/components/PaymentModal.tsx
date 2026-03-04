import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { X, CreditCard, Smartphone, QrCode, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
    lawyer: {
        id: number;
        name: string;
        specialization: string;
        image: string;
        rating: number;
        experience_years: number;
        hourly_rate: number;
    };
}

type PaymentMethod = 'bank_transfer' | 'ewallet' | 'qris';
type PaymentStage = 'select' | 'processing' | 'success';

const paymentMethods = [
    {
        id: 'bank_transfer' as PaymentMethod,
        label: 'Bank Transfer',
        subtitle: 'BCA, BNI, Mandiri, BRI',
        icon: CreditCard,
        color: 'from-blue-500 to-blue-600',
        bgHover: 'hover:border-blue-400/50 hover:bg-blue-500/5',
    },
    {
        id: 'ewallet' as PaymentMethod,
        label: 'E-Wallet',
        subtitle: 'GoPay, OVO, DANA, ShopeePay',
        icon: Smartphone,
        color: 'from-emerald-500 to-emerald-600',
        bgHover: 'hover:border-emerald-400/50 hover:bg-emerald-500/5',
    },
    {
        id: 'qris' as PaymentMethod,
        label: 'QRIS',
        subtitle: 'Scan & Pay — Semua Bank',
        icon: QrCode,
        color: 'from-violet-500 to-violet-600',
        bgHover: 'hover:border-violet-400/50 hover:bg-violet-500/5',
    },
];

export function PaymentModal({ isOpen, onClose, onPaymentSuccess, lawyer }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [stage, setStage] = useState<PaymentStage>('select');
    const [transactionId, setTransactionId] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedMethod(null);
            setStage('select');
            setTransactionId('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePayment = async () => {
        if (!selectedMethod) return;
        setStage('processing');
        setError('');

        try {
            const token = localStorage.getItem('rci_token');
            const res = await fetch(`${API_BASE}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    lawyer_id: lawyer.id,
                    payment_method: selectedMethod,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Pembayaran gagal');
            }

            setTransactionId(data.transaction_id);

            // Simulate processing delay for realistic UX
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStage('success');

            // Auto-proceed to chat after 1.5s
            setTimeout(() => {
                onPaymentSuccess();
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
            setStage('select');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1A1C1E] w-full max-w-lg rounded-[2.5rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden animate-in slide-in-from-bottom-6 duration-500">

                {/* Processing Stage */}
                {stage === 'processing' && (
                    <div className="px-10 py-20 flex flex-col items-center justify-center">
                        <div className="relative mb-10">
                            <div className="size-24 rounded-full border-4 border-white/5 border-t-[#D4AF37] animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CreditCard className="size-8 text-[#D4AF37] animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Memproses Pembayaran</h3>
                        <p className="text-sm font-medium text-white/40 mb-8">Mengonfirmasi transaksi Anda...</p>
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5">
                            <Loader2 className="size-4 text-[#D4AF37] animate-spin" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Secure Processing</span>
                        </div>
                    </div>
                )}

                {/* Success Stage */}
                {stage === 'success' && (
                    <div className="px-10 py-20 flex flex-col items-center justify-center">
                        <div className="relative mb-10">
                            <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                                <CheckCircle2 className="size-14 text-emerald-400" />
                            </div>
                            <div className="absolute -inset-4 rounded-full bg-emerald-500/5 animate-ping"></div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Pembayaran Berhasil!</h3>
                        <p className="text-sm font-medium text-white/40 mb-6">Sesi akan dimulai secara otomatis</p>
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-center mb-8">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Transaction ID</p>
                            <p className="text-sm font-black text-[#D4AF37] font-mono">{transactionId}</p>
                        </div>
                        <div className="flex items-center gap-3 text-emerald-400">
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-xs font-black uppercase tracking-widest">Membuka sesi chat...</span>
                        </div>
                    </div>
                )}

                {/* Selection Stage */}
                {stage === 'select' && (
                    <>
                        {/* Header */}
                        <div className="px-10 pt-10 pb-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
                            >
                                <X className="size-5" />
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="size-4 text-[#D4AF37]" />
                                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Pembayaran Aman</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Konfirmasi Sesi</h2>
                        </div>

                        {/* Lawyer Info */}
                        <div className="mx-10 mb-8 p-5 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-5">
                                <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/10">
                                    {lawyer.image ? (
                                        <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-black text-white/60">{lawyer.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-white text-lg leading-tight">{lawyer.name}</h3>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mt-0.5">{lawyer.specialization}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] font-bold text-white/30">⭐ {lawyer.rating > 0 ? lawyer.rating.toFixed(1) : 'N/A'}</span>
                                        <span className="text-[10px] font-bold text-white/30">{lawyer.experience_years} tahun</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center justify-between pt-5 border-t border-white/5">
                                <span className="text-xs font-bold text-white/40">Tarif Konsultasi</span>
                                <span className="text-2xl font-black text-white">{formatCurrency(lawyer.hourly_rate)}<span className="text-xs font-bold text-white/30 ml-1">/jam</span></span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="px-10 mb-6">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-1">Pilih Metode Pembayaran</p>
                            <div className="space-y-3">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = selectedMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={`w-full flex items-center gap-5 p-4 rounded-2xl border transition-all active:scale-[0.98] ${isSelected
                                                ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10'
                                                : `border-white/5 bg-white/[0.02] ${method.bgHover}`
                                                }`}
                                        >
                                            <div className={`size-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-lg ${isSelected ? 'shadow-[#D4AF37]/20' : ''}`}>
                                                <Icon className="size-5 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className={`font-black text-sm ${isSelected ? 'text-[#D4AF37]' : 'text-white'}`}>{method.label}</h4>
                                                <p className="text-[10px] font-medium text-white/30 mt-0.5">{method.subtitle}</p>
                                            </div>
                                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                ? 'border-[#D4AF37] bg-[#D4AF37]'
                                                : 'border-white/10'
                                                }`}>
                                                {isSelected && <div className="size-2 rounded-full bg-[#1A1C1E]"></div>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mx-10 mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                <p className="text-xs font-bold text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="px-10 pb-10">
                            <button
                                onClick={handlePayment}
                                disabled={!selectedMethod}
                                className="w-full h-16 bg-[#D4AF37] hover:bg-white text-[#1A1C1E] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-[#D4AF37]/20 active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                Bayar {formatCurrency(lawyer.hourly_rate)}
                                <ArrowRight className="size-4" />
                            </button>
                            <p className="text-center text-[8px] font-bold text-white/15 uppercase tracking-[0.3em] mt-4">
                                Dilindungi Enkripsi End-to-End
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
