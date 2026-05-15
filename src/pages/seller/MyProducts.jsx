import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, ShoppingBag } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'
import { STATUS } from '../../constants/copywriting'
import toast from 'react-hot-toast'

const MyProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('aktif')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        try {
          setLoading(true)
          const data = await productService.getMyProducts()
          setProducts(data)
        } catch (error) {
          toast.error('Gagal mengambil daftar produk')
        } finally {
          setLoading(false)
        }
      }
    }
    fetchProducts()
  }, [user])

  const handleDelete = async (id) => {
    if (window.confirm('Yakin mau hapus produk ini?')) {
      try {
        await productService.deleteProduct(id)
        setProducts(products.filter(p => p.id !== id))
        toast.success('Produk berhasil dihapus')
      } catch (error) {
        toast.error('Gagal menghapus produk')
      }
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    }
    const variant = variants[status] || 'info'
    const statusText = status ? (STATUS[status] || status) : 'Unknown'
    return <Badge variant={variant}>{statusText}</Badge>
  }

  const filteredProducts = products.filter(product => {
    const stock = product.stok ?? product.stock ?? 0;
    const isOutOfStock = stock <= 0;
    const isApproved = product.status === 'approved';
    const isActive = isApproved && !isOutOfStock;
    
    return activeTab === 'aktif' ? isActive : !isActive;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produk Saya</h1>
              <p className="text-gray-500 mt-1">Kelola stok dan informasi produk jualan Anda.</p>
            </div>
            <Link to="/toko/produk/tambah">
              <Button className="shadow-lg shadow-primary-200">
                + Tambah Produk Baru
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'aktif' 
                ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Produk Aktif ({products.filter(p => p.status === 'approved' && (p.stok || p.stock || 0) > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('tidak_aktif')}
              className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'tidak_aktif' 
                ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Tidak Aktif ({products.filter(p => p.status !== 'approved' || (p.stok || p.stock || 0) <= 0).length})
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Memuat daftar produk...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-soft border border-gray-100 hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-40 h-40 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      {product?.fotos && product.fotos.length > 0 ? (
                        <img
                          src={product.fotos[0]}
                          alt={product.nama || 'Produk'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                      {product.isBU && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                          BUTUH UANG
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {product.nama}
                          </h3>
                          <div className="flex gap-2">
                            <Link to={`/toko/produk/edit/${product.id}`}>
                              <button className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl border border-gray-100 transition-all">
                                <Edit size={18} />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-primary-700">
                          {formatCurrency(product.harga || product.price || 0)}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2 items-center">
                        {getStatusBadge(product.status)}
                        
                        {(product.stok || product.stock || 0) <= 0 ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                            STOK HABIS
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold border border-primary-100">
                            STOK: {product.stok ?? product.stock ?? 0}
                          </div>
                        )}
                        
                      </div>
                      
                      {product.adminNote && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Catatan Admin</p>
                          </div>
                          <p className="text-sm text-amber-700 italic">"{product.adminNote}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada produk</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {activeTab === 'aktif' 
                    ? 'Tidak ada produk aktif saat ini. Mulai jualan dengan menambah produk baru!' 
                    : 'Tidak ada produk yang sedang non-aktif.'}
                </p>
              </div>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default MyProducts
