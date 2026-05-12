import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Truck, Star, ShoppingBag, X, Mail, Phone } from 'lucide-react'
import api from '../../services/api'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatRelativeTime } from '../../utils/helpers'
import { getLocationName } from '../../constants/locations'
import { getCategoryName } from '../../constants/categories'
import { getConditionLabel } from '../../constants/conditions'
import { BUTTONS, LABELS } from '../../constants/copywriting'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isBuyer, refreshUser } = useAuth()
  const [product, setProduct] = useState(null)
  const [seller, setSeller] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isVerifModalOpen, setIsVerifModalOpen] = useState(false)
  const [verifStep, setVerifStep] = useState('status') // 'status', 'otp'
  const [otpCode, setOtpCode] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [countdownEmail, setCountdownEmail] = useState(0)
  const [countdownPhone, setCountdownPhone] = useState(0)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const p = await productService.getProductById(id)
        if (!p) {
          toast.error('Barang nggak ketemu nih')
          navigate('/products')
          return
        }
        
        const isOwnerStr = user && (user.id === p.sellerId || user.id === p.user_id)
        const isAdminCheck = user && user.role === 'admin'
        
        if (p.status !== 'approved' && !isOwnerStr && !isAdminCheck) {
          toast.error('Barang belum bisa dibeli')
          navigate('/products')
          return
        }

        setProduct(p)
        
        // Langsung gunakan data seller dari objek produk (lebih efisien & stop error 403)
        setSeller(p.seller)
      } catch (err) {
        toast.error('Gagal mengambil data produk')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  // Timer Logic for Countdowns
  useEffect(() => {
    let timerEmail, timerPhone
    if (countdownEmail > 0) {
      timerEmail = setInterval(() => setCountdownEmail(prev => prev - 1), 1000)
    }
    if (countdownPhone > 0) {
      timerPhone = setInterval(() => setCountdownPhone(prev => prev - 1), 1000)
    }
    return () => {
      clearInterval(timerEmail)
      clearInterval(timerPhone)
    }
  }, [countdownEmail, countdownPhone])

  const handleChat = () => {
    if (!user) {
      toast.error('Login dulu ya buat chat!')
      navigate('/login')
      return
    }

    if (!isBuyer) {
      toast.error('Hanya pembeli yang bisa chat dengan penjual')
      return
    }

    navigate(`/chat?product=${product.id}&user=${product.sellerId}`)
  }

  const handleBuy = () => {
    if (!user) {
      toast.error('Login dulu ya buat beli!')
      navigate('/login')
      return
    }

    if (!isBuyer) {
      toast.error('Hanya pembeli yang bisa checkout')
      return
    }

    // CEK VERIFIKASI
    const needsEmailVerif = !user.google_id && !user.email_verified_at
    const needsPhoneVerif = !user.phone_verified_at

    if (needsEmailVerif || needsPhoneVerif) {
      setVerifStep('status')
      setIsVerifModalOpen(true)
      return
    }

    navigate(`/checkout/${product.id}`)
  }

  const handleSendEmail = async () => {
    try {
      setVerifying(true)
      await api.post('/email/verification-notification')
      toast.success('Link verifikasi dikirim ke email Anda')
      setCountdownEmail(60)
    } catch (error) {
      toast.error('Gagal mengirim email')
    } finally {
      setVerifying(false)
    }
  }

  const handleSendOTP = async () => {
    const targetPhone = user.no_telp || newPhone
    
    if (!targetPhone) {
      setVerifStep('input_phone')
      return
    }

    try {
      setVerifying(true)
      
      // Jika nomor baru diinput, update dulu ke profil
      if (newPhone && newPhone !== user.no_telp) {
        await api.put('/user/profile', { 
          name: user.name, 
          email: user.email, 
          no_telp: newPhone 
        })
        await refreshUser()
      }

      await api.post('/otp/send', { phone: targetPhone })
      toast.success('Kode OTP dikirim ke WhatsApp')
      setCountdownPhone(60)
      setVerifStep('otp')
    } catch (error) {
      toast.error('Gagal mengirim OTP. Pastikan nomor benar.')
    } finally {
      setVerifying(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return toast.error('OTP harus 6 digit')
    const targetPhone = user.no_telp || newPhone
    try {
      setVerifying(true)
      await api.post('/otp/verify', { phone: targetPhone, otp: otpCode })
      toast.success('Nomor HP berhasil diverifikasi!')
      await refreshUser()
      setVerifStep('status')
    } catch (error) {
      toast.error('Kode OTP salah atau kadaluarsa')
    } finally {
      setVerifying(false)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.fotos.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.fotos.length - 1 : prev - 1))
  }

  const isOwner = user && product && (user.id === product.sellerId || user.id === product.user_id)

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Container className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-primary-50 p-4 rounded-3xl animate-bounce shadow-soft mb-6 border border-primary-100">
              <ShoppingBag className="text-primary-600 w-12 h-12" />
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Lagi nyari datanya...</p>
          </div>
        </Container>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-4">
        <Container className="py-0">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-primary-600 transition-colors">Produk</Link>
            <ChevronRight size={14} />
            <Link to={`/products?category=${product.kategori}`} className="hover:text-primary-600 transition-colors">
              {getCategoryName(product.kategori)}
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.nama}</span>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Images */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center p-8 group">
              <img
                src={product.fotos[currentImageIndex]}
                alt={product.nama}
                className="w-full h-full object-contain drop-shadow-lg"
              />
              
              {product.fotos.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 hover:text-primary-600 rounded-full p-3 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 hover:text-primary-600 rounded-full p-3 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isBU && <Badge variant="bu" className="shadow-md px-4 py-1.5 text-sm">{LABELS.bu}</Badge>}
                {product.hargaLama && <Badge variant="discount" className="shadow-md px-4 py-1.5 text-sm">{LABELS.discount}</Badge>}
              </div>
            </div>

            {product.fotos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {product.fotos.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 bg-white p-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary-600 shadow-md' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={foto}
                      alt={`${product.nama} thumbnail ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Description (Desktop) */}
            <div className="hidden lg:block bg-white rounded-2xl p-8 shadow-soft border border-gray-100 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Deskripsi Barang</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p className="whitespace-pre-line">{product.deskripsi}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="primary" size="sm">{getConditionLabel(product.kondisi)}</Badge>
                  <span className="text-sm text-gray-500">•</span>
                  {product.stok <= 0 ? (
                    <Badge variant="error" size="sm" className="bg-rose-100 text-rose-700">Stok Habis</Badge>
                  ) : (
                    <Badge variant="info" size="sm">Stok: {product.stok}</Badge>
                  )}
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Diposting {formatRelativeTime(product.createdAt)}</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.nama}
                </h1>

                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {product.hargaLama && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-accent-600 bg-accent-100 px-2 py-0.5 rounded">
                        {Math.round(((product.hargaLama - product.harga) / product.hargaLama) * 100)}% OFF
                      </span>
                      <span className="text-gray-400 line-through">
                        {formatCurrency(product.hargaLama)}
                      </span>
                    </div>
                  )}
                  <div className="text-4xl font-black text-primary-700 tracking-tight">
                    {formatCurrency(product.harga)}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-50 p-2 rounded-lg text-primary-600 shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Transaksi Aman</h4>
                      <p className="text-sm text-gray-500">Uang kamu ditahan sistem sampai barang beneran sampai.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-50 p-2 rounded-lg text-primary-600 shrink-0">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Opsi Pengiriman</h4>
                      <p className="text-sm text-gray-500">Bisa kirim ke seluruh Jawa Tengah & DIY.</p>
                    </div>
                  </div>
                </div>

                {!isOwner && (
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <Button 
                      fullWidth 
                      size="lg" 
                      onClick={handleBuy} 
                      className="text-lg"
                      disabled={product.stok <= 0 || product.status === 'sold'}
                    >
                      {product.stok <= 0 || product.status === 'sold' ? 'Stok Habis' : BUTTONS.buy}
                    </Button>
                    <div className="flex gap-3">
                      <Button className="flex-1" size="lg" variant="secondary" onClick={handleChat}>
                        <MessageCircle size={20} />
                        {BUTTONS.chat}
                      </Button>
                      <Button variant="outline" size="lg" className="px-4" onClick={() => toast.success('Ditambahkan ke Wishlist!')}>
                        <Star size={20} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seller Info */}
              {!isOwner && seller && (
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Info Penjual</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl border-2 border-white shadow-sm">
                      {seller.profile?.nama?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{seller?.name || seller?.profile?.nama || 'Juragan'}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin size={14} className="mr-1" />
                        {getLocationName((seller.profile?.lokasi && seller.profile.lokasi !== 'N/A') ? seller.profile.lokasi : product.lokasi)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      <Star size={16} className="text-accent-500 fill-current" />
                      <span className="font-semibold text-gray-900">4.8</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description (Mobile) */}
              <div className="lg:hidden bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Barang</h2>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-line">{product.deskripsi}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Footer />

      {/* MODAL VERIFIKASI DOKUMEN */}
      {isVerifModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Lengkapi Verifikasi</h3>
              <button onClick={() => setIsVerifModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-8">
              {verifStep === 'status' ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={32} />
                    </div>
                    <p className="text-gray-600">Keamanan kamu prioritas kami. Silakan lengkapi verifikasi berikut untuk belanja.</p>
                  </div>

                  {/* Verifikasi Email (Hanya manual user) */}
                  {!user.google_id && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Mail className={user.email_verified_at ? "text-emerald-500" : "text-gray-400"} size={20} />
                        <div>
                          <p className="text-sm font-bold text-gray-900">Email</p>
                          <p className="text-[10px] text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {user.email_verified_at ? (
                        <Badge variant="success" size="sm">Verified</Badge>
                      ) : (
                        <button 
                          disabled={verifying || countdownEmail > 0}
                          onClick={handleSendEmail}
                          className="text-[11px] font-bold text-primary-600 hover:underline disabled:text-gray-400"
                        >
                          {countdownEmail > 0 ? `Tunggu ${countdownEmail}s` : "Verifikasi"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Verifikasi No HP */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone className={user.phone_verified_at ? "text-emerald-500" : "text-gray-400"} size={20} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Nomor WhatsApp</p>
                        <p className="text-[10px] text-gray-500">{user.no_telp || 'Belum diatur'}</p>
                      </div>
                    </div>
                    {user.phone_verified_at ? (
                      <Badge variant="success" size="sm">Verified</Badge>
                    ) : (
                      <button 
                        disabled={verifying || countdownPhone > 0}
                        onClick={handleSendOTP}
                        className="text-[11px] font-bold text-primary-600 hover:underline disabled:text-gray-400"
                      >
                        {countdownPhone > 0 ? `Tunggu ${countdownPhone}s` : "Verifikasi"}
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-center text-gray-400 mt-4 italic">*Refresh halaman setelah verifikasi email berhasil.</p>
                </div>
              ) : verifStep === 'input_phone' ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900">Input Nomor WhatsApp</h4>
                    <p className="text-sm text-gray-500 mt-1">Masukkan nomor WhatsApp aktif untuk menerima kode OTP.</p>
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="tel" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primary-500 outline-none transition-all font-bold text-lg"
                      placeholder="0812xxxxxxxx"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setVerifStep('status')}
                      className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      disabled={verifying || newPhone.length < 10}
                      onClick={handleSendOTP}
                      className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:bg-gray-300 transition-all shadow-lg shadow-primary-100"
                    >
                      {verifying ? "Proses..." : "Kirim OTP"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900">Masukkan Kode OTP</h4>
                    <p className="text-sm text-gray-500 mt-1">Kode 6 digit dikirim ke WhatsApp Anda.</p>
                  </div>
                  
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-3xl font-bold tracking-[1em] py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primary-500 outline-none transition-all"
                    placeholder="000000"
                  />

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setVerifStep('status')}
                      className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Kembali
                    </button>
                    <button 
                      disabled={verifying || otpCode.length !== 6}
                      onClick={handleVerifyOTP}
                      className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:bg-gray-300 transition-all shadow-lg shadow-primary-100"
                    >
                      {verifying ? "Proses..." : "Verifikasi"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
