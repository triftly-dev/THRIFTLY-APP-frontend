import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Silakan masukkan email Anda')

    setLoading(true)
    try {
      const response = await api.post('/forgot-password', { email })
      toast.success(response.data.message)
      setIsSent(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim email reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Login
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
              <Mail size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Lupa Password?</h1>
            <p className="text-gray-500 mt-2">
              {isSent 
                ? 'Kami telah mengirimkan instruksi reset password ke email Anda.' 
                : 'Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.'}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="shadow-lg shadow-primary-200"
              >
                <Send size={18} className="mr-2" /> Kirim Link Reset
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
                Cek kotak masuk email Anda (termasuk folder spam) untuk menemukan link reset password.
              </div>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsSent(false)}
              >
                Gunakan Email Lain
              </Button>
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default ForgotPassword
