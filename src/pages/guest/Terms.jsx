import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow py-16">
        <Container maxWidth="max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Syarat & Ketentuan</h1>
          
          <div className="prose prose-primary max-w-none text-gray-600 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">1. Pendahuluan</h2>
              <p>
                Selamat datang di Thriftly. Dengan mengakses dan menggunakan platform kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan berikut. Harap baca dengan seksama sebelum melakukan transaksi apa pun.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">2. Akun Pengguna</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pengguna wajib memberikan informasi yang akurat saat pendaftaran.</li>
                <li>Pengguna bertanggung jawab atas kerahasiaan kata sandi mereka.</li>
                <li>Satu orang hanya diperbolehkan memiliki satu akun aktif.</li>
                <li>Kami berhak menangguhkan akun yang terindikasi melakukan penipuan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">3. Transaksi & Pembayaran</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Semua transaksi dilakukan melalui sistem pembayaran resmi Thriftly yang didukung oleh Midtrans.</li>
                <li>Thriftly bertindak sebagai penengah (rekening bersama) untuk menjamin keamanan dana pembeli.</li>
                <li>Dana akan diteruskan ke penjual hanya setelah pembeli mengonfirmasi penerimaan barang atau setelah periode otomatis berakhir (3x24 jam setelah barang sampai).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">4. Kebijakan Pengembalian (Refund)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Refund hanya dapat diajukan jika barang yang diterima tidak sesuai dengan deskripsi atau foto.</li>
                <li>Pembeli wajib melampirkan video unboxing sebagai bukti kuat saat mengajukan komplain.</li>
                <li>Biaya pengiriman untuk pengembalian barang ditanggung oleh pembeli, kecuali ada kesepakatan lain dengan penjual.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">5. Larangan Barang</h2>
              <p>
                Pengguna dilarang menjual barang-barang ilegal, barang curian, narkotika, senjata, atau barang apa pun yang melanggar hukum Negara Kesatuan Republik Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">6. Perubahan Ketentuan</h2>
              <p>
                Thriftly berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui email atau pengumuman di platform.
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

export default Terms
