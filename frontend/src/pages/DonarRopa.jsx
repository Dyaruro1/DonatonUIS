import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrendaService, getTokenService } from '../core/config.js';
import './FeedPrendas.css';

function DonarRopa() {
  const navigate = useNavigate();
  
  // Get services using dependency injection
  const prendaService = getPrendaService();
  const tokenService = getTokenService();
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [talla, setTalla] = useState('');
  const [usoNumero, setUsoNumero] = useState('');
  const [usoUnidad, setUsoUnidad] = useState('');
  const [fotos, setFotos] = useState([]); // ahora es array
  const [descripcion, setDescripcion] = useState('');
  const [sexo, setSexo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNav = (route) => {
    navigate(route);
  };

  const validate = () => {
    if (!nombre.trim() || !talla || !usoNumero || !usoUnidad || fotos.length === 0 || !descripcion.trim() || !sexo) {
      setError('Por favor completa todos los campos y sube al menos una foto.');
      return false;
    }
    if (fotos.length > 3) {
      setError('Solo puedes subir hasta 3 fotos.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + fotos.length > 3) {
      setError('Solo puedes subir hasta 3 fotos.');
      return;
    }
    setFotos(prev => [...prev, ...files].slice(0, 3));
  };

  const handleRemoveFoto = (idx) => {
    setFotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('talla', talla);
      formData.append('uso', `${usoNumero} ${usoUnidad}`);
      formData.append('descripcion', descripcion);
      formData.append('sexo', sexo);
      // Subir cada imagen en su campo correspondiente (foto1, foto2, foto3)
      if (fotos.length > 0) formData.append('foto1', fotos[0]);
      if (fotos.length > 1) formData.append('foto2', fotos[1]);
      if (fotos.length > 2) formData.append('foto3', fotos[2]);      // Llama a la API real
      await prendaService.createPrenda(formData);
      setSuccess('¡Donación publicada exitosamente!');
      setTimeout(() => {
        navigate('/feed');
      }, 800);
      setNombre(''); setTalla(''); setUsoNumero(''); setUsoUnidad(''); setFotos([]); setDescripcion(''); setSexo('');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
        );
      } else {
        setError('Error al publicar la donación. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-root">
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
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}                  onClick={() => {
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
      <main className="feed-main" style={{padding: 0, minHeight: '100vh', background: '#18192b'}}>
        {/* NAVBAR HORIZONTAL COHERENTE */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', marginTop: '1.5rem', width: '100%', zIndex: 10 }}>
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
        {/* LAYOUT DOS COLUMNAS */}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '3.5rem', width: '100%', maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1rem'}}>
          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} style={{background: 'rgba(24,25,43,0.98)', borderRadius: 18, boxShadow: '0 2px 16px 0 #0002', padding: '2.5rem 2.5rem 2rem 2.5rem', width: 420, minWidth: 320, display: 'flex', flexDirection: 'column', gap: '1.3rem'}}>
            <h2 style={{color: '#fff', fontWeight: 700, fontSize: '1.6rem', marginBottom: 8}}>Publicar prenda de ropa</h2>
            <label style={{color: '#fff', fontWeight: 500}}>Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingrese el nombre de la prenda" style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', marginBottom: 0, boxShadow: '0 1px 4px #0001'}} required />
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: Camisa a cuadros</span>

            <label style={{color: '#fff', fontWeight: 500}}>Talla</label>
            <select value={talla} onChange={e => setTalla(e.target.value)} style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', marginBottom: 0, boxShadow: '0 1px 4px #0001'}} required>
              <option value="">Seleccione la talla</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="Única">Única</option>
              <option value="Infantil">Infantil</option>
            </select>
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: S, M, L, XL</span>

            <label style={{color: '#fff', fontWeight: 500}}>Tiempo de Uso</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select value={usoNumero} onChange={e => setUsoNumero(e.target.value)} style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', width: 90}} required>
                <option value="">N°</option>
                {[...Array(30)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <select value={usoUnidad} onChange={e => setUsoUnidad(e.target.value)} style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', width: 110}} required>
                <option value="">Unidad</option>
                <option value="horas">horas</option>
                <option value="días">días</option>
                <option value="meses">meses</option>
                <option value="años">años</option>
              </select>
            </div>
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: 30 días</span>

            <label style={{color: '#fff', fontWeight: 500}}>Adjuntar Fotos</label>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotosChange}
                style={{display: 'none'}}
                disabled={fotos.length >= 3}
              />
              <button
                type="button"
                onClick={() => document.getElementById('foto-input').click()}
                style={{
                  background: fotos.length >= 3 ? '#ccc' : '#21E058',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  cursor: fotos.length >= 3 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 4px #0002',
                  transition: 'background 0.18s',
                }}
                aria-label="Subir foto"
                disabled={fotos.length >= 3}
              >
                <b>+</b>
              </button>
              <span style={{color: '#23244a', background: '#fff', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '1rem', minWidth: 180, border: '1.5px solid #eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {fotos.length === 0 ? 'Sin archivo seleccionado' : `${fotos.length} archivo(s) seleccionado(s)`}
              </span>
            </div>
            {fotos.length > 0 && (
              <div style={{ display: 'flex', gap: 10, margin: '0.5rem 0', flexWrap: 'wrap' }}>
                {fotos.map((foto, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(foto)} alt={`preview-${idx}`} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12, border: '2px solid #21E058' }} />
                    <button type="button" onClick={() => handleRemoveFoto(idx)} style={{ position: 'absolute', top: -8, right: -8, background: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <label style={{color: '#fff', fontWeight: 500}}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => {
                if (e.target.value.length <= 60) setDescripcion(e.target.value);
              }}
              placeholder="Agregar descripción"
              rows={2}
              maxLength={60}
              style={{
                background: '#fff',
                color: '#23244a',
                border: 'none',
                borderRadius: 8,
                padding: '0.8rem 1rem',
                fontSize: '1rem',
                marginBottom: 0,
                boxShadow: '0 1px 4px #0001',
                resize: 'none',
                minHeight: 56,
                lineHeight: 1.3
              }}
              required
            />
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 4}}>{descripcion.length} / 60 caracteres</span>
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: Camisa hecha de algodón</span>

            <label style={{color: '#fff', fontWeight: 500}}>Sexo</label>
            <select value={sexo} onChange={e => setSexo(e.target.value)} style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', marginBottom: 0, boxShadow: '0 1px 4px #0001'}} required>
              <option value="">Seleccione el sexo</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: Masculino, Femenino, Otro</span>

            <div style={{display: 'flex', gap: 16, marginTop: 18}}>
              <button type="button" onClick={() => { setNombre(''); setTalla(''); setUsoNumero(''); setUsoUnidad(''); setFotos([]); setDescripcion(''); setSexo(''); setError(''); setSuccess(''); }} style={{flex: 1, background: 'transparent', color: '#fff', border: '1.5px solid #23244a', borderRadius: 8, padding: '0.8rem 0', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s'}}>Cancelar</button>
              <button type="submit" className="feed-card-btn" style={{flex: 1, fontSize: '1.08rem', padding: '0.8rem 0'}} disabled={loading}>{loading ? 'Publicando...' : 'Publicar'}</button>
            </div>
            {error && <div style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '1rem', marginTop: 4 }}>{error}</div>}
            {success && <div style={{ color: '#21E058', textAlign: 'center', fontSize: '1rem', marginTop: 4 }}>{success}</div>}
          </form>
          {/* INSTRUCCIONES */}
          <section style={{flex: 1, minWidth: 320, maxWidth: 420, background: 'rgba(24,25,43,0.98)', borderRadius: 18, boxShadow: '0 2px 16px 0 #0002', padding: '2.5rem 2.5rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <h2 style={{color: '#fff', fontWeight: 700, fontSize: '1.6rem', marginBottom: 8}}>Instrucciones</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
              {/* Paso 1 */}
              <div style={{background: 'transparent', border: '1.5px solid #23244a', borderRadius: 12, padding: '1.1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 18}}>
                <span style={{fontSize: 36, color: '#7ee787', marginRight: 10}}>
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6zm0 2h12v12H6V6zm2 2v2h8V8H8zm0 4v2h5v-2H8z" fill="#7ee787"/></svg>
                </span>
                <div style={{flex: 1}}>
                  <div style={{color: '#fff', fontWeight: 600, fontSize: '1.08rem'}}>Paso 1</div>
                  <div style={{color: '#b3b3b3', fontSize: '1rem'}}>Complete los campos con la información de su prenda.</div>
                  <span style={{color: '#21E058', fontSize: '0.95rem', fontWeight: 600}}>Importante</span>
                </div>
              </div>
              {/* Paso 2 */}
              <div style={{background: 'transparent', border: '1.5px solid #23244a', borderRadius: 12, padding: '1.1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 18}}>
                <span style={{fontSize: 36, color: '#7ee787', marginRight: 10}}>
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm7-2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.18A3 3 0 0 1 12 5a3 3 0 0 1 2.82 2H19zm-7 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#7ee787"/></svg>
                </span>
                <div style={{flex: 1}}>
                  <div style={{color: '#fff', fontWeight: 600, fontSize: '1.08rem'}}>Paso 2</div>
                  <div style={{color: '#b3b3b3', fontSize: '1rem'}}>Adjunte fotos claras de la prenda para una mejor visualización.</div>
                  <span style={{color: '#21E058', fontSize: '0.95rem', fontWeight: 600}}>Importante</span>
                </div>
              </div>
              {/* Paso 3 */}
              <div style={{background: 'transparent', border: '1.5px solid #23244a', borderRadius: 12, padding: '1.1rem 1.2rem', display: 'flex', alignItems: 'center', gap: 18}}>
                <span style={{fontSize: 36, color: '#21E058', marginRight: 10}}>
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#21E058"/><path d="M17 9l-5.2 6L7 11.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div style={{flex: 1}}>
                  <div style={{color: '#fff', fontWeight: 600, fontSize: '1.08rem'}}>Paso 3</div>
                  <div style={{color: '#b3b3b3', fontSize: '1rem'}}>Revise la información y presione el botón 'Publicar'.</div>
                  <span style={{color: '#21E058', fontSize: '0.95rem', fontWeight: 600}}>Importante</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DonarRopa;
