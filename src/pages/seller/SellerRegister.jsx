import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { registerSellerSchema } from '../../utils/validation'
import { addWatermarkToImage } from '../../utils/watermark'
import Button from '../../components/common/Button'
import MapPicker from '../../components/common/MapPicker'
import Container from '../../components/layout/Container'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { ALL_LOCATIONS } from '../../constants/locations'
import { BUTTONS, PLACEHOLDERS, INSTRUCTIONS } from '../../constants/copywriting'
import toast from 'react-hot-toast'

const SellerRegister = () => {
  const navigate = useNavigate()
  const { user, register: registerUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ktpPreview, setKtpPreview] = useState(null)
  const [isMapOpen, setIsMapOpen] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSellerSchema)
  })

  const handleKtpUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const watermarkedImage = await addWatermarkToImage(file)
      setKtpPreview(watermarkedImage)
      setValue('ktpUrl', watermarkedImage)
      toast.success('Foto KTP berhasil diupload dan diberi watermark!')
    } catch (error) {
      toast.error('Gagal upload foto KTP')
    }
  }

  const handleMapSelect = (selectedData) => {
    // 1. Isi alamat lengkap
    setValue('alamat', selectedData.address)
    
    // 2. Sinkronkan ke dropdown lokasi (ALL_LOCATIONS)
    // Cari yang namanya mirip dengan hasil reverse geocoding
    const cityName = selectedData.city?.toLowerCase() || ''
    const matchedLocation = ALL_LOCATIONS.find(loc => 
      cityName.includes(loc.nama.toLowerCase()) || 
      loc.nama.toLowerCase().includes(cityName)
    )

    if (matchedLocation) {
      setValue('lokasi', matchedLocation.id)
      toast.success(`Lokasi disinkronkan ke: ${matchedLocation.nama}`)
    } else {
      toast.error('Lokasi di peta tidak ditemukan dalam daftar jangkauan kami. Silakan pilih lokasi terdekat dari dropdown.')
    }

    // Tutup peta setelah konfirmasi sesuai permintaan user
    setIsMapOpen(false)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await registerUser({
      name: data.nama,
      email: data.email,
      password: data.password,
      no_telp: data.noTelp,
      alamat: data.alamat,
      lokasi: data.lokasi,
      date_of_birth: data.ttl,
      no_rekening: data.noRekening,
      ktp_url: data.ktpUrl,
      role: 'seller'
    })
    setLoading(false)

    if (result.success) {
      navigate('/toko/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-1 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Daftar sebagai Penjual
            </h1>
            <p className="text-gray-600 mb-6">
              Lengkapi data KYC untuk mulai jualan
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Informasi Akun</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={PLACEHOLDERS.email}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        {...register('password')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={PLACEHOLDERS.password}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password *
                      </label>
                      <input
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={PLACEHOLDERS.password}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Data Diri</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      {...register('nama')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={PLACEHOLDERS.name}
                    />
                    {errors.nama && (
                      <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        {...register('ttl')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      {errors.ttl && (
                        <p className="text-red-500 text-sm mt-1">{errors.ttl.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon *
                      </label>
                      <input
                        type="tel"
                        {...register('noTelp')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={PLACEHOLDERS.phone}
                      />
                      {errors.noTelp && (
                        <p className="text-red-500 text-sm mt-1">{errors.noTelp.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Titik Lokasi Toko *
                      </label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsMapOpen(!isMapOpen)}
                      >
                        {isMapOpen ? 'Tutup Peta' : 'Ubah Lokasi di Peta'}
                      </Button>
                    </div>

                    {isMapOpen ? (
                      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 overflow-hidden">
                        <div className="h-[400px]">
                          <MapPicker onSelect={handleMapSelect} />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                        <div className="bg-green-500 text-white p-1 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-sm text-green-700 font-medium">Lokasi sudah ditentukan di peta.</p>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-wider">Langkah: Geser peta → Klik titik lokasi tepat → Klik tombol Konfirmasi di dalam peta</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi (Wilayah) *
                      </label>
                      <select
                        {...register('lokasi')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                      >
                        <option value="">Pilih Wilayah</option>
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
                      {errors.lokasi && (
                        <p className="text-red-500 text-sm mt-1">{errors.lokasi.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        {...register('alamat')}
                        rows={1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        placeholder="Detail alamat (RT/RW, No. Rumah)"
                      />
                      {errors.alamat && (
                        <p className="text-red-500 text-sm mt-1">{errors.alamat.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Rekening *
                    </label>
                    <input
                      type="text"
                      {...register('noRekening')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={PLACEHOLDERS.accountNumber}
                    />
                    {errors.noRekening && (
                      <p className="text-red-500 text-sm mt-1">{errors.noRekening.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Verifikasi KTP</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Foto KTP *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleKtpUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <input type="hidden" {...register('ktpUrl')} />
                  {errors.ktpUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.ktpUrl.message}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{INSTRUCTIONS.uploadKTP}</p>

                  {ktpPreview && (
                    <div className="mt-4">
                      <img
                        src={ktpPreview}
                        alt="Preview KTP"
                        className="max-w-md rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {BUTTONS.register}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default SellerRegister
