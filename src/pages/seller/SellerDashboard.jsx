import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, DollarSign, ArrowRight, Settings as SettingsIcon } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'
import FullPageLoader from '../../components/common/FullPageLoader'

const SellerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    newOrders: 0,
    toShip: 0,
    totalSales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSellerStats = async () => {
      if (user) {
        try {
          const products = await productService.getMyProducts()
          
          setStats({
            totalProducts: products.length,
            newOrders: 0, // Placeholder
            toShip: 0,    // Placeholder
            totalSales: user?.total_penjualan || 0
          })
        } catch (error) {
          console.error('Gagal mengambil statistik penjual:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchSellerStats()
  }, [user])

  if (loading) return <FullPageLoader message="Memuat dasbor penjualan..." />

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <Container className="py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dasbor Penjualan</h1>
            <p className="text-gray-500">Kelola operasional dan pantau performa tokomu.</p>
          </div>
          <Link to="/toko/produk/tambah">
            <Button className="shadow-lg shadow-primary-100">+ Tambah Produk</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Penjualan</p>
                <h3 className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pesanan Baru</p>
                <h3 className="text-xl font-bold text-gray-900">{stats.newOrders}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Perlu Dikirim</p>
                <h3 className="text-xl font-bold text-gray-900">{stats.toShip}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produk Aktif</p>
                <h3 className="text-xl font-bold text-gray-900">{stats.totalProducts}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Wallet Section */}
          <div className="lg:col-span-1">
            <div className="bg-primary-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400 blur-[100px] opacity-20"></div>
              <h2 className="text-lg font-medium opacity-70 mb-1">Saldo Penjual</h2>
              <h3 className="text-4xl font-bold mb-8">{formatCurrency(user?.saldo?.bisaDitarik || 0)}</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sm opacity-60">Saldo Tertahan</span>
                  <span className="font-semibold">{formatCurrency(user?.saldo?.ketahan || 0)}</span>
                </div>
              </div>

              <Button fullWidth className="bg-white text-primary-600 hover:bg-gray-50 border-none rounded-2xl py-4 font-bold text-lg">
                Tarik Saldo
              </Button>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Manajemen Toko</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/toko/pesanan" className="group">
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm group-hover:border-primary-100 transition-all flex items-start justify-between">
                  <div>
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <Package size={20} />
                    </div>
                    <h4 className="font-bold text-gray-900">Kelola Pesanan</h4>
                    <p className="text-sm text-gray-500 mt-1">Proses pengiriman & konfirmasi transaksi.</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-primary-600 mt-1" />
                </div>
              </Link>

              <Link to="/toko/produk" className="group">
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm group-hover:border-primary-100 transition-all flex items-start justify-between">
                  <div>
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <CheckCircle size={20} />
                    </div>
                    <h4 className="font-bold text-gray-900">Katalog Produk</h4>
                    <p className="text-sm text-gray-500 mt-1">Atur stok, harga, dan deskripsi jualan.</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-primary-600 mt-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default SellerDashboard
