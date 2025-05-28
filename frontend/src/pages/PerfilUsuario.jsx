import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './PerfilUsuario.css';

const initialUser = {
  nombre: '',
  apellido: '',
  descripcion: '',
  sexo: '',
  fechaNacimiento: { dia: '', mes: '', anio: '' },
  telefono: '',
  correo: '',
  contacto1: '',
  contacto2: '',
  foto: '',
};

function PerfilUsuario() {
  const { currentUser, loading, error, updateProfile, cambiarContrasena } = useContext(AuthContext);
  const [user, setUser] = useState(initialUser);
  const [foto, setFoto] = useState(user.foto);
  const navigate = useNavigate();

  // Para el demo, los campos estarán deshabilitados
  const [editable, setEditable] = useState(false);

  // Estado para mostrar el formulario de cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Estado para mostrar/ocultar contraseñas
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Estado para mostrar el modal de confirmación de cierre de sesión
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Estado para carga y error
  const [loadingState, setLoading] = useState(true);
  const [errorState, setError] = useState('');

  // Sincronizar datos del usuario del contexto al estado local
  useEffect(() => {
    if (currentUser) {
      // Normaliza sexo a mayúscula inicial para el select
      let sexo = currentUser.sexo || '';
      if (sexo) {
        sexo = sexo.charAt(0).toUpperCase() + sexo.slice(1).toLowerCase();
      }
      // Normaliza año a string (por si acaso)
      let fechaNacimiento = { dia: '', mes: '', anio: '' };
      if (currentUser.fecha_nacimiento) {
        const partes = currentUser.fecha_nacimiento.split('-');
        fechaNacimiento = {
          dia: partes.length > 2 ? partes[2] : '',
          mes: partes.length > 1 ? partes[1] : '',
          anio: partes.length > 0 ? String(partes[0]) : '',
        };
      }
      setUser({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        descripcion: currentUser.descripcion || '',
        sexo: sexo,
        fechaNacimiento: fechaNacimiento,
        telefono: currentUser.telefono || '',
        correo: currentUser.correo || '',
        contacto1: currentUser.contacto1 || '',
        contacto2: currentUser.contacto2 || '',
        foto: currentUser.foto || '/fondo-uis.jpg',
      });
      setFoto(currentUser.foto || '/fondo-uis.jpg');
    }
  }, [currentUser]);

  // Cambia la foto
  const handleFoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageURL = URL.createObjectURL(e.target.files[0]);
      setFoto(imageURL);
    }
  };

  // Maneja cambios en los campos de usuario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('fechaNacimiento.')) {
      const field = name.split('.')[1];
      setUser((prev) => ({
        ...prev,
        fechaNacimiento: { ...prev.fechaNacimiento, [field]: value },
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Maneja cancelar edición
  const handleCancel = () => {
    if (currentUser) {
      setUser({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        descripcion: currentUser.descripcion || '',
        sexo: currentUser.sexo || '',
        fechaNacimiento: currentUser.fecha_nacimiento ? {
          dia: currentUser.fecha_nacimiento.split('-')[2],
          mes: currentUser.fecha_nacimiento.split('-')[1],
          anio: currentUser.fecha_nacimiento.split('-')[0],
        } : { dia: '', mes: '', anio: '' },
        telefono: currentUser.telefono || '',
        correo: currentUser.correo || '',
        contacto1: currentUser.contacto1 || '',
        contacto2: currentUser.contacto2 || '',
        foto: currentUser.foto || '/fondo-uis.jpg',
      });
      setFoto(currentUser.foto || '/fondo-uis.jpg');
    }
    setEditable(false);
  };

  // Maneja guardar cambios (actualiza el perfil en backend y contexto)
  const handleSave = async () => {
    try {
      let formData = new FormData();
      formData.append('nombre', user.nombre);
      formData.append('apellido', user.apellido);
      formData.append('descripcion', user.descripcion);
      formData.append('sexo', user.sexo ? user.sexo.toLowerCase() : '');
      // Solo enviar fecha_nacimiento si todos los campos están completos
      const { anio, mes, dia } = user.fechaNacimiento;
      if (anio && mes && dia) {
        formData.append('fecha_nacimiento', `${anio}-${mes}-${dia}`);
      }
      formData.append('telefono', user.telefono);
      formData.append('correo', user.correo);
      formData.append('contacto1', user.contacto1);
      formData.append('contacto2', user.contacto2);
      if (foto && foto !== currentUser.foto && foto.startsWith('blob:')) {
        // Si la foto es nueva (blob), buscar el input file
        const fileInput = document.getElementById('foto-input');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          formData.append('foto', fileInput.files[0]);
        }
      }
      await updateProfile(formData);
      setEditable(false);
    } catch (err) {
      // Mostrar el error de validación exacto en consola
      console.error('Perfil save error', err.response?.data);
      alert('No se pudo guardar el perfil. Revisa la consola para más detalles.');
    }
  };

  // Lógica para cambiar la contraseña (ahora sí llama a la API)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    const result = await cambiarContrasena(currentPassword, newPassword);
    if (result.success) {
      setPasswordSuccess('¡Contraseña cambiada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordForm(false), 1200);
    } else {
      setPasswordError(result.error || 'No se pudo cambiar la contraseña.');
    }
  };

  // Se mantiene navegación arriba
  const currentYear = new Date().getFullYear();
  return (
    <div className="perfil-root">
      {/* MODAL DE CONFIRMACIÓN LOGOUT */}
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
      {/* NAVBAR HORIZONTAL */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', marginTop: '1.5rem', width: '100%', zIndex: 10 }}>
        <button className={`feed-navbar-btn${window.location.pathname === '/feed' || window.location.pathname === '/' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/feed')}>
          <span className="feed-navbar-icon">🧺</span>
          <span className="feed-navbar-label">Prendas</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/donar' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/donar')}>
          <span className="feed-navbar-icon">🤲</span>
          <span className="feed-navbar-label">Donar</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/perfil' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/perfil')}>
          <span className="feed-navbar-icon">👤</span>
          <span className="feed-navbar-label">Perfil</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/ajustes' ? ' feed-navbar-btn-active' : ''}`} onClick={() => navigate('/ajustes')}>
          <span className="feed-navbar-icon">⚙️</span>
          <span className="feed-navbar-label">Configuración</span>
        </button>
        <button
          className="feed-navbar-btn feed-navbar-btn-logout"
          style={{
            background: 'transparent',
            color: '#ff6b6b',
            border: 'none',
            borderRadius: '50%',
            padding: '0.7rem',
            fontWeight: 600,
            fontSize: '1.55rem',
            marginLeft: '2.5rem',
            marginRight: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.18s, color 0.18s',
            width: 48,
            height: 48,
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#ff6b6b22'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff6b6b'; }}
          onClick={() => setShowLogoutModal(true)}
          type="button"
          title="Cerrar sesión"
        >
          <i className="fa fa-sign-out-alt" style={{ fontSize: 28 }}></i>
        </button>
      </div>

      {/* BOTÓN EDITAR PERFIL */}
      <button
        className="perfil-btn-editar"
        style={{
          marginBottom: '1.5rem',
          display: editable ? 'none' : 'block',
          background: 'linear-gradient(90deg, #21E058 0%, #1ed760 100%)',
          color: '#18192b',
          fontWeight: 700,
          fontSize: '1.13rem',
          border: 'none',
          borderRadius: 10,
          padding: '1rem 2.8rem',
          boxShadow: '0 2px 12px #21e05830',
          cursor: 'pointer',
          letterSpacing: '0.5px',
          transition: 'background 0.18s, color 0.18s',
          outline: 'none',
        }}
        onClick={() => setEditable(true)}
      >
        ✏️ Editar perfil
      </button>
      <div className="perfil-espaciado">
        {/* FOTO DE PERFIL */}
        <div className="perfil-foto-col">
          <div className="perfil-foto-wrapper">
            <img src={foto} alt="Foto de perfil" className="perfil-foto" />
            {editable && (
              <>
                <input id="foto-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
                <label htmlFor="foto-input" className="perfil-editar-foto" style={{
                  position: 'static',
                  display: 'block',
                  margin: '0.7rem auto 0 auto',
                  color: '#21E058',
                  background: 'none',
                  fontWeight: 600,
                  fontSize: '1.08rem',
                  textAlign: 'center',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  width: 'fit-content',
                }}>
                  Editar foto
                </label>
              </>
            )}
          </div>
        </div>

        {/* DATOS PERFIL */}
        <div className="perfil-user-section">
          <div className="perfil-user-cards-row">
            <div className="perfil-card perfil-card-lg">
              <label className="perfil-label">Nombres</label>
              <input className="perfil-input" name="nombre" value={user.nombre || ''} placeholder="Nombres" disabled={!editable} onChange={handleInputChange} />
              <label className="perfil-label">Apellidos</label>
              <input className="perfil-input" name="apellido" value={user.apellido || ''} placeholder="Apellidos" disabled={!editable} onChange={handleInputChange} />
              <label className="perfil-label">Descripción</label>
              <input className="perfil-input" name="descripcion" value={user.descripcion || ''} placeholder="Descripción" maxLength={60} disabled={!editable} onChange={handleInputChange} />
              <span className="perfil-charcount">{(user.descripcion || '').length} / 60 caracteres</span>
            </div>
            <div className="perfil-card perfil-card-md">
              <label className="perfil-label">Sexo</label>
              <select className="perfil-input" name="sexo" value={user.sexo || ''} disabled={!editable} onChange={handleInputChange}>
                <option value="">Selecciona sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <label className="perfil-label">Fecha de nacimiento</label>
              <div className="perfil-fecha-row">
                <select className="perfil-input perfil-fecha" name="fechaNacimiento.dia" value={user.fechaNacimiento.dia || ''} disabled={!editable} onChange={handleInputChange}>
                  <option value="">Día</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i+1} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="perfil-fecha-sep">-</span>
                <select className="perfil-input perfil-fecha" name="fechaNacimiento.mes" value={user.fechaNacimiento.mes || ''} disabled={!editable} onChange={handleInputChange}>
                  <option value="">Mes</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="perfil-fecha-sep">-</span>
                <select className="perfil-input perfil-fecha perfil-fecha-anio" name="fechaNacimiento.anio" value={user.fechaNacimiento.anio || ''} disabled={!editable} onChange={handleInputChange}>
                  <option value="">Año</option>
                  {Array.from({length: 80}, (_, i) => String(currentYear - i)).map(anio => (
                    <option key={anio} value={anio}>{anio}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMACION DE CONTACTO */}
      <div className="perfil-contacto-section">
        <h2 className="perfil-seccion-titulo">Información de contacto</h2>
        <div className="perfil-contacto-cards-row">
          <div className="perfil-card perfil-card-contacto">
            <label className="perfil-label">Teléfono</label>
            <input className="perfil-input" name="telefono" value={user.telefono || ''} placeholder="3183749230" disabled={!editable} onChange={handleInputChange} />
            <label className="perfil-label">Otra forma de contacto</label>
            <input className="perfil-input" name="contacto1" value={user.contacto1 || ''} placeholder="Otra forma de contacto" disabled={!editable} onChange={handleInputChange} />
          </div>
          <div className="perfil-card perfil-card-contacto">
            <label className="perfil-label">Correo electrónico</label>
            <input className="perfil-input" name="correo" value={user.correo || ''} placeholder="danielestebanyaruro@gmail.com" disabled /* siempre deshabilitado */ onChange={handleInputChange} />
            <label className="perfil-label">Otra forma de contacto</label>
            <input className="perfil-input" name="contacto2" value={user.contacto2 || ''} placeholder="Otra forma de contacto" disabled={!editable} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* BOTÓN CAMBIAR CONTRASEÑA FIJO (si NO está en edición) */}
      {!editable && (
        <button
          className="perfil-btn-cambiar-fijo"
          style={{
            position: 'fixed',
            left: 32,
            bottom: 32,
            background: '#0d1b36',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.08rem',
            border: 'none',
            borderRadius: 8,
            padding: '0.7rem 2.5rem',
            zIndex: 120,
            boxShadow: '0 2px 12px #0003',
            cursor: 'pointer',
          }}
          onClick={() => setShowPasswordForm(true)}
          type="button"
        >
          Cambiar contraseña
        </button>
      )}

      {/* BOTONES FLOTANTES SOLO EN EDICIÓN */}
      {editable && (
        <div className="perfil-botones-barra-fija" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#18192b', padding: '1.2rem 2.5rem 1.2rem 2.5rem', position: 'fixed', left: 0, bottom: 0, width: '100vw', zIndex: 100 }}>
          <button
            className="perfil-btn-cancelar"
            style={{ background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.7rem 2.5rem', marginRight: 16, cursor: 'pointer' }}
            onClick={handleCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="perfil-btn-guardar"
            style={{ background: '#21E058', color: '#fff', fontWeight: 700, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.7rem 2.5rem', marginLeft: 0, cursor: 'pointer' }}
            onClick={handleSave}
            type="button"
          >
            Guardar
          </button>
        </div>
      )}

      {/* FORMULARIO CAMBIO DE CONTRASEÑA */}
      {showPasswordForm && (
        <>
          {/* Fondo borroso */}
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
          }}></div>
          {/* Modal de cambio de contraseña */}
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
            <form onSubmit={handlePasswordChange} style={{
              background: '#23233a',
              borderRadius: 24,
              boxShadow: '0 2px 32px 0 #0004',
              padding: '2.5rem 2.8rem 2.2rem 2.8rem',
              minWidth: 370,
              maxWidth: 420,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.3rem',
              alignItems: 'center',
            }}>
              <h2 style={{ color: '#fff', fontWeight: 600, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>Cambiar contraseña</h2>
              <div style={{ width: '100%' }}>
                <label style={{ color: '#fff', fontWeight: 500, fontSize: '1.08rem', marginBottom: 6 }}>Contraseña anterior</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Contraseña anterior"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ background: '#191a2e', color: '#fff', border: 'none', borderRadius: 10, padding: '1rem 3.2rem 1rem 1.1rem', fontSize: '1.08rem', width: '100%' }}
                    autoFocus
                  />
                  <span
                    onClick={() => setShowCurrent(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#babcc4', fontSize: 22 }}
                    tabIndex={0}
                    role="button"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showCurrent ? (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#babcc4" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="#babcc4" strokeWidth="2"/></svg>
                    ) : (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22" stroke="#babcc4" strokeWidth="2"/></svg>
                    )}
                  </span>
                </div>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ color: '#fff', fontWeight: 500, fontSize: '1.08rem', marginBottom: 6 }}>Contraseña nueva</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Contraseña nueva"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ background: '#191a2e', color: '#fff', border: 'none', borderRadius: 10, padding: '1rem 3.2rem 1rem 1.1rem', fontSize: '1.08rem', width: '100%' }}
                  />
                  <span
                    onClick={() => setShowNew(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#babcc4', fontSize: 22 }}
                    tabIndex={0}
                    role="button"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showNew ? (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#babcc4" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="#babcc4" strokeWidth="2"/></svg>
                    ) : (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22" stroke="#babcc4" strokeWidth="2"/></svg>
                    )}
                  </span>
                </div>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ color: '#fff', fontWeight: 500, fontSize: '1.08rem', marginBottom: 6 }}>Repetir contraseña nueva</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repetir contraseña nueva"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ background: '#191a2e', color: '#fff', border: 'none', borderRadius: 10, padding: '1rem 3.2rem 1rem 1.1rem', fontSize: '1.08rem', width: '100%' }}
                  />
                  <span
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#babcc4', fontSize: 22 }}
                    tabIndex={0}
                    role="button"
                    aria-label="Mostrar/ocultar contraseña"
                  >
                    {showConfirm ? (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#babcc4" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="#babcc4" strokeWidth="2"/></svg>
                    ) : (
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22" stroke="#babcc4" strokeWidth="2"/></svg>
                    )}
                  </span>
                </div>
              </div>
              {passwordError && <div style={{ color: '#ff6b6b', fontSize: '0.98rem', marginTop: 2, width: '100%', textAlign: 'center' }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ color: '#21E058', fontSize: '0.98rem', marginTop: 2, width: '100%', textAlign: 'center' }}>{passwordSuccess}</div>}
              <div style={{ display: 'flex', gap: 18, width: '100%', marginTop: 10, justifyContent: 'center' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                >
                  Cambiar contraseña
                </button>
                <button
                  type="button"
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default PerfilUsuario;
