import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donatonService } from '../services/api';
import './FeedPrendas.css';

function DonarRopa() {
  const navigate = useNavigate();
  // Form state
  const [nombre, setNombre] = useState('');
  const [talla, setTalla] = useState('');
  const [uso, setUso] = useState('');
  const [foto, setFoto] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleNav = (route) => {
    navigate(route);
  };

  const validate = () => {
    if (!nombre.trim() || !talla || !uso || !foto || !descripcion.trim()) {
      setError('Por favor completa todos los campos.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await donatonService.donarRopa({
        nombre,
        talla,
        uso,
        descripcion,
        imagen_url: '/fondo-uis.jpg',
      });
      setSuccess('¡Donación publicada exitosamente!');
      setNombre(''); setTalla(''); setUso(''); setFoto(null); setDescripcion('');
    } catch (err) {
      setError('Error al publicar la donación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-root">
      <main className="feed-main" style={{padding: 0, minHeight: '100vh', background: '#18192b'}}>
        {/* NAVBAR HORIZONTAL */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', marginTop: '1.5rem' }}>
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
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="38">38</option>
              <option value="40">40</option>
              <option value="42">42</option>
            </select>
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: S, M, L, XL</span>

            <label style={{color: '#fff', fontWeight: 500}}>Tiempo de Uso</label>
            <input type="text" value={uso} onChange={e => setUso(e.target.value)} placeholder="Ingrese el tiempo de uso en días" style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', marginBottom: 0, boxShadow: '0 1px 4px #0001'}} required />
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: 30 días</span>

            <label style={{color: '#fff', fontWeight: 500}}>Adjuntar Fotos</label>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={e => setFoto(e.target.files[0])}
                style={{display: 'none'}}
                required
              />
              <button
                type="button"
                onClick={() => document.getElementById('foto-input').click()}
                style={{
                  background: '#21E058',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px #0002',
                  transition: 'background 0.18s',
                }}
                aria-label="Subir foto"
              >
                <b>+</b>
              </button>
              <span style={{color: '#23244a', background: '#fff', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '1rem', minWidth: 180, border: '1.5px solid #eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {foto ? foto.name : 'Sin archivo seleccionado'}
              </span>
            </div>
            {foto && (
              <img src={URL.createObjectURL(foto)} alt="preview" style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 12, margin: '0.5rem 0', border: '2px solid #21E058' }} />
            )}

            <label style={{color: '#fff', fontWeight: 500}}>Descripción</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ingrese el nombre de la prenda" style={{background: '#fff', color: '#23244a', border: 'none', borderRadius: 8, padding: '0.8rem 1rem', fontSize: '1rem', marginBottom: 0, boxShadow: '0 1px 4px #0001'}} required />
            <span style={{color: '#b3b3b3', fontSize: '0.95rem', marginBottom: 8}}>Ejemplo: Camisa hecha de algodón</span>

            <div style={{display: 'flex', gap: 16, marginTop: 18}}>
              <button type="button" onClick={() => { setNombre(''); setTalla(''); setUso(''); setFoto(null); setDescripcion(''); setError(''); setSuccess(''); }} style={{flex: 1, background: 'transparent', color: '#fff', border: '1.5px solid #23244a', borderRadius: 8, padding: '0.8rem 0', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s'}}>Cancelar</button>
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
