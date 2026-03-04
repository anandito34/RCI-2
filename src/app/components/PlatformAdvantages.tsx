import { ShieldCheck, CreditCard, Star, Zap } from 'lucide-react';

export function PlatformAdvantages() {
  const advantages = [
    {
      icon: ShieldCheck,
      title: 'Pengacara Terverifikasi',
      description: 'Semua pengacara telah tersertifikasi dan tervalidasi secara profesional',
    },
    {
      icon: CreditCard,
      title: 'Sistem Pembayaran Aman',
      description: 'Proses pembayaran terenkripsi untuk keamanan Anda',
    },
    {
      icon: Star,
      title: 'Rating Transparan',
      description: 'Ulasan asli dari klien terverifikasi untuk membantu pilihan Anda',
    },
    {
      icon: Zap,
      title: 'Proses Mudah & Cepat',
      description: 'Dapatkan konsultasi hukum dalam hitungan menit, bukan hari',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            Mengapa Pilih Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan platform aman dan efisien untuk konsultasi hukum online
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="inline-flex items-center justify-center">
                <div className="bg-blue-100 p-5 rounded-2xl">
                  <advantage.icon className="size-8 text-blue-900" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{advantage.title}</h3>
              <p className="text-gray-600 text-sm">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}