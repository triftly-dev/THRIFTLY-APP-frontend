import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      toast.error('Link reset password tidak valid')
      navigate('/login')
    }
  }, [token, email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 8) {
      return toast.error('Password minimal 8 karakter')
    }

    if (password !== confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok')
    }

    setLoading(true)
    try {
      const response = await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: confirmPassword
      })
      toast.success(response.data.message)
      setSuccess(true)
      
      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mereset password. Silakan minta link baru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${success ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {success ? <CheckCircle size={32} /> : <Lock size={32} />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {success ? 'Password Diperbarui!' : 'Buat Password Baru'}
            </h1>
            <p className="text-gray-500 mt-2">
              {success 
                ? 'Password Anda telah berhasil diubah. Mengalihkan Anda ke halaman login...' 
                : 'Silakan masukkan password baru Anda di bawah ini.'}
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Minimal 8 karakter"
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ulangi password baru"
                    required
                  />
                  <CheckCircle className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="shadow-lg shadow-primary-200"
              >
                Simpan Password Baru
              </Button>
            </form>
          ) : (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Klik <a href="/login" className="text-primary-600 font-medium hover:underline">di sini</a> jika Anda tidak dialihkan otomatis.
              </p>
            </div>
          )}
          
          {!success && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-blue-700">
                Pastikan password baru Anda kuat (gabungan huruf, angka, dan simbol) untuk keamanan yang lebih baik.
              </p>
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default ResetPassword
