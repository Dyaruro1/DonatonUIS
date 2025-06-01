import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import './PerfilUsuario.css';

const initialUser = {
  nombre: '',
  apellido: '',
  descripcion: '',
  telefono: '',
  correo: '',
  foto: '',
};

function PerfilAdmin() {
  const { currentUser, updateProfile, cambiarContrasena, refreshUser } = useContext(AuthContext);
  const [user, setUser] = useState(initialUser);
  const [foto, setFoto] = useState(user.foto);
  const [editable, setEditable] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUser({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        descripcion: currentUser.descripcion || '',
        telefono: currentUser.telefono || '',
        correo: currentUser.correo || '',
        contacto1: currentUser.contacto1 || '',
        contacto2: currentUser.contacto2 || '',
        foto: currentUser.foto || '/logo-pequeno.svg',
      });
      setFoto(currentUser.foto || '/logo-pequeno.svg');
    }
  }, [currentUser]);

  const handleFoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageURL = URL.createObjectURL(e.target.files[0]);
      setFoto(imageURL);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (currentUser) {
      setUser({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        descripcion: currentUser.descripcion || '',
        telefono: currentUser.telefono || '',
        correo: currentUser.correo || '',
        foto: currentUser.foto || '/logo-pequeno.svg',
      });
      setFoto(currentUser.foto || '/logo-pequeno.svg');
    }
    setEditable(false);
  };

  const handleSave = async () => {
    try {
      let formData = new FormData();
      formData.append('nombre', user.nombre);
      formData.append('apellido', user.apellido);
      formData.append('descripcion', user.descripcion);
      formData.append('telefono', user.telefono);
      formData.append('correo', user.correo);
      formData.append('contacto1', user.contacto1 || '');
      formData.append('contacto2', user.contacto2 || '');
      if (foto && foto !== currentUser.foto && foto.startsWith('blob:')) {
        const fileInput = document.getElementById('foto-admin-input');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          formData.append('foto', fileInput.files[0]);
        }
      }
      await updateProfile(formData);
      await refreshUser(); // Esto actualizará currentUser y disparará el useEffect de arriba
      setEditable(false);
    } catch (err) {
      alert('No se pudo guardar el perfil. Revisa la consola para más detalles.');
      console.error('Perfil admin save error', err.response?.data);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Completa todos los campos.');
      return;
    }
    if (newPassword.length < 8 || /^\s+$/.test(newPassword)) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres y no puede ser solo espacios.');
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

  return (
    <div className="perfil-root" style={{ display: 'flex', minHeight: '100vh', background: '#18192b' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78 }}>
        <div style={{ color: '#21e058', fontWeight: 700, fontSize: '2.1rem', margin: '2.2rem 0 1.5rem 0', textAlign: 'center' }}>Perfil del Administrador</div>
        {/* BOTÓN EDITAR PERFIL ARRIBA DE LA FOTO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
          <button
            className="perfil-btn-editar"
            style={{
              marginBottom: '1.2rem',
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
              display: editable ? 'none' : 'block',
            }}
            onClick={() => setEditable(true)}
          >
            ✏️ Editar perfil
          </button>
          {/* FOTO DE PERFIL */}
          <div className="perfil-foto-col">
            <div className="perfil-foto-wrapper">
              <img src={foto} alt="Foto de perfil" className="perfil-foto" />
            </div>
            {/* NOMBRE DE USUARIO DEBAJO DE LA FOTO */}
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', marginTop: 12, marginBottom: 0, textAlign: 'center' }}>
              {currentUser?.username}
            </div>
            {editable && (
              <>
                <input id="foto-admin-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
                <label htmlFor="foto-admin-input" className="perfil-editar-foto" style={{ display: 'block', margin: '0.7rem auto 0 auto', color: '#21E058', background: 'none', fontWeight: 600, fontSize: '1.08rem', textAlign: 'center', textDecoration: 'underline', cursor: 'pointer', width: 'fit-content', position: 'static' }}>
                  Editar foto
                </label>
              </>
            )}
          </div>
        </div>
        <div className="perfil-espaciado">
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
            </div>
          </div>
        </div>
        {/* INFORMACIÓN DE CONTACTO (como en usuario normal) */}
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
        {/* BOTONES FLOTANTES SOLO EN EDICIÓN */}
        {editable && (
          <div className="perfil-botones-barra-fija" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#18192b', padding: '1.2rem 2.5rem 1.2rem 2.5rem', width: '100%', position: 'static', marginTop: 32 }}>
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
        {/* BOTÓN CAMBIAR CONTRASEÑA */}
        {!editable && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button
              className="perfil-btn-cambiar-fijo"
              style={{
                background: '#0d1b36',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.08rem',
                border: 'none',
                borderRadius: 8,
                padding: '0.7rem 2.5rem',
                boxShadow: '0 2px 12px #0003',
                cursor: 'pointer',
              }}
              onClick={() => setShowPasswordForm(true)}
              type="button"
            >
              Cambiar contraseña
            </button>
          </div>
        )}
        {/* FORMULARIO CAMBIO DE CONTRASEÑA */}
        {showPasswordForm && (
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
    </div>
  );
}

export default PerfilAdmin;
