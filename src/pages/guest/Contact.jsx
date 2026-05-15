import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import { Mail, MessageCircle, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/common/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await api.post('/contact', formData)
      
      if (response.data.success) {
        toast.success(response.data.message || 'Pesan berhasil dikirim!')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error('Gagal mengirim pesan. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Contact Error:', error)
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengirim pesan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow py-16">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Tim kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami jika ada kendala dalam transaksi.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Telepon / WA</h3>
                  <p className="text-gray-600">+62 822-4263-7028</p>
                  <p className="text-xs text-gray-400 mt-1">Senin - Minggu (08:00 - 21:00)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <p className="text-gray-600">triftlydev@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Kantor Pusat</h3>
                  <p className="text-gray-600">Jalan Ungaran, Mulyoharjo, Pemalang, Central Java, 52312</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500" 
                    placeholder="Masukkan nama Anda..." 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500" 
                    placeholder="email@contoh.com" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjek Pesan</label>
                  <input 
                    type="text" 
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500" 
                    placeholder="Ada yang bisa kami bantu?" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
                  <textarea 
                    rows="4" 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500" 
                    placeholder="Tuliskan pesan Anda di sini..."
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} disabled={isSubmitting}>
                    <Send size={18} className="mr-2" />
                    Kirim Pesan Sekarang
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default Contact
