import logo from '../../assets/4b98353738dd53cea42acad8a432f86771c58775.png';
import { AuthModal } from './AuthModal';

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

interface NavbarProps {
  user: UserProfile | null;
  loading: boolean;
  onAuthSuccess: (email: string) => void;
  onLogout: () => void;
  onHome: () => void;
}

export function Navbar({ user, loading, onAuthSuccess, onLogout, onHome }: NavbarProps) {
  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-6xl z-50">
      <div className="bg-stone-50/40 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-indigo-950/5 rounded-full px-8 py-2">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center gap-4 group cursor-pointer" onClick={onHome}>
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-[#1A1C1E] p-2 rounded-2xl group-hover:rotate-6 transition-transform shadow-lg shadow-black/10 relative z-10 border border-white/5">
                <img src={logo} alt="RCI Logo" className="h-7 w-auto brightness-110 contrast-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-[#1A1C1E] leading-none">ROYS COUNSEL</span>
              <span className="text-[9px] font-black tracking-[0.3em] text-[#D4AF37] uppercase leading-none mt-1.5">INDONESIA</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-12">
            <div className="flex items-center gap-10">
              <a href="#home" className="text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 hover:text-[#1A1C1E] transition-colors">Beranda</a>
              <a href="#how-it-works" className="text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 hover:text-[#1A1C1E] transition-colors">Layanan</a>
              <a href="#lawyers" className="text-xs font-black uppercase tracking-widest text-[#1A1C1E]/60 hover:text-[#1A1C1E] transition-colors">Pengacara</a>
            </div>

            <div className="flex items-center gap-6">
              {!loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1C1E]">{user.full_name}</span>
                      <span className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest">{user.role}</span>
                    </div>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => window.location.href = '/admin'}
                        className="text-[10px] font-black uppercase tracking-widest bg-[#1A1C1E] text-white px-4 py-2 rounded-full hover:bg-[#D4AF37] hover:text-[#1A1C1E] transition-all active:scale-95 shadow-md shadow-black/10"
                      >
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={onLogout}
                      className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <AuthModal defaultTab="login" onSuccess={onAuthSuccess}>
                      <button className="text-xs font-black uppercase tracking-widest text-[#1A1C1E] hover:text-[#D4AF37] transition-colors cursor-pointer px-4">
                        Masuk
                      </button>
                    </AuthModal>
                    <AuthModal defaultTab="register" defaultRole="client" onSuccess={onAuthSuccess}>
                      <button className="bg-[#1A1C1E] text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#1A1C1E] transition-all hover:shadow-xl hover:shadow-[#D4AF37]/10 cursor-pointer active:scale-95">
                        Konsultasi
                      </button>
                    </AuthModal>
                  </>
                )
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden size-10 flex items-center justify-center rounded-full hover:bg-stone-100/50 transition-colors">
            <div className="flex flex-col gap-1.5 items-end">
              <div className="w-6 h-0.5 bg-[#1A1C1E] rounded-full"></div>
              <div className="w-4 h-0.5 bg-[#D4AF37] rounded-full"></div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}