import { UserSearch, MessageSquare, CheckCircle2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: UserSearch,
      title: 'Pilih Pengacara',
      description: 'Temukan pengacara berdasarkan spesialisasi dan rating',
    },
    {
      icon: MessageSquare,
      title: 'Mulai Konsultasi Online',
      description: 'Hubungi langsung via chat, telepon, atau video call',
    },
    {
      icon: CheckCircle2,
      title: 'Dapatkan Solusi Hukum',
      description: 'Terima saran profesional dan dokumentasi legal',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-40 bg-[#F8F9FA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#1A1C1E]/5 shadow-sm mb-6">
            <div className="size-2 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[9px] font-black tracking-[0.3em] text-[#1A1C1E] uppercase">The Experience</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1C1E] mb-6 tracking-tight">
            Metode Kerja Kami.
          </h2>
          <p className="text-[#1A1C1E]/40 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Menghadirkan efisiensi dalam setiap langkah konsultasi hukum Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector line - updated to Gold */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[70%] w-[60%] h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
              )}

              <div className="text-center space-y-8">
                {/* Icon container */}
                <div className="relative inline-block">
                  <div className="bg-[#1A1C1E] p-8 rounded-[2.5rem] inline-block shadow-2xl shadow-black/20 group-hover:rotate-6 transition-transform duration-700">
                    <step.icon className="size-12 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-white text-[#1A1C1E] size-10 rounded-full flex items-center justify-center text-xs font-black shadow-xl border border-[#D4AF37]/20">
                    0{index + 1}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-[#1A1C1E] tracking-tight">{step.title}</h3>
                  <p className="text-[#1A1C1E]/50 text-base font-medium leading-relaxed px-6">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Text background */}
      <div className="absolute bottom-0 left-0 right-0 text-center pointer-events-none opacity-[0.02] -mb-20">
        <span className="text-[20rem] font-black text-[#1A1C1E] tracking-tighter whitespace-nowrap">SIGNATURE</span>
      </div>
    </section>
  );
}