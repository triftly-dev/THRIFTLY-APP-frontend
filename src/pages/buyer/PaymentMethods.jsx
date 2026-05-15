import { useState } from 'react'
import { CreditCard, Plus, Trash2, CheckCircle2, Building2 } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import UserSidebar from '../../components/layout/UserSidebar'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const PaymentMethods = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [methods, setMethods] = useState([
    { id: 1, type: 'Bank Transfer', provider: 'BCA', accountNumber: '8830******12', isMain: true },
    { id: 2, type: 'E-Wallet', provider: 'GoPay', accountNumber: '0822****7028', isMain: false },
  ])

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
      setMethods(methods.filter(m => m.id !== id))
      toast.success('Metode pembayaran berhasil dihapus')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container>
          <div className="flex flex-col md:flex-row gap-8">
            <UserSidebar />

            <div className="flex-1">
              <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Metode Pembayaran</h1>
                    <p className="text-gray-500">Kelola rekening bank dan dompet digital Anda untuk transaksi.</p>
                  </div>
                  <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Tambah Metode Baru
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {methods.length > 0 ? (
                    methods.map((method) => (
                      <div 
                        key={method.id} 
                        className={`p-6 rounded-2xl border transition-all ${
                          method.isMain ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 bg-white hover:border-primary-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                              method.provider === 'BCA' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {method.provider === 'BCA' ? 'BCA' : <Building2 size={24} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{method.provider}</h3>
                                {method.isMain && (
                                  <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Utama
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{method.type}</p>
                              <p className="text-sm font-medium text-gray-900 mt-2">{method.accountNumber}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!method.isMain && (
                              <button 
                                onClick={() => handleDelete(method.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                            <button className="text-sm font-bold text-primary-600 hover:underline">Ubah</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                      <CreditCard className="mx-auto text-gray-300 mb-4" size={48} />
                      <p className="text-gray-500">Belum ada metode pembayaran yang ditambahkan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Add Method Modal (Placeholder) */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Tambah Metode Pembayaran"
      >
        <div className="space-y-4">
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-6">Fitur penambahan metode pembayaran sedang dikembangkan untuk integrasi API Bank yang lebih aman.</p>
            <Button fullWidth onClick={() => setIsAddModalOpen(false)}>Dimengerti</Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default PaymentMethods
