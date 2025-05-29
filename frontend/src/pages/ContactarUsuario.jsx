// Página temporal para contactar usuario
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

function ContactarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  // Obtener el id del usuario desde query param o state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Se espera que el id venga en location.state.userId
  const { id: userIdFromParams } = useParams();
  const params = new URLSearchParams(window.location.search);
  const userIdFromQuery = params.get('userId');
  const userId = userIdFromParams || location.state?.userId || userIdFromQuery || null;

  useEffect(() => {
    console.log('DEBUG ContactarUsuario: userIdFromParams=', userIdFromParams, 'location.state?.userId=', location.state?.userId, 'userIdFromQuery=', userIdFromQuery, 'userId=', userId);
    if (!userId) {
      setError('No se encontró el usuario. (No se proporcionó id en la URL)');
      setLoading(false);
      return;
    }
    api.get(`/api/usuarios/${userId}/`)
      .then(res => setUser(res.data))
      .catch(() => setError('No se pudo cargar el usuario.'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#10111a' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78, background: '#10111a', minHeight: '100vh' }}>
        {loading ? (
          <div style={{ color: '#fff', padding: 40 }}>Cargando...</div>
        ) : error ? (
          <div style={{ color: '#ff3b3b', padding: 40 }}>{error}</div>
        ) : user && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2.5rem 0 2.5rem' }}>
            {/* Header usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, background: 'none', marginBottom: 0 }}>
              <img src={user.foto || '/logo-pequeno.svg'} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.45rem' }}>{user.nombre} {user.apellido}</span>
                  <span style={{ background: '#21e058', color: '#fff', fontWeight: 600, fontSize: '0.98rem', borderRadius: 6, padding: '2px 10px', marginLeft: 2 }}>En línea</span>
                </div>
                <span style={{ color: '#babcc4', fontSize: '1.08rem', fontWeight: 500 }}>¡Bienvenido al chat!</span>
              </div>
            </div>
            {/* Espacio para el chat */}
            <div style={{ marginTop: 32, marginBottom: 0, background: '#e5e5e5', borderRadius: 24, minHeight: 340, height: 340, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {/* Aquí irá la ventana de chat de WhatsApp en el futuro */}
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: '#c6e7ff', color: '#222', fontWeight: 500, fontSize: '0.98rem', borderRadius: 6, padding: '2px 16px' }}>Hoy</div>
            </div>
            {/* Barra de mensaje (solo UI, sin lógica) */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'none', borderRadius: 24, marginTop: 0, padding: '0 0.5rem', width: '100%' }}>
              <input
                type="text"
                placeholder="Escribe un mensaje"
                style={{ flex: 1, background: '#fff', color: '#222', border: 'none', borderRadius: 24, padding: '1rem 1.2rem', fontSize: '1.08rem', margin: '18px 0', outline: 'none' }}
                disabled
              />
              <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'not-allowed' }} disabled>
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="19" cy="19" r="19" fill="#fff" />
                  <path d="M13 19L25 19" stroke="#21e058" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M21 15L25 19L21 23" stroke="#21e058" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {/* Botón Atrás */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                style={{ background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 2.2rem', cursor: 'pointer', transition: 'background 0.18s' }}
                onClick={() => navigate('/admin/users')}
              >
                Atrás
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactarUsuario;
