import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, MapPin, Phone, Instagram, Twitter, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-auto hidden md:block">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group inline-flex">
              <div className="bg-primary-100 p-2 rounded-xl group-hover:bg-primary-200 transition-colors">
                <ShoppingBag className="text-primary-700" size={28} />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Thriftly</span>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-sm">
              Marketplace barang bekas terpercaya di Indonesia. Jual beli barang bekas jadi lebih mudah, aman, dan pastinya cuan!
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/triftlymarketplace" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-6 text-lg">Tentang</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">Tentang Thriftly</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-6 text-lg">Support</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-gray-600 hover:text-primary-600 transition-colors">Pusat Bantuan</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary-600 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-6 text-lg">Kontak</h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Jalan+Ungaran+Mulyoharjo+Pemalang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <MapPin size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Jalan Ungaran, Mulyoharjo, Pemalang, Central Java, 52312</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/6282242637028" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="text-primary-600 flex-shrink-0"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.604 6.04L0 24l6.104-1.603a11.846 11.846 0 005.94 1.583h.005c6.634 0 12.03-5.396 12.033-12.031a11.813 11.813 0 00-3.48-8.497z"/>
                  </svg>
                  <span className="text-sm font-medium tracking-wide">+62 822 4263 7028</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:triftlydev@gmail.com"
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Mail size={20} className="text-primary-600 flex-shrink-0" />
                  <span className="text-sm">triftlydev@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col justify-center items-center gap-4 text-center">
          <div className="flex space-x-6 text-sm text-gray-500 mb-2">
            <span>Pembayaran Aman</span>
            <span>Penjual Terverifikasi</span>
            <span>Pengiriman Cepat</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Thriftly Marketplace. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
