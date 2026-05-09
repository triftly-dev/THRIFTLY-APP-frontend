import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FullPageLoader from '../../components/common/FullPageLoader';

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Simpan token ke localStorage
            localStorage.setItem('auth_token', token);
            
            // Refresh halaman ke home/dashboard agar state Auth terupdate
            // Menggunakan window.location.href adalah cara termudah untuk merefresh seluruh state aplikasi
            window.location.href = '/';
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return <FullPageLoader message="Menyinkronkan akun Google Anda..." />;
};

export default LoginSuccess;
