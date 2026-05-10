import { Bell, Search, User as UserIcon, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { userService } from '../../services/userService'

const AdminHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [pendingVerifications, setPendingVerifications] = useState([])

  useEffect(() => {
    fetchPendingVerifications()
    // Poll every 1 minute
    const interval = setInterval(fetchPendingVerifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingVerifications = async () => {
    try {
      const response = await userService.getAllUsers()
      const pending = response.filter(u => u.ktp_status === 'pending')
      setPendingVerifications(pending)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1 flex items-center">
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anywhere..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <Bell size={20} />
            {pendingVerifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">
                {pendingVerifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm">Notifikasi</h3>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {pendingVerifications.length} Baru
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {pendingVerifications.length > 0 ? (
                    pendingVerifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false)
                          navigate('/admin/users', { state: { verifyUserId: item.id } })
                        }}
                        className="w-full px-4 py-4 hover:bg-indigo-50/50 border-b border-gray-50 flex gap-3 text-left transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-200 transition-colors">
                          <UserIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">Permintaan Verifikasi KTP</p>
                          <p className="text-xs text-gray-500 truncate">{item.profile?.nama || item.email} menunggu tinjauan.</p>
                          <p className="text-[10px] text-indigo-600 font-bold mt-1">Klik untuk proses</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <Bell size={24} />
                      </div>
                      <p className="text-sm text-gray-500">Tidak ada notifikasi baru</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 bg-gray-50/50 text-center border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setShowNotifications(false)
                      navigate('/admin/users')
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-wider"
                  >
                    Lihat Semua User
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {user?.profile?.nama?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.profile?.nama || 'Admin'}</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-semibold text-gray-900">{user?.profile?.nama || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
