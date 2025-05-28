import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const sidebarBtnStyle = {
  background: 'none',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  marginBottom: 8,
  borderRadius: 14,
  transition: 'background 0.18s, box-shadow 0.18s, transform 0.13s',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'none',
};

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;
  const [hovered, setHovered] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Gradiente sutil y sombra para la barra
  return (
    <>
      <div style={{
        width: 78,
        background: 'linear-gradient(180deg, #191a2e 80%, #23244a 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 28,
        gap: 38,
        borderRight: '2px solid #23233a',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        boxShadow: '4px 0 24px 0 #0004',
        borderTopRightRadius: 22,
        borderBottomRightRadius: 22,
        transition: 'box-shadow 0.18s',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Dashboard/Home */}
          <button
            onClick={()=>navigate('/admin')}
            style={{
              ...sidebarBtnStyle,
              background: current==='/admin' ? 'rgba(33,224,88,0.13)' : hovered==='home' ? 'rgba(110,210,87,0.10)' : 'none',
              boxShadow: current==='/admin' || hovered==='home' ? '0 2px 16px #21e05833' : 'none',
              transform: hovered==='home' || current==='/admin' ? 'scale(1.08)' : 'scale(1)',
            }}
            onMouseEnter={()=>setHovered('home')}
            onMouseLeave={()=>setHovered('')}
            aria-label="Panel principal"
          >
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="10" height="10" rx="2" fill={current==='/admin'?"#21e058":hovered==='home'?"#7ee787":"#6c63ff"}/>
              <rect x="8" y="26" width="10" height="10" rx="2" fill={current==='/admin'?"#21e058":hovered==='home'?"#7ee787":"#6c63ff"}/>
              <rect x="26" y="8" width="10" height="10" rx="2" fill={current==='/admin'?"#21e058":hovered==='home'?"#7ee787":"#6c63ff"}/>
              <rect x="26" y="26" width="10" height="10" rx="2" fill={current==='/admin'?"#21e058":hovered==='home'?"#7ee787":"#6c63ff"}/>
            </svg>
          </button>
          {/* Perfil Admin */}
          <button
            onClick={()=>navigate('/admin/perfil-admin')}
            style={{
              ...sidebarBtnStyle,
              background: current.startsWith('/admin/perfil-admin') ? 'rgba(33,224,88,0.13)' : hovered==='perfil' ? 'rgba(110,210,87,0.10)' : 'none',
              boxShadow: current.startsWith('/admin/perfil-admin') || hovered==='perfil' ? '0 2px 16px #21e05833' : 'none',
              transform: hovered==='perfil' || current.startsWith('/admin/perfil-admin') ? 'scale(1.08)' : 'scale(1)',
            }}
            onMouseEnter={()=>setHovered('perfil')}
            onMouseLeave={()=>setHovered('')}
            aria-label="Perfil administrador"
          >
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="15" r="8" stroke={current.startsWith('/admin/perfil-admin')?"#21e058":hovered==='perfil'?"#7ee787":"#babcc4"} strokeWidth="3" fill="none"/>
              <ellipse cx="22" cy="32" rx="12" ry="7" stroke={current.startsWith('/admin/perfil-admin')?"#21e058":hovered==='perfil'?"#7ee787":"#babcc4"} strokeWidth="3" fill="none"/>
            </svg>
          </button>
          {/* Configuración Admin */}
          <button
            onClick={()=>navigate('/admin/configuracion')}
            style={{
              ...sidebarBtnStyle,
              background: current.startsWith('/admin/configuracion') ? 'rgba(33,224,88,0.13)' : hovered==='config' ? 'rgba(110,210,87,0.10)' : 'none',
              boxShadow: current.startsWith('/admin/configuracion') || hovered==='config' ? '0 2px 16px #21e05833' : 'none',
              transform: hovered==='config' || current.startsWith('/admin/configuracion') ? 'scale(1.08)' : 'scale(1)',
            }}
            onMouseEnter={()=>setHovered('config')}
            onMouseLeave={()=>setHovered('')}
            aria-label="Configuración administrador"
          >
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="16" stroke={current.startsWith('/admin/configuracion')?"#21e058":hovered==='config'?"#7ee787":"#babcc4"} strokeWidth="3" fill="none"/>
              <path d="M22 16v4M22 24v4M16 22h4M24 22h4" stroke={current.startsWith('/admin/configuracion')?"#21e058":hovered==='config'?"#7ee787":"#babcc4"} strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Botón cerrar sesión abajo */}
        <div style={{ width: '100%', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              ...sidebarBtnStyle,
              background: hovered==='logout' ? '#8b1e1e' : 'none',
              boxShadow: hovered==='logout' ? '0 2px 16px #8b1e1e55' : 'none',
              transform: hovered==='logout' ? 'scale(1.08)' : 'scale(1)',
              marginBottom: 0,
              marginTop: 10,
              borderRadius: 14,
              transition: 'background 0.18s, box-shadow 0.18s, transform 0.13s',
            }}
            onMouseEnter={()=>setHovered('logout')}
            onMouseLeave={()=>setHovered('')}
            aria-label="Cerrar sesión"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M17.5 9V7.5C17.5 6.11929 16.3807 5 15 5H7.5C6.11929 5 5 6.11929 5 7.5V20.5C5 21.8807 6.11929 23 7.5 23H15C16.3807 23 17.5 21.8807 17.5 20.5V19" stroke={hovered==='logout' ? '#fff' : '#ff3b3b'} strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M23 14L17.5 9V12.5H11V15.5H17.5V19L23 14Z" fill={hovered==='logout' ? '#fff' : '#ff3b3b'} />
            </svg>
          </button>
        </div>
      </div>
      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
          }}></div>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 201,
          }}>
            <div style={{
              background: '#23233a',
              borderRadius: 18,
              boxShadow: '0 2px 32px 0 #0004',
              padding: '2.2rem 2.5rem 2rem 2.5rem',
              minWidth: 340,
              maxWidth: 400,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ff3b3b', fontWeight: 700, fontSize: '1.18rem', marginBottom: 10 }}>
                ¿Seguro que deseas cerrar sesión?
              </div>
              <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                Se cerrará tu sesión y perderás el acceso temporal a tu cuenta. Puedes volver a iniciar sesión cuando lo necesites.
              </div>
              <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                <button
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  Sí
                </button>
                <button
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => setShowLogoutModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
