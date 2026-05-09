import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Smartphone, ArrowLeft, Loader2 } from 'lucide-react'

const VerifyOTP = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const phone = searchParams.get('phone')
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(60)

  useEffect(() => {
    if (!phone) navigate('/profile')
    
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [phone, navigate])

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])

    // Move to next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Masukkan 6 digit kode OTP')

    setLoading(true)
    try {
      await api.post('/otp/verify', { phone, code })
      toast.success('Nomor HP berhasil diverifikasi!')
      await refreshUser()
      navigate('/profile')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kode OTP salah')
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setLoading(true)
    try {
      await api.post('/otp/send', { phone })
      toast.success('Kode OTP baru telah dikirim')
      setTimer(60)
    } catch (error) {
      toast.error('Gagal mengirim ulang OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-100 p-3 rounded-full">
            <Smartphone className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verifikasi Nomor HP</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masukkan 6 digit kode yang kami kirim ke <span className="font-bold text-gray-900">{phone}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:bg-white focus:ring-0 outline-none transition-all"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verifikasi Sekarang'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Tidak menerima kode?{' '}
              {timer > 0 ? (
                <span className="font-bold text-primary-600">Tunggu {timer}s</span>
              ) : (
                <button
                  onClick={resendOTP}
                  disabled={loading}
                  className="font-bold text-primary-600 hover:text-primary-500 underline"
                >
                  Kirim Ulang
                </button>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="mt-8 w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Pengaturan
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
