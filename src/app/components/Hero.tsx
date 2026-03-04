import { AuthModal } from './AuthModal';
import protectionImg from '../../assets/protection.png';

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

interface HeroProps {
  user: UserProfile | null;
  onAuthSuccess: (email: string) => void;
}

export function Hero({ user, onAuthSuccess }: HeroProps) {
  const handleAction = () => {
    if (user) {
      onAuthSuccess(user.email);
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-[#F8F9FA]">
      {/* Signature Background */}
      <div className="absolute inset-0 opacity-40 -z-10" style={{ backgroundImage: 'var(--mesh-gradient)' }}></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1A1C1E]/[0.02] -skew-x-12 translate-x-1/4 -z-20"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#1A1C1E]/5 shadow-sm">
                <div className="size-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
                <span className="text-[10px] font-black tracking-[0.2em] text-[#1A1C1E] uppercase">Premium Legal Network</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#1A1C1E] leading-[0.95] tracking-tight">
                Keadilan <br />
                Tanpa <span className="text-[#D4AF37]">Batas.</span>
              </h1>

              <p className="text-base md:text-lg text-[#1A1C1E]/60 max-w-xl font-medium leading-relaxed">
                Menghubungkan Anda dengan pakar hukum terkemuka di Indonesia melalui platform enkripsi tingkat tinggi. Konsultasi aman, privat, dan eksklusif.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <button
                  onClick={handleAction}
                  className="bg-[#1A1C1E] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#1A1C1E] transition-all shadow-2xl shadow-black/10 active:scale-95 cursor-pointer"
                >
                  Mulai Sekarang
                </button>
              ) : (
                <AuthModal defaultTab="register" defaultRole="client" onSuccess={onAuthSuccess}>
                  <button className="bg-[#1A1C1E] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#1A1C1E] transition-all shadow-2xl shadow-black/10 active:scale-95 cursor-pointer">
                    Mulai Sekarang
                  </button>
                </AuthModal>
              )}

              {!user && (
                <AuthModal defaultTab="register" defaultRole="lawyer" onSuccess={onAuthSuccess}>
                  <button className="bg-white text-[#1A1C1E] border border-[#1A1C1E]/10 px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-50 transition-all cursor-pointer">
                    Gabung Mitra
                  </button>
                </AuthModal>
              )}
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="size-14 rounded-full border-[6px] border-[#F8F9FA] overflow-hidden bg-white shadow-xl">
                    <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="Expert" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="h-10 w-px bg-[#1A1C1E]/10"></div>
              <div>
                <p className="text-xl font-black text-[#1A1C1E]">2,500+</p>
                <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Pakar Hukum Terverifikasi</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-6 relative lg:pl-10">
            <div className="relative group">
              {/* Luxury Frame */}
              <div className="absolute -inset-4 border border-[#D4AF37]/20 rounded-[4rem] -rotate-3 group-hover:rotate-0 transition-transform duration-1000"></div>
              <div className="absolute -inset-4 border border-[#1A1C1E]/5 rounded-[4rem] rotate-3 group-hover:rotate-0 transition-transform duration-1000 delay-100"></div>

              <div className="relative z-10 w-full aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-[#1A1C1E] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
                <img
                  src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070&auto=format&fit=crop"
                  alt="Legal Excellence"
                  className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1E] via-transparent to-transparent"></div>

                {/* The Protection Illustration Widget - Repositioned and Styled */}
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
                    <div className="flex flex-col gap-6">
                      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                        <img
                          src={protectionImg}
                          alt="Security Illustration"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-2">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="size-2 rounded-full bg-emerald-400"></div>
                          <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Enkripsi Militer</h4>
                        </div>
                        <p className="text-white/40 text-[10px] font-medium leading-relaxed">Keamanan data Anda adalah prioritas utama kami dengan sistem proteksi berlapis.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute -bottom-10 -right-10 size-64 bg-[#D4AF37]/5 rounded-full blur-[100px] -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}