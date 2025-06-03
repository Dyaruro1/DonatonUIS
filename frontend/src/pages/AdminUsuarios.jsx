import React, { useEffect, useState, useContext } from "react";
import "./AdminUsuarios.css";
import { getAdminService, getTokenService } from '../core/config.js';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
// Añadido para obtener el usuario actual
import { AuthContext } from '../context/AuthContext';

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // Get services using dependency injection
  const adminService = getAdminService();
  const tokenService = getTokenService();

  // Actualiza el tiempo cada 30 segundos para refrescar el estado en línea
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    adminService.getAllUsers()
      .then(res => {
        // Normaliza el valor de is_active: si viene undefined/null, asume true (activo)
        const usuariosConActivo = res.data.map(u => ({
          ...u,
          is_active: u.is_active === undefined || u.is_active === null ? true : u.is_active
        }));
        setUsuarios(usuariosConActivo);
      })
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  }, [adminService]);

  // Filtrar usuarios para excluir al usuario actual y a admins/superusers
  const filteredUsuarios = usuarios.filter(user => {
    if (currentUser && user.id === currentUser.id) return false;
    if (user.is_staff || user.is_superuser) return false;
    return true;
  });

  // Considera en línea si el usuario actualizó su actividad en los últimos 2 minutos
  const isOnline = (lastActive) => {
    if (!lastActive) return false;
    const last = new Date(lastActive).getTime();
    return now - last < 2 * 60 * 1000;
  };

  // Solo UI: mostrar confirmación
  const handleShowConfirm = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };
  const handleCloseConfirm = () => {
    setShowConfirm(false);
    setSelectedUser(null);
  };

  // Bloquear/Desbloquear usuario (set is_active)
  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;
    const newStatus = !selectedUser.is_active;
    try {
      // Cambia el estado activo del usuario en backend
      await adminService.toggleUserStatusById(selectedUser.id, newStatus);
      // Actualiza el estado local
      setUsuarios(usuarios.map(u => u.id === selectedUser.id ? { ...u, is_active: newStatus } : u));
      setShowConfirm(false);
      setSelectedUser(null);
    } catch (err) {
      setError(`No se pudo ${newStatus ? 'desbloquear' : 'bloquear'} el usuario. Intenta de nuevo.`);
      setShowConfirm(false);
      setSelectedUser(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#18192b' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78 }}>
        <div className="admin-usuarios-container">
          <h2 className="admin-usuarios-title">Usuarios activos</h2>
          {loading ? <div style={{color:'#fff'}}>Cargando...</div> : error ? <div style={{color:'#ff6b6b'}}>{error}</div> : (
          <table className="admin-usuarios-table">
            <thead>
              <tr>
                <th><input type="checkbox" disabled /></th>
                <th>Lista de usuarios</th>
                <th>Última vez activo</th>
                <th>Estado conexión</th>
                <th>Estado cuenta</th>
                <th>Contactar</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map(u => (
                <tr key={u.id}>
                  <td><input type="checkbox" /></td>
                  <td style={{display:'flex',alignItems:'center',gap:12}}>
                    <img src={u.foto || '/logo-pequeno.svg'} alt="avatar" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',background:'#23233a'}} />
                    <span style={{fontWeight:600, cursor:'pointer', color:'#21e058'}} onClick={()=>navigate(`/admin/users/${u.id}`)}>{u.nombre} {u.apellido}</span>
                  </td>
                  <td>{u.last_active ? new Date(u.last_active).toLocaleDateString() === new Date().toLocaleDateString() ? 'Hoy' : new Date(u.last_active).toLocaleDateString() : 'Desconocido'}</td>
                  <td>
                    <span style={{background:isOnline(u.last_active)?"#21e058":"#babcc4",color:isOnline(u.last_active)?"#fff":"#23233a",padding:'4px 16px',borderRadius:8,fontWeight:600}}>
                      {isOnline(u.last_active) ? "En línea" : "Desconectado"}
                    </span>
                  </td>
                  <td>
                    <span style={{background:u.is_active?"#21e058":"#ff6b6b",color:"#fff",padding:'4px 16px',borderRadius:8,fontWeight:600}}>
                      {u.is_active ? "Activo" : "Bloqueado"}
                    </span>
                  </td>
                  <td>
                    <button 
                      style={{background:'none',color:'#21e058',border:'none',fontWeight:600,cursor:'pointer'}}
                      onClick={() => window.location.href = `/admin/contactar-usuario/${u.id}`}
                    >
                      Contactar usuario
                    </button>
                  </td>
                  <td>
                    <button onClick={()=>handleShowConfirm(u)} className="admin-block-btn" title={u.is_active ? "Bloquear usuario" : "Desbloquear usuario"}>
                      {u.is_active ? (
                        // Icono desbloquear (verde)
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="6" y="12" width="16" height="10" rx="3" fill="#23233a" stroke="#21e058" strokeWidth="2"/>
                          <path d="M9 12V9a5 5 0 0 1 10 0v2" stroke="#21e058" strokeWidth="2" fill="none"/>
                          <circle cx="14" cy="18" r="2" fill="#21e058" />
                        </svg>
                      ) : (
                        // Icono bloquear (rojo)
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="6" y="12" width="16" height="10" rx="3" fill="#23233a" stroke="#ff6b6b" strokeWidth="2"/>
                          <path d="M9 12V9a5 5 0 0 1 10 0v3" stroke="#ff6b6b" strokeWidth="2" fill="none"/>
                          <circle cx="14" cy="18" r="2" fill="#ff6b6b" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {/* Modal de confirmación de bloqueo/desbloqueo */}
          {showConfirm && (
            <>
              <div style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(24,25,43,0.55)',
                backdropFilter: 'blur(6px)',
                zIndex: 100,
              }} onClick={handleCloseConfirm}></div>
              <div style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 101,
              }}>
                <div style={{
                  background: '#23233a',
                  borderRadius: 24,
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
                    {selectedUser?.is_active
                      ? `¿Seguro que deseas bloquear a ${selectedUser?.nombre} ${selectedUser?.apellido}?`
                      : `¿Seguro que deseas desbloquear a ${selectedUser?.nombre} ${selectedUser?.apellido}?`
                    }
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                    {selectedUser?.is_active
                      ? "Esta acción impedirá que el usuario acceda a la plataforma hasta que sea desbloqueado."
                      : "Esta acción permitirá que el usuario vuelva a acceder a la plataforma."
                    }
                  </div>
                  <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                    <button
                      style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                      onClick={handleCloseConfirm}
                    >
                      Cancelar
                    </button>
                    <button
                      style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                      onClick={handleToggleUserStatus}
                    >
                      {selectedUser?.is_active ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsuariosAdmin;