import { Star, ArrowRight } from 'lucide-react';

export function FeaturedLawyers() {
  const lawyers = [
    {
      name: 'Sarah Mitchell',
      specialization: 'Hukum Perusahaan',
      rating: 5,
      price: 'Rp 1.200.000',
      image: 'https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBsYXd5ZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyMTM3NTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Michael Chen',
      specialization: 'Hukum Keluarga',
      rating: 5,
      price: 'Rp 1.000.000',
      image: 'https://images.unsplash.com/photo-1695266391814-a276948f1775?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwYXR0b3JuZXklMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIxNTc1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Jennifer Rodriguez',
      specialization: 'Hukum Properti',
      rating: 5,
      price: 'Rp 1.100.000',
      image: 'https://images.unsplash.com/photo-1736939681295-bb2e6759dddc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBsYXd5ZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIxNTc1MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'David Thompson',
      specialization: 'Hukum Pidana',
      rating: 5,
      price: 'Rp 1.500.000',
      image: 'https://images.unsplash.com/photo-1695266391814-a276948f1775?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwYXR0b3JuZXklMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIxNTc1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  return (
    <section id="lawyers" className="py-24 lg:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#F8F9FA] border border-[#1A1C1E]/5 shadow-sm mb-6">
            <div className="size-2 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[9px] font-black tracking-[0.3em] text-[#1A1C1E] uppercase">The Registry</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1C1E] mb-6 tracking-tight">
            Penasihat <span className="text-[#D4AF37]">Utama.</span>
          </h2>
          <p className="text-[#1A1C1E]/40 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Hanya yang terbaik yang dapat bergabung dalam jaringan global kami yang prestisius.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {lawyers.map((lawyer, index) => (
            <div
              key={index}
              className="group"
            >
              {/* Profile Image with Luxury Frame */}
              <div className="relative mb-8 rounded-[2.5rem] overflow-hidden bg-[#1A1C1E] aspect-[4/5] shadow-2xl">
                <img
                  src={lawyer.image}
                  alt={lawyer.name}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1E] via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 bg-[#D4AF37] size-3 rounded-full border-2 border-white shadow-lg"></div>
              </div>

              {/* Info */}
              <div className="space-y-4 px-2">
                <div>
                  <h3 className="text-xl font-black text-[#1A1C1E] tracking-tight">{lawyer.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mt-1">{lawyer.specialization}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 py-4 border-y border-[#1A1C1E]/5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`size-3 ${i < lawyer.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-stone-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-[#1A1C1E]/30 uppercase tracking-widest ml-2">{lawyer.rating}.0 Verified</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-[#1A1C1E]/30 uppercase tracking-widest leading-none mb-1">Mulai Dari</span>
                    <span className="text-sm font-black text-[#1A1C1E]">{lawyer.price} / jam</span>
                  </div>
                  <button className="bg-[#1A1C1E] hover:bg-[#D4AF37] text-white hover:text-[#1A1C1E] size-12 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-black/10 active:scale-95">
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-24">
          <button className="bg-white border-2 border-[#1A1C1E] text-[#1A1C1E] px-14 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-[#1A1C1E] hover:text-white transition-all cursor-pointer shadow-xl hover:shadow-black/10">
            Lihat Seluruh Direktori
          </button>
        </div>
      </div>
    </section>
  );
}