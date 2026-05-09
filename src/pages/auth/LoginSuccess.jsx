import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FullPageLoader from '../../components/common/FullPageLoader';

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Gunakan key 'token' (sesuai AuthContext)
            localStorage.setItem('token', token);
            
            // Hapus profil lama agar AuthContext terpaksa mengambil yang baru
            localStorage.removeItem('user_profile');
            
            // Redirect
            window.location.href = '/';
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return <FullPageLoader message="Menyinkronkan akun Google Anda..." />;
};

export default LoginSuccess;
