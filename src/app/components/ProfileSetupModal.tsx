import { useState } from 'react';
import { API_BASE } from '../config/api';
import { X, Upload, ShieldCheck, FileText, Camera } from 'lucide-react';

interface ProfileSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
}

export function ProfileSetupModal({ isOpen, onClose, userEmail }: ProfileSetupModalProps) {
    if (!isOpen) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [profileUrl, setProfileUrl] = useState<string | null>(null);
    const [ktpUrl, setKtpUrl] = useState<string | null>(null);
    const [certUrl, setCertUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        specialty_id: '',
        experience_years: '',
        hourly_rate: ''
    });

    const uploadFileToServer = async (file: File) => {
        const payload = new FormData();
        payload.append('file', file);
        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: payload
            });
            const data = await res.json();
            return data.url;
        } catch (e) {
            console.error("Upload error", e);
            return null;
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setProfilePreview(tempUrl);
            const serverUrl = await uploadFileToServer(file);
            if (serverUrl) setProfileUrl(serverUrl);
        }
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'cert') => {
        const file = e.target.files?.[0];
        if (file) {
            const serverUrl = await uploadFileToServer(file);
            if (serverUrl) {
                if (type === 'ktp') setKtpUrl(serverUrl);
                else setCertUrl(serverUrl);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('rci_token');
            const res = await fetch(`${API_BASE}/api/lawyers/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bio: formData.bio,
                    experience_years: parseInt(formData.experience_years),
                    hourly_rate: parseFloat(formData.hourly_rate),
                    specialty_id: parseInt(formData.specialty_id),
                    ktp_url: ktpUrl,
                    certificate_url: certUrl,
                    profile_picture_url: profileUrl
                })
            });

            if (res.ok) {
                onClose();
            } else {
                console.error("Failed to submit profile", await res.text());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A1C1E]/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="px-8 py-6 border-b border-[#1A1C1E]/5 flex justify-between items-center bg-stone-50/50">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-[#1A1C1E] flex items-center justify-center text-[#D4AF37]">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#1A1C1E] tracking-tight">Verifikasi & Profil Profesional</h2>
                            <p className="text-sm font-medium text-[#1A1C1E]/60">Lengkapi data untuk akun <span className="font-bold">{userEmail}</span> agar klien dapat menemukan Anda.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full hover:bg-stone-200/50 flex items-center justify-center text-[#1A1C1E]/40 hover:text-[#1A1C1E] transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <form id="profile-form" onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-12">

                        {/* Kolom Kiri: Informasi Personal & Profesional */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-[#1A1C1E] mb-6 flex items-center gap-2">
                                    <span className="text-[#D4AF37]">01.</span> Informasi Pribadi
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-upload')?.click()}>
                                            <div className="size-24 rounded-full bg-stone-100 border-2 border-dashed border-[#1A1C1E]/20 flex items-center justify-center overflow-hidden group-hover:border-[#D4AF37] transition-colors relative z-0">
                                                {profilePreview ? (
                                                    <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="size-8 text-[#1A1C1E]/20 group-hover:text-[#D4AF37] transition-colors" />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-[#1A1C1E]/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <span className="text-[10px] font-black uppercase text-white tracking-widest text-center px-2">
                                                    {profilePreview ? 'Ganti Foto' : 'Upload Foto'}
                                                </span>
                                            </div>
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1A1C1E]">Foto Profil Profesional</h4>
                                            <p className="text-xs text-[#1A1C1E]/60 mt-1 max-w-[200px]">Gunakan foto formal yang jelas, pencahayaan baik, dengan pakaian profesional.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 mb-2">Nama Lengkap & Gelar</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Cth: Budi Santoso, S.H., M.H."
                                            className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 mb-2">Bio Singkat</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tuliskan latar belakang dan dedikasi Anda di bidang hukum..."
                                            className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all min-h-[100px] resize-y"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-[#1A1C1E] mb-6 flex items-center gap-2 pt-4 border-t border-[#1A1C1E]/5">
                                    <span className="text-[#D4AF37]">02.</span> Spesialisasi & Tarif
                                </h3>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 mb-2">Bidang Keahlian Utama (ID)</label>
                                        <select
                                            value={formData.specialty_id}
                                            onChange={(e) => setFormData({ ...formData, specialty_id: e.target.value })}
                                            className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all text-[#1A1C1E]" required>
                                            <option value="">Pilih Spesialisasi...</option>
                                            <option value="1">Hukum Pidana</option>
                                            <option value="2">Hukum Perdata</option>
                                            <option value="3">Hukum Keluarga</option>
                                            <option value="4">Hukum Perusahaan</option>
                                            <option value="5">Hukum Properti & Agraria</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 mb-2">Pengalaman (Tahun)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.experience_years}
                                                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                                placeholder="Cth: 5"
                                                className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 mb-2">Tarif Konsultasi (/Jam)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1C1E]/40 font-bold">Rp</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="50000"
                                                    value={formData.hourly_rate}
                                                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                                    placeholder="500000"
                                                    className="w-full bg-stone-50 border border-[#1A1C1E]/5 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Dokumen Legal (KYC) */}
                        <div className="bg-[#1A1C1E] rounded-[2rem] p-8 text-white">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <span className="text-[#D4AF37]">03.</span> Dokumen Legalitas (KYC)
                            </h3>
                            <p className="text-sm font-medium text-white/50 mb-8">
                                Dokumen ini bersifat rahasia dan hanya digunakan untuk verifikasi internal oleh tim admin kami demi integritas platform.
                            </p>

                            <div className="space-y-6">
                                {/* Upload Item */}
                                {[
                                    { id: 'ktp', title: "KTP (Kartu Tanda Penduduk)", desc: "Bukti identitas resmi warga negara.", state: ktpUrl },
                                    { id: 'cert', title: "KTPA (Kartu Tanda Pengenal Advokat)", desc: "Kartu identitas advokat yang masih berlaku.", state: certUrl },
                                ].map((item, index) => (
                                    <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#D4AF37]/50 transition-colors group relative cursor-pointer overflow-hidden">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleDocumentUpload(e, item.id as 'ktp' | 'cert')}
                                            required={!item.state}
                                        />
                                        <div className="flex items-center gap-4 relative z-0">
                                            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37] transition-colors">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                                <p className="text-xs text-white/40 mt-0.5">{item.state ? 'Dokumen terunggah' : item.desc}</p>
                                            </div>
                                            <div className={`size-8 rounded-full flex items-center justify-center transition-colors ${item.state ? 'bg-[#D4AF37] text-[#1A1C1E]' : 'bg-white/5 text-white/30 group-hover:text-white'}`}>
                                                {item.state ? <ShieldCheck className="size-4" /> : <Upload className="size-4" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-500/80 font-medium">Sistem kami menggunakan enkripsi end-to-end. File Anda aman dan tidak akan disebarkan.</p>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer / Actions */}
                <div className="px-8 py-5 border-t border-[#1A1C1E]/5 bg-stone-50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-bold text-[#1A1C1E]/40 hover:text-[#1A1C1E] uppercase tracking-widest transition-colors"
                    >
                        Nanti Saja
                    </button>
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={isSubmitting}
                        className="bg-[#1A1C1E] hover:bg-[#D4AF37] text-white hover:text-[#1A1C1E] px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-black/10 flex items-center gap-2 hover:shadow-[#D4AF37]/20 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>Memproses data...</>
                        ) : (
                            <>
                                <Upload className="size-4" />
                                Ajukan Verifikasi
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
