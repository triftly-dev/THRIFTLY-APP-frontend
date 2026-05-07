import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, ChevronDown, Clock, CheckCircle2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { transactionService } from '../../services/transactionService'
import { formatCurrency, formatDateTime } from '../../utils/helpers'

const PaymentDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    let timer;
    if (transaction?.expiry_time) {
      timer = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(transaction.expiry_time).getTime()
        const distance = expiry - now

        if (distance < 0) {
          clearInterval(timer)
          setTimeLeft('EXPIRED')
          return
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [transaction])
  const [openAccordion, setOpenAccordion] = useState(0)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        // Asumsi ada method getTransactionByOrderId
        // Jika belum ada, kita bisa filter dari list transactions
        const data = await transactionService.getTransactionByOrderId(orderId)
        console.log('DEBUG TRANSACTION:', data)
        setTransaction(data)
      } catch (error) {
        console.error("Gagal mengambil data pembayaran:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTransaction()
  }, [orderId])

  const handleCheckStatus = async () => {
    setChecking(true)
    try {
      // Re-fetch data terbaru dari server
      const data = await transactionService.getTransactionByOrderId(orderId)
      setTransaction(data)

      if (data.status === 'settlement' || data.status === 'paid') {
        setIsSuccess(true)
        toast.success('Pembayaran Berhasil!')
      } else {
        toast.error('Pembayaran belum kami terima. Silakan selesaikan pembayaran sesuai instruksi.', {
          icon: '⏳'
        })
      }
    } catch (error) {
      toast.error('Gagal mengecek status pembayaran')
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Berhasil disalin ke clipboard!', {
      icon: '📋',
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
      }
    })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>
  if (!transaction) return <div className="min-h-screen flex items-center justify-center">Transaksi tidak ditemukan.</div>

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <Container maxWidth="max-w-xl" className="py-16 flex-grow">
          <div className="bg-white rounded-3xl p-10 shadow-soft border border-gray-100 text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Terima kasih! Pembayaran untuk pesanan <span className="font-semibold text-gray-800">{orderId}</span> telah kami terima. Penjual akan segera menyiapkan barang Anda.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Metode Pembayaran</span>
                <span className="font-bold text-gray-900 uppercase">Virtual Account {transaction.bank}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                <span className="text-gray-500">Total Pembayaran</span>
                <span className="font-bold text-emerald-600 text-lg">{formatCurrency(transaction.harga_final)}</span>
              </div>
            </div>
            <Button fullWidth size="lg" className="rounded-xl shadow-lg shadow-primary-200" onClick={() => navigate('/user/pesanan')}>
              Cek Pesanan Saya
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <Container maxWidth="max-w-2xl" className="py-8">
        <button 
          onClick={() => navigate('/user/pesanan')}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Pesanan</span>
        </button>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Header Bayar Sebelum */}
          <div className="p-6 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
            <div>
              <p className="text-orange-800 text-sm font-medium mb-1">Bayar sebelum</p>
              <h2 className="text-lg font-bold text-orange-900">
                {transaction.expiry_time ? formatDateTime(transaction.expiry_time) : 'Segera selesaikan pembayaran'}
              </h2>
            </div>
            <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm text-center min-w-[100px]">
              <div className="flex items-center gap-2 text-orange-600 font-mono font-bold text-xl">
                <Clock size={20} />
                <span>{timeLeft || '23:59:59'}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Nomor VA */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm">Nomor Virtual Account</p>
                <img 
                  src={`https://api.thriftly.my.id/storage/banks/${transaction.bank || 'bca'}.png`} 
                  alt={transaction.bank} 
                  className="h-6 object-contain grayscale"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-2xl font-bold text-gray-900 tracking-wider">
                  {transaction.va_number || transaction.payment_code || transaction.bill_key || 'Memuat...'}
                </span>
                <button 
                  onClick={() => copyToClipboard(transaction.va_number || transaction.payment_code || transaction.bill_key)}
                  className="p-2 hover:bg-white rounded-lg transition-all text-primary-600"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            {/* Total Tagihan */}
            <div className="mb-10">
              <p className="text-gray-500 text-sm mb-2">Total Tagihan</p>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(transaction.harga_final)}
                </span>
                <button 
                  onClick={() => copyToClipboard(transaction.harga_final)}
                  className="text-primary-600 font-semibold text-sm hover:underline"
                >
                  Lihat Detail
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <Button variant="outline" fullWidth className="rounded-xl py-3.5">
                Lihat Cara Bayar
              </Button>
              <Button 
                fullWidth 
                className="rounded-xl py-3.5" 
                onClick={handleCheckStatus}
                isLoading={checking}
              >
                Cek Status Bayar
              </Button>
            </div>

            {/* Cara Pembayaran Accordion */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Cara pembayaran</h3>
              <div className="space-y-3">
                {[
                  { title: 'ATM ' + (transaction.bank || 'BCA'), steps: ['Masukkan Kartu ATM', 'Pilih Transaksi Lainnya', 'Pilih Transfer', 'Pilih ke Rekening Virtual Account'] },
                  { title: 'Mobile Banking (m-' + (transaction.bank || 'BCA') + ')', steps: ['Buka Aplikasi Mobile Banking', 'Pilih m-Transfer', 'Pilih Virtual Account', 'Input Nomor VA'] }
                ].map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setOpenAccordion(openAccordion === idx ? -1 : idx)}
                      className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-all font-medium text-gray-700"
                    >
                      {item.title}
                      <ChevronDown size={20} className={`transform transition-transform ${openAccordion === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openAccordion === idx && (
                      <div className="p-4 bg-gray-50 text-sm text-gray-600 space-y-2 border-t border-gray-100">
                        {item.steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex gap-3">
                            <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                              {sIdx + 1}
                            </span>
                            <p>{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default PaymentDetail
