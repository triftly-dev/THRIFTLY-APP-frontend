import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow py-16">
        <Container maxWidth="max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kebijakan Privasi</h1>
          
          <div className="prose prose-primary max-w-none text-gray-600 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">1. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftar, seperti:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Nama lengkap, alamat email, dan nomor telepon.</li>
                <li>Alamat pengiriman.</li>
                <li>Foto KTP (hanya untuk verifikasi penjual).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">2. Penggunaan Informasi</h2>
              <p>Kami menggunakan informasi tersebut untuk:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Memproses transaksi Anda secara aman.</li>
                <li>Melakukan verifikasi identitas untuk mencegah penipuan.</li>
                <li>Memberikan dukungan pelanggan.</li>
                <li>Mengirimkan notifikasi terkait status pesanan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">3. Perlindungan Data</h2>
              <p>
                Data Anda disimpan di server yang aman dengan enkripsi standar industri. Kami tidak akan pernah menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga tanpa izin Anda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">4. Cookie</h2>
              <p>
                Website kami menggunakan cookie untuk meningkatkan pengalaman pengguna, seperti mengingat status login Anda dan preferensi pencarian.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">5. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, Anda dapat menghubungi kami melalui email di support@thriftly.my.id.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm">
            Terakhir diperbarui: 12 Mei 2026
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default Privacy
