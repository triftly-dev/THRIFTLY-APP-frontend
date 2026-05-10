import { useState, useRef } from 'react'
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
  ArrowLeft
} from 'lucide-react'
import Button from '../../../components/common/Button'

const Settings = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    no_telp: user?.no_telp || '',
    gender: user?.gender || '',
    date_of_birth: user?.date_of_birth || '',
  })

  // Security Form State
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  const hasChanges = 
    profileData.name !== user?.name ||
    profileData.email !== user?.email ||
    profileData.no_telp !== (user?.no_telp || '') ||
    profileData.gender !== (user?.gender || 'L') ||
    profileData.date_of_birth !== (user?.date_of_birth || '')

  const [ktp_image, setKtpImage] = useState(null)
  const [ktpData, setKtpData] = useState({
    nik: '',
    name: '',
    birth_place: '',
    birth_date: ''
  })

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
      refreshUser()
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
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                        placeholder="email@anda.com"
                      />
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
                  <button className="text-primary-600 text-sm font-bold hover:underline">+ Tambah Alamat Baru</button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-primary-200 bg-primary-50/30 rounded-2xl relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">Utama</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.no_telp}</p>
                    <p className="text-sm text-gray-600 mt-2">{user?.alamat || 'Belum ada alamat'}</p>
                    <button className="mt-3 text-sm font-bold text-primary-600">Ubah Alamat</button>
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
                  ) : user?.ktp_path ? (
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
                    <div className="max-w-xl space-y-6">
                      <p className="text-gray-600 text-sm">
                        Verifikasi KTP diperlukan jika Anda ingin menjadi **Penjual Terpercaya** dan meningkatkan batas penarikan dana.
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

                      <div 
                        onClick={() => document.getElementById('ktp_upload').click()}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all group min-h-[200px]"
                      >
                        {ktp_image ? (
                          <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden shadow-inner">
                            <img 
                              src={URL.createObjectURL(ktp_image)} 
                              alt="KTP Preview" 
                              className="w-full h-full object-contain bg-gray-100"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-sm font-bold">Ganti Foto</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="p-4 bg-gray-50 text-gray-400 rounded-full group-hover:text-primary-600 group-hover:bg-primary-50 transition-all">
                              <Upload size={32} />
                            </div>
                            <div className="text-center px-4">
                              <p className="font-bold text-gray-700">Klik untuk pilih foto KTP</p>
                              <p className="text-xs text-gray-400 mt-1">Pastikan tulisan terbaca jelas (Maks. 2MB)</p>
                            </div>
                          </>
                        )}
                        <input 
                          id="ktp_upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => setKtpImage(e.target.files[0])}
                        />
                      </div>

                      <button
                        onClick={handleKtpSubmit}
                        disabled={loading || !ktp_image}
                        className="mt-6 w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
                      >
                        Kirim untuk Verifikasi
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
