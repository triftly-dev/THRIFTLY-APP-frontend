import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import { ShieldCheck, ShoppingBag, Users, Zap } from 'lucide-react'

const About = () => {
  const stats = [
    { label: 'Pengguna Aktif', value: '10K+', icon: Users },
    { label: 'Produk Terjual', value: '50K+', icon: ShoppingBag },
    { label: 'Transaksi Aman', value: '100%', icon: ShieldCheck },
    { label: 'Proses Cepat', value: '< 24 Jam', icon: Zap },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary-600 py-20 text-white">
          <Container>
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Misi Kami: Memberikan Nyawa Baru untuk Barang Bekas</h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                Thriftly adalah marketplace barang bekas (thrift) terpercaya di Jawa Tengah & DIY yang menghubungkan pembeli dan penjual dalam ekosistem yang aman, mudah, dan berkelanjutan.
              </p>
            </div>
          </Container>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Kenapa Thriftly Hadir?</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Berawal dari keresahan akan limbah fashion dan barang rumah tangga yang terus menumpuk, Thriftly lahir sebagai solusi untuk memperpanjang usia pakai sebuah produk.
                  </p>
                  <p>
                    Kami percaya bahwa barang bekas berkualitas layak mendapatkan kesempatan kedua. Dengan Thriftly, setiap orang bisa berkontribusi pada gaya hidup yang lebih ramah lingkungan sambil tetap hemat.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                    <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <stat.icon className="text-primary-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Value Section */}
        <section className="py-20 bg-gray-50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nilai-Nilai Utama Kami</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Kami membangun platform ini dengan fondasi kepercayaan dan kenyamanan pengguna.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Keamanan Terjamin</h3>
                <p className="text-gray-600 italic">"Payment Rekening Bersama"</p>
                <p className="mt-2 text-gray-600">Dana hanya akan diteruskan ke penjual setelah pembeli menerima barang dengan sesuai. Didukung oleh Midtrans.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Komunitas Terpercaya</h3>
                <p className="text-gray-600">Kami memverifikasi setiap penjual melalui sistem KTP dan review pelanggan untuk menjaga kualitas marketplace.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Dukungan Lokal</h3>
                <p className="text-gray-600">Fokus utama kami adalah memberdayakan UMKM dan penjual individu di wilayah Jawa Tengah & DIY.</p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About
