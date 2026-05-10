import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { userService } from '../../services/userService'
import { useEffect, useState } from 'react'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'

const UsersList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer',
    nama: '',
    noTelp: '',
    alamat: ''
  })

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [verifyingUser, setVerifyingUser] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadUsers()
    const interval = setInterval(loadUsers, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Efek untuk membuka modal verifikasi jika datang dari notifikasi
  useEffect(() => {
    if (location.state?.verifyUserId && users.length > 0) {
      const userToVerify = users.find(u => u.id === location.state.verifyUserId)
      if (userToVerify) {
        handleOpenVerifyModal(userToVerify)
        // Clear state agar tidak terbuka lagi saat refresh
        window.history.replaceState({}, document.title)
      }
    }
  }, [location.state, users])

  const loadUsers = async () => {
    const data = await userService.getAllUsers()
    setUsers(data || [])
  }

  const handleOpenVerifyModal = (user) => {
    setVerifyingUser(user)
    setRejectReason('')
    setIsVerifyModalOpen(true)
  }

  const handleApprove = async () => {
    try {
      await userService.approveKtp(verifyingUser.id)
      toast.success('KTP berhasil disetujui')
      setIsVerifyModalOpen(false)
      loadUsers()
    } catch (error) {
      toast.error('Gagal menyetujui KTP')
    }
  }

  const handleReject = async () => {
    if (!rejectReason) return toast.error('Berikan alasan penolakan')
    try {
      await userService.rejectKtp(verifyingUser.id, rejectReason)
      toast.success('KTP telah ditolak')
      setIsVerifyModalOpen(false)
      loadUsers()
    } catch (error) {
      toast.error('Gagal menolak KTP')
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        password: '', // Don't show existing password
        role: user.role,
        nama: user.profile?.nama || '',
        noTelp: user.profile?.noTelp || '',
        alamat: user.profile?.alamat || ''
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: '',
        password: '',
        role: 'buyer',
        nama: '',
        noTelp: '',
        alamat: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Update existing user
        const updates = {
          email: formData.email,
          role: formData.role,
          profile: {
            ...editingUser.profile,
            nama: formData.nama,
            noTelp: formData.noTelp,
            alamat: formData.alamat
          }
        }
        
        if (formData.password) {
          updates.password = formData.password
        }
        
        userService.updateUser(editingUser.id, updates)
        toast.success('User berhasil diupdate')
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password wajib diisi untuk user baru')
          return
        }
        
        userService.createUser({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profile: {
            nama: formData.nama,
            noTelp: formData.noTelp,
            alamat: formData.alamat
          }
        })
        toast.success('User baru berhasil ditambahkan')
      }
      
      loadUsers()
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = (id, email) => {
    // Prevent deleting the last admin
    const adminCount = users.filter(u => u.role === 'admin').length
    const userToDelete = users.find(u => u.id === id)
    
    if (userToDelete.role === 'admin' && adminCount <= 1) {
      toast.error('Tidak dapat menghapus admin terakhir')
      return
    }

    if (window.confirm(`Yakin mau hapus user "${email}"?`)) {
      try {
        userService.deleteUser(id)
        toast.success('User berhasil dihapus')
        loadUsers()
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      seller: 'bg-blue-100 text-blue-700 border-blue-200',
      buyer: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${styles[role] || styles.buyer}`}>
        {role}
      </span>
    )
  }

  const columns = [
    {
      header: 'User',
      accessor: 'nama',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 shrink-0">
            {row.profile?.nama?.charAt(0).toUpperCase() || row.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.profile?.nama || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => getRoleBadge(row.role)
    },
    {
      header: 'Location',
      accessor: 'lokasi',
      render: (row) => <span className="text-gray-600 capitalize">{row.profile?.lokasi?.replace('-', ' ') || '-'}</span>
    },
    {
      header: 'Joined Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-gray-600">{formatDate(row.createdAt)}</span>
    },
    {
      header: 'KTP Status',
      accessor: 'ktp_status',
      render: (row) => {
        // Jika tidak ada path atau status, berarti belum upload
        if (!row.ktp_path || !row.ktp_status) {
          return <span className="text-gray-400 text-xs italic">Belum Upload</span>
        }
        
        const statusStyles = {
          pending: 'bg-amber-100 text-amber-700 border-amber-200',
          verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          rejected: 'bg-rose-100 text-rose-700 border-rose-200'
        }

        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase text-center ${statusStyles[row.ktp_status]}`}>
              {row.ktp_status}
            </span>
            {row.ktp_status === 'pending' && (
              <button 
                onClick={() => handleOpenVerifyModal(row)}
                className="text-[10px] font-bold text-primary-600 hover:underline"
              >
                Cek Verifikasi
              </button>
            )}
          </div>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.id, row.email)}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Management</h1>
        <p className="text-gray-500 mt-1">Manage all registered buyers, sellers, and admins.</p>
      </div>

      <DataTable 
        title="All Users"
        columns={columns}
        data={users}
        onAdd={() => handleOpenModal()}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingUser && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
            <input
              type="tel"
              value={formData.noTelp}
              onChange={(e) => setFormData({...formData, noTelp: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal Verifikasi KTP */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Detail Verifikasi KTP"
      >
        {verifyingUser && (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-xl overflow-hidden border bg-gray-100">
              <img 
                src={`${import.meta.env.VITE_API_URL}/storage/${verifyingUser.ktp_path}`}
                alt="KTP"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">NIK</p>
                <p className="font-bold text-gray-900">{verifyingUser.ktp_nik || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Nama Sesuai KTP</p>
                <p className="font-bold text-gray-900">{verifyingUser.ktp_name || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Tempat Lahir</p>
                <p className="font-bold text-gray-900">{verifyingUser.ktp_birth_place || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Tanggal Lahir</p>
                <p className="font-bold text-gray-900">{verifyingUser.ktp_birth_date || '-'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Alasan Penolakan (Jika ditolak)</label>
              <textarea 
                placeholder="Contoh: Foto KTP kurang jelas atau buram"
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleReject}
                className="flex-1 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-all border border-rose-200"
              >
                Tolak Verifikasi
              </button>
              <button 
                onClick={handleApprove}
                className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
              >
                Terima Verifikasi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default UsersList
