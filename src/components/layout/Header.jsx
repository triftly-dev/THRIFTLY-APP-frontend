import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag, User, LogOut, MessageCircle, Package, Search, AlertCircle, Settings, HelpCircle, Bell, ShieldCheck } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { BUTTONS, PLACEHOLDERS } from '../../constants/copywriting'

const Header = () => {
  const navigate = useNavigate()
  const { user, logout, isSeller, isBuyer, isAdmin, viewMode, toggleViewMode } = useAuth()
  const { unreadCount } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleToggleMode = () => {
    toggleViewMode()
    if (viewMode === 'seller') {
      navigate('/user/dashboard')
    } else {
      navigate('/toko/dashboard')
    }
  }

  return (
    <header className="bg-white shadow-soft sticky top-0 z-40 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
            <div className="bg-primary-50 p-1.5 md:p-2 rounded-xl group-hover:bg-primary-100 transition-colors">
              <ShoppingBag className="text-primary-600 w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Thriftly</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={PLACEHOLDERS.search}
                className="w-full pl-5 pr-12 py-3 bg-gray-50 border-none rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-inner"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              {user?.ktp_status === 'rejected' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Messages */}
            <Link to="/messages" className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
              <MessageCircle size={20} />
            </Link>
            
            {!user && (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{BUTTONS.login}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{BUTTONS.register}</Button>
                </Link>
              </div>
            )}

            {user && (
              <>
                {isSeller && (
                  <>
                    {/* Link Khusus Toko / Penjual */}
                    <Link to="/toko/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                      Toko Saya
                    </Link>
                    <Link to="/toko/produk/tambah">
                      <Button size="sm">{BUTTONS.sell}</Button>
                    </Link>
                  </>
                )}

                {isBuyer && (
                  <>
                    {/* Link Khusus Pembeli */}
                    <Link to="/user/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors ml-4">
                      Dasbor Belanja
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                      Admin Panel
                    </Link>
                  </>
                )}

                {(isSeller || isBuyer) && (
                  <div className="flex items-center gap-4">
                    {/* Bell Notification */}
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative cursor-pointer hover:text-primary-600 transition-colors text-gray-600"
                    >
                      <Bell size={22} />
                      {user?.ktp_status === 'rejected' && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </button>

                    {/* Chat */}
                    <Link to="/chat" className="relative cursor-pointer hover:text-primary-600 transition-colors text-gray-600">
                      <MessageCircle size={22} />
                      {unreadCount > 0 && (
                        <Badge variant="accent" size="sm" className="absolute -top-2 -right-2 px-1.5 min-w-[20px]">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </div>
                )}

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute top-16 right-20 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-gray-50">
                      <h4 className="font-bold text-gray-900">Notifikasi</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {user?.ktp_status === 'rejected' ? (
                        <Link 
                          to="/profile" 
                          onClick={() => setShowNotifications(false)}
                          className="flex gap-4 p-4 hover:bg-gray-50 transition-colors border-l-4 border-l-red-500"
                        >
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">Verifikasi KTP Ditolak</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {user.ktp_rejection_reason || 'Klik untuk melihat alasan dan kirim ulang.'}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm text-gray-500">Tidak ada notifikasi baru</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleToggleMode}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                      viewMode === 'seller' 
                        ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Beralih ke Mode {viewMode === 'buyer' ? 'Toko' : 'Belanja'}
                  </button>

                  <div className="relative pl-4 border-l border-gray-200" ref={userMenuRef}>
                    <div className="relative group">
                      <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all outline-none">
                        {user?.avatar ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL}/storage/${user.avatar.startsWith('avatars/') ? user.avatar : `avatars/${user.avatar}`}`} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                            <User size={18} />
                          </div>
                        )}
                      </button>

                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <Settings size={16} />
                          <span>Pengaturan Akun</span>
                        </Link>
                        <Link 
                          to="/help" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <HelpCircle size={16} />
                          <span>Pusat Bantuan</span>
                        </Link>
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            <span>Keluar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Search size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={PLACEHOLDERS.search}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
