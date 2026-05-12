import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import toast from 'react-hot-toast'
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  ChevronRight, 
  Mail, 
  Phone, 
  Calendar, 
  UserCircle,
  Lock,
  Upload,
  CheckCircle2,
  ArrowLeft,
  X,
  ShoppingBag,
  AlertCircle
} from 'lucide-react'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import MapPicker from '../../../components/common/MapPicker'

const Settings = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const [countdown, setCountdown] = useState(0)

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    no_telp: user?.no_telp || '',
    gender: user?.gender || 'L',
    date_of_birth: user?.date_of_birth || '',
    alamat: user?.alamat || '',
    lokasi: user?.lokasi || ''
  })

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [tempAddress, setTempAddress] = useState({
    alamat: user?.alamat || '',
    lokasi: user?.lokasi || ''
  })

  // Security Form State
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  // Timer Logic
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // Reset profileData when user changes from context
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        no_telp: user.no_telp || '',
        gender: user.gender || 'L',
        date_of_birth: user.date_of_birth || '',
        alamat: user.alamat || '',
        lokasi: user.lokasi || ''
      })
    }
  }, [user])

  const hasChanges = 
    profileData.name !== (user?.name || '') ||
    profileData.email !== (user?.email || '') ||
    profileData.no_telp !== (user?.no_telp || '') ||
    profileData.gender !== (user?.gender || 'L') ||
    profileData.date_of_birth !== (user?.date_of_birth || '')

  const [ktp_image, setKtpImage] = useState(null)
  const [ktpPreview, setKtpPreview] = useState(null)
  const ktpInputRef = useRef(null)
  const [ktpData, setKtpData] = useState({
    nik: user?.ktp_nik || '',
    name: user?.ktp_name || '',
    birth_place: user?.ktp_birth_place || '',
    birth_date: user?.ktp_birth_date || ''
  })

  const handleKtpFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setKtpImage(file)
      setKtpPreview(URL.createObjectURL(file))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key])
      })
      
      await api.post('/user/profile?_method=PUT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      await refreshUser()
      toast.success('Profil berhasil diperbarui')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('name', profileData.name)
    formData.append('email', profileData.email)

    try {
      setLoading(true)
      await api.post('/user/profile?_method=PUT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await refreshUser()
      toast.success('Foto profil berhasil diperbarui')
    } catch (error) {
      toast.error('Gagal mengunggah foto')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.new_password_confirmation) {
      return toast.error('Konfirmasi password tidak cocok')
    }

    setLoading(true)
    try {
      await api.post('/user/change-password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
        new_password_confirmation: passwords.new_password_confirmation
      })
      toast.success('Password berhasil diubah')
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setLoading(false)
    }
  }

  const handleKtpSubmit = async (e) => {
    e.preventDefault()
    if (!ktp_image) return toast.error('Pilih foto KTP terlebih dahulu')
    if (!ktpData.nik || ktpData.nik.length !== 16) return toast.error('NIK harus 16 digit')
    if (!ktpData.name) return toast.error('Nama sesuai KTP wajib diisi')
    if (!ktpData.birth_place || !ktpData.birth_date) return toast.error('Data tempat/tanggal lahir wajib diisi')

    const formData = new FormData()
    formData.append('ktp_image', ktp_image)
    formData.append('ktp_nik', ktpData.nik)
    formData.append('ktp_name', ktpData.name)
    formData.append('ktp_birth_place', ktpData.birth_place)
    formData.append('ktp_birth_date', ktpData.birth_date)

    setLoading(true)
    try {
      await api.post('/user/verify-ktp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('KTP berhasil diunggah, menunggu verifikasi admin')
      await refreshUser()
      // Reset preview
      setKtpPreview(null)
      setKtpImage(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunggah KTP')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'profile', label: 'Profil Saya', icon: UserCircle },
    { id: 'address', label: 'Daftar Alamat', icon: MapPin },
    { id: 'security', label: 'Keamanan', icon: ShieldCheck },
  ]

  const handleAddressSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      // Send current profile data + updated address
      Object.keys(profileData).forEach(key => {
        if (key !== 'alamat' && key !== 'lokasi') {
          formData.append(key, profileData[key])
        }
      })
      formData.append('alamat', tempAddress.alamat)
      formData.append('lokasi', tempAddress.lokasi)
      
      await api.post('/user/profile?_method=PUT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      await refreshUser()
      setProfileData(prev => ({
        ...prev,
        alamat: tempAddress.alamat,
        lokasi: tempAddress.lokasi
      }))
      setIsAddressModalOpen(false)
      toast.success('Alamat berhasil diperbarui')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui alamat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali ke Beranda</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Pengaturan Akun</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Menu */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                  <ChevronRight size={16} className={`ml-auto ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 md:p-8">
            
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex flex-col items-center sm:items-start sm:flex-row gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                      {user?.avatar ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}/storage/${user.avatar.startsWith('avatars/') ? user.avatar : `avatars/${user.avatar}`}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle size={80} className="text-gray-300" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors group-hover:scale-110 duration-200"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="text-center sm:text-left mt-2">
                    <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-500 text-sm">Update foto profil dan informasi pribadi Anda.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                        placeholder="Nama lengkap Anda"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Alamat Email</label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                          placeholder="email@anda.com"
                        />
                      </div>
                      {user?.email && !user?.email_verified_at && (
                        <button
                          type="button"
                          disabled={loading || countdown > 0}
                          onClick={async () => {
                            try {
                              setLoading(true)
                              await api.post('/email/verification-notification')
                              toast.success('Link verifikasi telah dikirim ke email Anda!')
                              setCountdown(60) // Start 60s countdown
                            } catch (error) {
                              toast.error('Gagal mengirim link verifikasi')
                            } finally {
                              setLoading(false)
                            }
                          }}
                          className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            countdown > 0 
                              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {countdown > 0 ? `Tunggu ${countdown}s` : 'Kirim Link Verifikasi'}
                        </button>
                      )}
                      {user?.email_verified_at && (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 rounded-xl border border-emerald-100">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nomor HP</label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text"
                          value={profileData.no_telp}
                          onChange={(e) => setProfileData({...profileData, no_telp: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                          placeholder="0812xxxx"
                        />
                      </div>
                      {user?.no_telp && !user?.phone_verified_at && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setLoading(true)
                              await api.post('/otp/send', { phone: user.no_telp })
                              toast.success('OTP terkirim ke WhatsApp')
                              navigate(`/verify-otp?phone=${user.no_telp}`)
                            } catch (error) {
                              toast.error('Gagal mengirim OTP')
                            } finally {
                              setLoading(false)
                            }
                          }}
                          className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all whitespace-nowrap"
                        >
                          Verifikasi
                        </button>
                      )}
                      {user?.phone_verified_at && (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 rounded-xl border border-emerald-100">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setProfileData({...profileData, gender: 'L'})}
                        className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${
                          profileData.gender === 'L' 
                            ? 'bg-primary-50 border-primary-500 text-primary-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileData({...profileData, gender: 'P'})}
                        className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${
                          profileData.gender === 'P' 
                            ? 'bg-primary-50 border-primary-500 text-primary-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tanggal Lahir</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="date"
                        value={profileData.date_of_birth}
                        onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                  <Button 
                    type="submit" 
                    loading={loading}
                    disabled={!hasChanges}
                    className={`w-full md:w-auto px-12 py-3 rounded-xl font-bold transition-all ${
                      !hasChanges 
                        ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-500' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200'
                    }`}
                  >
                    Simpan Perubahan
                  </Button>
                </div>
                </form>
              </div>
            )}

            {/* TAB: ADDRESS */}
            {activeTab === 'address' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Alamat Saya</h3>
                  <button 
                    onClick={() => {
                      setTempAddress({
                        alamat: user?.alamat || '',
                        lokasi: user?.lokasi || ''
                      })
                      setIsAddressModalOpen(true)
                    }}
                    className="text-primary-600 text-sm font-bold hover:underline"
                  >
                    + Tambah Alamat Baru
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-primary-200 bg-primary-50/30 rounded-2xl relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">Utama</span>
                      {user?.lokasi && (
                        <div className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          <MapPin size={10} />
                          Titik Map Terpasang
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.no_telp}</p>
                    <p className="text-sm text-gray-600 mt-2">{user?.alamat || 'Belum ada alamat'}</p>
                    <button 
                      onClick={() => {
                        setTempAddress({
                          alamat: user?.alamat || '',
                          lokasi: user?.lokasi || ''
                        })
                        setIsAddressModalOpen(true)
                      }}
                      className="mt-3 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Ubah Alamat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                
                {/* Change Password */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <Lock size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Ubah Kata Sandi</h3>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password Sekarang</label>
                      <input 
                        type="password"
                        value={passwords.current_password}
                        onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password Baru</label>
                      <input 
                        type="password"
                        value={passwords.new_password}
                        onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konfirmasi Password Baru</label>
                      <input 
                        type="password"
                        value={passwords.new_password_confirmation}
                        onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                <hr className="border-gray-100" />

                {/* Identity Verification (KTP) */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Verifikasi Data Diri (KTP)</h3>
                  </div>

                  {user?.is_ktp_verified ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Akun Terverifikasi</h4>
                        <p className="text-sm text-emerald-700">Data diri Anda telah diverifikasi oleh sistem.</p>
                      </div>
                    </div>
                  ) : user?.ktp_status === 'pending' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center animate-pulse">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-900">Sedang Diverifikasi</h4>
                        <p className="text-sm text-amber-700">Data KTP Anda sedang dalam proses peninjauan oleh Admin.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {user?.ktp_status === 'rejected' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center">
                              <X size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-rose-900">Verifikasi Ditolak</h4>
                              <p className="text-sm text-rose-700">Maaf, pengajuan verifikasi KTP Anda ditolak.</p>
                            </div>
                          </div>
                          <div className="bg-white/50 border border-rose-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-rose-800 uppercase mb-1">Alasan Penolakan:</p>
                            <p className="text-sm text-rose-700">{user.ktp_rejection_reason || 'Dokumen tidak sesuai atau kurang jelas.'}</p>
                          </div>
                        </div>
                      )}

                      <div className="max-w-xl space-y-6">
                        <p className="text-gray-600 text-sm">
                          {user?.ktp_status === 'rejected' 
                            ? 'Silakan perbaiki data di bawah dan upload ulang foto KTP yang lebih jelas untuk mengajukan verifikasi kembali.'
                            : 'Verifikasi KTP diperlukan jika Anda ingin menjadi **Penjual Terpercaya** dan meningkatkan batas penarikan dana.'}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">NIK KTP (16 Digit)</label>
                            <input 
                              type="text"
                              maxLength="16"
                              placeholder="Masukkan 16 digit NIK"
                              value={ktpData.nik}
                              onChange={(e) => setKtpData({...ktpData, nik: e.target.value})}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nama Sesuai KTP</label>
                            <input 
                              type="text"
                              placeholder="Masukkan nama lengkap"
                              value={ktpData.name}
                              onChange={(e) => setKtpData({...ktpData, name: e.target.value})}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tempat Lahir</label>
                            <input 
                              type="text"
                              placeholder="Contoh: Jakarta"
                              value={ktpData.birth_place}
                              onChange={(e) => setKtpData({...ktpData, birth_place: e.target.value})}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tanggal Lahir</label>
                            <input 
                              type="date"
                              value={ktpData.birth_date}
                              onChange={(e) => setKtpData({...ktpData, birth_date: e.target.value})}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Foto KTP</label>
                          <div 
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                              ktpPreview ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                            }`}
                            onClick={() => ktpInputRef.current.click()}
                          >
                            <input 
                              type="file"
                              ref={ktpInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleKtpFileChange}
                            />
                            
                            {ktpPreview ? (
                              <div className="relative group mx-auto w-full max-w-sm">
                                <img src={ktpPreview} alt="KTP Preview" className="rounded-lg shadow-md" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center">
                                  <p className="text-white font-bold text-sm">Ganti Foto</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto">
                                  <ShoppingBag size={24} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">Klik untuk upload foto KTP</p>
                                  <p className="text-xs text-gray-500 mt-1">Format JPG, PNG (Maks 2MB)</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={handleKtpSubmit}
                          disabled={loading || !ktpData.nik || !ktpData.name || !ktp_image}
                          className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200"
                        >
                          {loading ? 'Mengirim...' : 'Kirim untuk Verifikasi'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Ubah Alamat Pengiriman"
        size="lg"
      >
        <form onSubmit={handleAddressSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Alamat Lengkap</label>
            <textarea
              value={tempAddress.alamat}
              onChange={(e) => setTempAddress({ ...tempAddress, alamat: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all min-h-[100px]"
              placeholder="Masukkan alamat lengkap (Jalan, No Rumah, RT/RW, Kecamatan, dsb)"
              required
            />
          </div>

          <MapPicker
            defaultLat={tempAddress.lokasi ? parseFloat(tempAddress.lokasi.split(',')[0]) : null}
            defaultLng={tempAddress.lokasi ? parseFloat(tempAddress.lokasi.split(',')[1]) : null}
            onLocationChange={(loc) => {
              setTempAddress({
                ...tempAddress,
                alamat: loc.address || tempAddress.alamat,
                lokasi: `${loc.lat},${loc.lng}`
              })
            }}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-3"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 py-3 bg-primary-600 text-white"
            >
              Simpan Alamat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Settings
