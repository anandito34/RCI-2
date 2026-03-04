import { Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      quote: "Roys Counsel Indonesia memudahkan saya menemukan pengacara yang qualified untuk bisnis saya. Konsultasinya profesional dan langsung menyelesaikan masalah.",
      name: 'Emily Sanders',
      role: 'Pemilik Usaha Kecil',
    },
    {
      quote: "Awalnya ragu dengan konsultasi online, tapi platformnya aman dan pengacaranya sangat berpengalaman. Sangat recommend!",
      name: 'James Wilson',
      role: 'Konsultan Freelance',
    },
    {
      quote: "Cepat, transparan, dan terjangkau. Mendapat saran hukum expert tanpa ribet seperti firma hukum tradisional. Lima bintang!",
      name: 'Maria Garcia',
      role: 'Investor Properti',
    },
  ];

  return (
    <section className="py-24 lg:py-40 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#1A1C1E]/5 shadow-sm mb-6">
            <div className="size-2 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[9px] font-black tracking-[0.3em] text-[#1A1C1E] uppercase">The Voices</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1C1E] mb-6 tracking-tight">
            Cerita Kepercayaan.
          </h2>
          <p className="text-[#1A1C1E]/40 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Pengalaman nyata dari mereka yang telah mempercayakan keamanan hukumnya kepada kami.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-[3rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.03)] border border-[#1A1C1E]/5 relative group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl group-hover:bg-[#D4AF37]/10 transition-colors"></div>

              <div className="relative z-10">
                <div className="mb-8">
                  <div className="size-10 bg-[#1A1C1E] rounded-2xl flex items-center justify-center mb-8">
                    <Quote className="size-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-xl lg:text-2xl font-black text-[#1A1C1E] leading-relaxed italic">
                    {testimonial.quote}
                  </p>
                </div>

                <div className="pt-8 border-t border-[#1A1C1E]/5">
                  <p className="text-sm font-black text-[#1A1C1E] uppercase tracking-widest">{testimonial.name}</p>
                  <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mt-1">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}