import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthService, getTokenService } from '../core/config.js';
import '../pages/FeedPrendas.css'; // Para los estilos de la barra de navegación

function Ajustes() {
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');
  const navigate = useNavigate();

  // Get services using dependency injection
  const authService = getAuthService();
  const tokenService = getTokenService();

  useEffect(() => {
    authService.getCurrentUser()
      .then(res => {
        setUsername(res.data.username || '');
        setUsernameInput(res.data.username || '');
      })
      .catch(() => {
        setUsername('');
        setUsernameInput('');
      });
  }, []);

  const handleUsernameChange = (e) => {
    setUsernameInput(e.target.value);
    setUsernameMsg('');
    setErrorMsg('');
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameMsg('');
    setErrorMsg('');
    // Validación: debe empezar con arroba y tener al menos 2 caracteres
    if (usernameInput.length < 2) {
      setErrorMsg('El nombre de usuario debe tener al menos 2 caracteres.');
      return;
    }
    setPendingUsername(usernameInput);
    setShowChangeUsernameModal(true);
  };

  const confirmChangeUsername = async () => {
    setShowChangeUsernameModal(false);
    setUsernameMsg('');
    setErrorMsg('');
    try {
      await authService.updateUsername(pendingUsername);
      setUsername(pendingUsername);
      setUsernameMsg('Nombre de usuario actualizado correctamente.');
    } catch (err) {
      // Mostrar mensaje de error específico del backend si existe
      let msg = 'No se pudo actualizar el nombre de usuario.';
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data.detail === 'string') msg = data.detail;
        else if (Array.isArray(data.nombre_usuario) && data.nombre_usuario.length) msg = data.nombre_usuario[0];
        else if (Array.isArray(data.username) && data.username.length) msg = data.username[0];
      }
      setErrorMsg(msg);
    }
  };
  const handleDeleteAccount = async () => {
    setDeleteMsg('');
    try {
      await authService.deleteAccount();
      tokenService.removeToken();
      navigate('/login');
    } catch (err) {
      setDeleteMsg('No se pudo eliminar la cuenta.');
    }
  };

  const handleNav = (route) => {
    navigate(route);
  };

  return (
    <div className="feed-root" style={{ minHeight: '100vh', background: '#18192b', flexDirection: 'column' }}>
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
              <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>                <button
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => {
                    tokenService.removeToken();
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
      {/* NAVBAR HORIZONTAL SUPERIOR */}
      {/* BOTONES DE NAVEGACIÓN SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', marginBottom: '2.5rem', width: '100%' }}>
        <button className={`feed-navbar-btn${window.location.pathname === '/feed' || window.location.pathname === '/' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/feed')}>
          <span className="feed-navbar-icon">🧺</span>
          <span className="feed-navbar-label">Prendas</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/donar' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/donar')}>
          <span className="feed-navbar-icon">🤲</span>
          <span className="feed-navbar-label">Donar</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/perfil' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/perfil')}>
          <span className="feed-navbar-icon">👤</span>
          <span className="feed-navbar-label">Perfil</span>
        </button>
        <button className={`feed-navbar-btn${window.location.pathname === '/ajustes' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleNav('/ajustes')}>
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
      {/* CONTENIDO PRINCIPAL AJUSTES */}
      <main className="feed-main" style={{ minHeight: '100vh', background: '#18192b', paddingTop: 0 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', marginTop: '1.5rem', padding: '0 2.5rem' }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.5rem', marginBottom: '2.5rem' }}>Configuración de la cuenta</h1>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.25rem', marginBottom: 18 }}>Cambiar nombre de usuario</div>
            <form onSubmit={handleUsernameSubmit} style={{ background: '#23233a', borderRadius: 14, padding: '1.2rem 1.2rem 1.2rem 1.2rem', marginBottom: 18 }}>
              <label style={{ color: '#babcc4', fontWeight: 500, fontSize: '1.05rem', marginBottom: 8, display: 'block' }}>Nombre de usuario</label>
              <input
                type="text"
                value={usernameInput}
                onChange={handleUsernameChange}
                style={{
                  width: '100%',
                  background: '#18192b',
                  color: '#babcc4',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.9rem 1.1rem',
                  fontSize: '1.08rem',
                  fontWeight: 500,
                  marginBottom: 0,
                  outline: 'none',
                  boxShadow: '0 1px 4px #0001',
                }}
                placeholder="@danielesteban46"
                autoComplete="off"
              />
              <button
                style={{
                  background: '#183a53',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1.13rem',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.9rem 2.2rem',
                  cursor: 'pointer',
                  marginTop: 18,
                  transition: 'background 0.18s',
                  display: 'block',
                }}
                type="submit"
              >
                Cambiar nombre de usuario
              </button>
            </form>
            {usernameMsg && <div style={{ color: '#21e058', marginTop: 8 }}>{usernameMsg}</div>}
            {errorMsg && <div style={{ color: '#ff3b3b', marginTop: 8 }}>{errorMsg}</div>}
          </div>
          <div style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>
            <div style={{ color: '#ff3b3b', fontWeight: 700, fontSize: '1.18rem', marginBottom: 10 }}>Eliminar/cerrar cuenta</div>
            <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
              Una vez que elimine su cuenta, no hay vuelta atrás. Por favor, esté seguro.
            </div>
            <button
              style={{
                background: '#ff2323',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.13rem',
                border: 'none',
                borderRadius: 8,
                padding: '0.9rem 2.2rem',
                cursor: 'pointer',
                marginBottom: 18,
                marginTop: 0,
                transition: 'background 0.18s',
                display: 'block',
              }}
              onClick={() => setShowDeleteModal(true)}
              type="button"
            >
              Eliminar cuenta
            </button>
            {deleteMsg && <div style={{ color: '#ff3b3b', marginTop: 8 }}>{deleteMsg}</div>}
          </div>
          <a href="mailto:soporte@donatonuis.com" style={{ color: '#babcc4', fontSize: '1rem', textDecoration: 'underline', marginTop: 18, display: 'inline-block' }}>
            Contactar con soporte técnico
          </a>
        </div>
        {/* Modal de confirmación para eliminar cuenta */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
                ¿Seguro que deseas eliminar tu cuenta?
              </div>
              <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                Esta acción es irreversible. Se eliminarán todos tus datos.
              </div>
              <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                <button
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={handleDeleteAccount}
                >
                  Sí, eliminar
                </button>
                <button
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL DE CONFIRMACIÓN CAMBIO DE USUARIO */}
        {showChangeUsernameModal && (
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
                <div style={{ color: '#ffb300', fontWeight: 700, fontSize: '1.18rem', marginBottom: 10 }}>
                  ¿Seguro que deseas cambiar tu nombre de usuario?
                </div>
                <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                  Este cambio es permanente y tu usuario será <span style={{ color: '#7ee787', fontWeight: 600 }}>{pendingUsername}</span>.<br />¿Deseas continuar?
                </div>
                <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                  <button
                    style={{ flex: 1, background: '#183a53', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                    onClick={confirmChangeUsername}
                  >
                    Sí, cambiar
                  </button>
                  <button
                    style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                    onClick={() => setShowChangeUsernameModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Ajustes;
