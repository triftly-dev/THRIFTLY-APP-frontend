import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'

const About = () => {
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
                Thriftly adalah marketplace barang bekas (thrift) terpercaya di Indonesia yang menghubungkan pembeli dan penjual dalam ekosistem yang aman, mudah, dan berkelanjutan.
              </p>
            </div>
          </Container>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Kenapa Thriftly Hadir?</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Berawal dari keresahan akan limbah fashion dan barang rumah tangga yang terus menumpuk, Thriftly lahir sebagai solusi untuk memperpanjang usia pakai sebuah produk.
                </p>
                <p>
                  Kami percaya bahwa barang bekas berkualitas layak mendapatkan kesempatan kedua. Dengan Thriftly, setiap orang bisa berkontribusi pada gaya hidup yang lebih ramah lingkungan sambil tetap hemat.
                </p>
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
