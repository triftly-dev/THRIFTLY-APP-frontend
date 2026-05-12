import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, ShieldCheck, ChevronRight, Copy, QrCode, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { transactionService } from '../../services/transactionService'
import api from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import { ALL_LOCATIONS } from '../../constants/locations'
import MapPicker from '../../components/common/MapPicker'

const Checkout = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [shippingOption, setShippingOption] = useState('reguler')
  const [paymentMethod, setPaymentMethod] = useState('transfer_bank')
  const [ongkirDitanggung, setOngkirDitanggung] = useState('buyer')
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [transactionData, setTransactionData] = useState(null)
  
  // Alamat Edit States
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [addressForm, setAddressForm] = useState({
    alamat: user?.alamat || user?.profile?.alamat || '',
    lokasi: user?.lokasi || user?.profile?.lokasi || ''
  })
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false)
  const { refreshUser } = useAuth()

  useEffect(() => {
    if (user) {
      setAddressForm({
        alamat: user.alamat || user.profile?.alamat || '',
        lokasi: user.lokasi || user.profile?.lokasi || ''
      })
    }
  }, [user])

  const shippingRates = {
    reguler: 0,
    next_day: 0,
    cargo: 0
  }

  // Midtrans Snap script loading removed for Custom UI / Core API integration.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await productService.getProductById(productId)
        if (!p) {
          toast.error('Produk tidak ditemukan')
          navigate('/products')
          return
        }
        
        const isOwner = user && (user.id === p.sellerId || user.id === p.user_id)
        const isAdmin = user && user.role === 'admin'
        
        if (p.status !== 'approved' && !isAdmin && !isOwner) {
          toast.error('Produk tidak tersedia untuk dibeli')
          navigate('/products')
          return
        }

        setProduct(p)
        setSeller(p.seller)
      } catch (error) {
        toast.error('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, navigate])

  const handleUpdateAddress = async () => {
    if (!addressForm.alamat || !addressForm.lokasi) {
      toast.error('Alamat dan Lokasi wajib diisi')
      return
    }

    setIsUpdatingAddress(true)
    try {
      await api.put('/user/profile', {
        name: user.name,
        email: user.email,
        alamat: addressForm.alamat,
        lokasi: addressForm.lokasi
      })
      await refreshUser()
      setIsEditingAddress(false)
      toast.success('Alamat berhasil diperbarui')
    } catch (error) {
      toast.error('Gagal memperbarui alamat')
    } finally {
      setIsUpdatingAddress(false)
    }
  }

  const handleMapSelect = (selectedData) => {
    // Cari kecocokan kota/kabupaten di ALL_LOCATIONS
    let matchedLocation = ''
    if (selectedData.city) {
      const searchName = selectedData.city.toLowerCase()
      const found = ALL_LOCATIONS.find(loc => 
        searchName.includes(loc.nama.toLowerCase().replace('kota ', '').replace('kab. ', ''))
      )
      if (found) matchedLocation = found.id
    }

    setAddressForm({
      ...addressForm,
      alamat: selectedData.address,
      lokasi: matchedLocation || addressForm.lokasi // Update jika ketemu, jika tidak tetap yang lama
    })
    setShowMapModal(false)
  }

  const handleCheckout = async () => {
    const userAddress = user?.alamat || user?.profile?.alamat;
    if (!userAddress) {
      toast.error('Silakan lengkapi alamat pengiriman di profil Anda')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await api.post('/payment/charge', {
        product_id: product.id,
        price: totalPembayaran,
        bank: paymentMethod === 'transfer_bank' ? 'bca' : paymentMethod,
        seller_id: seller?.id || product.user_id,
        alamat_pengiriman: user.alamat || user.profile?.alamat,
        ongkir: ongkir
      });

      if (response.data.success) {
        console.log('DEBUG PAYMENT RESPONSE:', response.data);
        toast.success('Pesanan berhasil dibuat!');
        // Menggunakan rute yang benar sesuai src/routes/index.jsx
        navigate(`/payment/success/${response.data.data.order_id}`);
      } else {
        throw new Error('Gagal memproses pembayaran');
      }
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Gagal terhubung ke server pembayaran');
      setIsSubmitting(false);
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Container className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-primary-50 p-4 rounded-3xl animate-bounce shadow-soft mb-6 border border-primary-100">
              <ShoppingBag className="text-primary-600 w-12 h-12" />
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Menyiapkan pembayaran...</p>
          </div>
        </Container>
        <Footer />
      </div>
    )
  }

  const ongkir = ongkirDitanggung === 'buyer' ? shippingRates[shippingOption] : 0
  const totalPembayaran = parseInt(product.harga) + parseInt(ongkir) + 0 // 0 service fee for testing

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Alamat Pengiriman */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-primary-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name || user.profile?.nama}</p>
                      <p className="text-sm text-gray-500">{user.no_telp || user.profile?.noTelp || '-'}</p>
                    </div>
                    <div className="flex gap-2">
                      {!isEditingAddress ? (
                        <button 
                          onClick={() => setIsEditingAddress(true)}
                          className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1 rounded-lg border border-primary-100 transition-all"
                        >
                          Ubah
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsEditingAddress(false)}
                          className="text-xs font-bold text-gray-500 hover:bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 transition-all"
                        >
                          Batal
                        </button>
                      )}
                      <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">Utama</span>
                    </div>
                  </div>

                  {isEditingAddress ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Lengkap</label>
                        <button 
                          onClick={() => setShowMapModal(true)}
                          className="flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:underline"
                        >
                          <MapPin size={12} />
                          Pilih dari Peta
                        </button>
                      </div>
                      <textarea 
                        value={addressForm.alamat}
                        onChange={(e) => setAddressForm({...addressForm, alamat: e.target.value})}
                        className="w-full mt-1 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-h-[80px]"
                        placeholder="Masukkan alamat lengkap pengiriman..."
                      />
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Kota/Kabupaten</label>
                        <select 
                          value={addressForm.lokasi}
                          onChange={(e) => setAddressForm({...addressForm, lokasi: e.target.value})}
                          className="w-full mt-1 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                          <option value="">Pilih Lokasi</option>
                          <optgroup label="DI Yogyakarta">
                            {ALL_LOCATIONS.filter(loc => loc.provinsi === 'DI Yogyakarta').map(loc => (
                              <option key={loc.id} value={loc.id}>{loc.nama}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Jawa Tengah">
                            {ALL_LOCATIONS.filter(loc => loc.provinsi === 'Jawa Tengah').map(loc => (
                              <option key={loc.id} value={loc.id}>{loc.nama}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                      <Button 
                        fullWidth 
                        size="sm" 
                        onClick={handleUpdateAddress}
                        loading={isUpdatingAddress}
                        disabled={isUpdatingAddress}
                      >
                        Simpan Alamat Baru
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mt-2">
                      {user.alamat || user.profile?.alamat || 'Alamat belum diatur. Silakan klik "Ubah" untuk melengkapi.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Detail Produk */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Barang yang Dibeli</h2>
                
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0">
                    <img src={product.fotos?.[0]} alt={product.nama} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.nama}</h3>
                    <p className="text-sm text-gray-500 mt-1">Penjual: {seller?.name || seller?.profile?.nama || 'Unknown'}</p>
                    <p className="font-bold text-primary-700 mt-2">{formatCurrency(product.harga)}</p>
                  </div>
                </div>
              </div>

              {/* Opsi Pengiriman */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="text-primary-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Opsi Pengiriman</h2>
                </div>

                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Siapa yang tanggung ongkir?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ongkirDitanggung" 
                          value="buyer" 
                          checked={ongkirDitanggung === 'buyer'}
                          onChange={(e) => setOngkirDitanggung(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Pembeli (Saya)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="ongkirDitanggung" 
                          value="seller" 
                          checked={ongkirDitanggung === 'seller'}
                          onChange={(e) => setOngkirDitanggung(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Penjual (Sesuai kesepakatan)</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${shippingOption === 'reguler' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">Reguler</span>
                        <input type="radio" name="shipping" value="reguler" checked={shippingOption === 'reguler'} onChange={(e) => setShippingOption(e.target.value)} className="text-primary-600" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">2-3 hari kerja</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(shippingRates.reguler)}</p>
                    </label>
                    
                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${shippingOption === 'next_day' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">Next Day</span>
                        <input type="radio" name="shipping" value="next_day" checked={shippingOption === 'next_day'} onChange={(e) => setShippingOption(e.target.value)} className="text-primary-600" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">1 hari kerja</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(shippingRates.next_day)}</p>
                    </label>

                    <label className={`border rounded-xl p-4 cursor-pointer transition-all ${shippingOption === 'cargo' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">Cargo</span>
                        <input type="radio" name="shipping" value="cargo" checked={shippingOption === 'cargo'} onChange={(e) => setShippingOption(e.target.value)} className="text-primary-600" />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">3-5 hari kerja</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(shippingRates.cargo)}</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-primary-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">BCA</div>
                      <div>
                        <p className="font-medium text-gray-900">Transfer Bank BCA</p>
                        <p className="text-xs text-gray-500">Dicek otomatis</p>
                      </div>
                    </div>
                    <input type="radio" name="payment" value="transfer_bank" checked={paymentMethod === 'transfer_bank'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 w-5 h-5" />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs">BRI</div>
                      <div>
                        <p className="font-medium text-gray-900">Transfer Bank BRI</p>
                        <p className="text-xs text-gray-500">Dicek otomatis</p>
                      </div>
                    </div>
                    <input type="radio" name="payment" value="bri" checked={paymentMethod === 'bri'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 w-5 h-5" />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-xs">GOPAY</div>
                      <div>
                        <p className="font-medium text-gray-900">GoPay</p>
                        <p className="text-xs text-gray-500">Bayar instan</p>
                      </div>
                    </div>
                    <input type="radio" name="payment" value="gopay" checked={paymentMethod === 'gopay'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-primary-600 w-5 h-5" />
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 sticky top-28">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Belanja</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Harga Barang</span>
                    <span className="font-medium text-gray-900">{formatCurrency(product.harga)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Ongkos Kirim</span>
                    <span className="font-medium text-gray-900">
                      {ongkirDitanggung === 'seller' ? 'Ditanggung Penjual' : formatCurrency(ongkir)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Layanan Platform</span>
                    <span className="font-medium text-gray-900">{formatCurrency(0)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Tagihan</span>
                    <span className="text-xl font-bold text-primary-700">{formatCurrency(totalPembayaran)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-3 flex items-start gap-3 mb-6">
                  <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Transaksi aman. Dana akan diteruskan ke penjual setelah barang Anda terima dengan baik.
                  </p>
                </div>

                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={handleCheckout}
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !(user?.alamat || user.profile?.alamat)}
                >
                  Bayar Sekarang
                </Button>
                
                {!(user?.alamat || user.profile?.alamat) && (
                  <p className="text-xs text-red-500 text-center mt-3">
                    Silakan isi alamat pengiriman di profil terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />

      {/* MODAL PETA */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title="Pilih Lokasi Pengiriman"
        maxWidth="max-w-4xl"
      >
        <div className="h-[500px]">
          <MapPicker 
            onSelect={handleMapSelect}
            initialAddress={addressForm.alamat}
          />
        </div>
      </Modal>
    </div>
  )
}

export default Checkout