import logo from '../../assets/4b98353738dd53cea42acad8a432f86771c58775.png';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A1C1E] text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/4 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-20 mb-24">
          {/* Logo and description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:border-[#D4AF37]/30 transition-colors">
                <img src={logo} alt="RCI Logo" className="h-10 w-auto brightness-110 contrast-110" />
              </div>
              <div>
                <span className="block text-sm font-black tracking-tight leading-none group-hover:text-white transition-colors">ROYS COUNSEL</span>
                <span className="block text-[9px] font-black tracking-[0.3em] text-[#D4AF37] uppercase mt-1.5 leading-none">INDONESIA</span>
              </div>
            </div>
            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">
              Membangun standar baru dalam akses keadilan. Platform hukum premium yang mengutamakan keamanan, privasi, dan eksklusivitas.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="bg-white/5 size-11 rounded-2xl flex items-center justify-center border border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-[#1A1C1E] transition-all">
                  <Icon className="size-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Intelligence', links: ['Tentang Kami', 'Pakar Kami', 'Publikasi', 'Media Hub'] },
            { title: 'Privacy', links: ['Privacy Policy', 'Cookie Access', 'Cyber Security', 'Legal Terms'] },
            { title: 'Access', links: ['Bantuan', 'Kemitraan', 'Dashboard', 'Portal Advokat'] },
            { title: 'Connect', links: ['Jakarta Hub', 'Bali Workspace', 'Digital Office', 'Global Support'] },
          ].map((col, i) => (
            <div key={i}>
              <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-8">{col.title}</h3>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm font-black text-white/40 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] order-2 md:order-1">
            © 2026 SIGNATURE LEGAL NETWORK. AUTHENTICATED ACCESS ONLY.
          </p>
          <div className="flex gap-8 order-1 md:order-2">
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Verified Secure</span>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}