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

  // Gradiente sutil y sombra para la barra
  return (
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
    }}>
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
  );
}
