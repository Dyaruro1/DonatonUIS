import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditarPublicacion.css';
import { donatonService } from '../services/api'; // Asegúrate de importar tu servicio

function EditarPublicacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const prenda = location.state?.prenda;
  if (!prenda) {
    navigate('/feed');
    return null;
  }
  // Estado de los campos
  const [nombre, setNombre] = useState(prenda.nombre || '');
  const [talla, setTalla] = useState(prenda.talla || '');
  const [uso, setUso] = useState(prenda.uso || '');
  const [sexo, setSexo] = useState(prenda.sexo || '');
  const [descripcion, setDescripcion] = useState(prenda.descripcion || '');
  // Fotos: pueden ser URLs (string) o File
  const [fotos, setFotos] = useState(
    prenda.imagenes && prenda.imagenes.length > 0
      ? prenda.imagenes.map(img => img.imagen)
      : (prenda.imagen_url ? [prenda.imagen_url] : [])
  );
  const [nuevasFotos, setNuevasFotos] = useState([]); // File[]
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Navegación
  const handleNav = (route) => { navigate(route); };

  // Manejar nuevas fotos (permite varias, máximo 3 en total)
  const handleAddFoto = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const total = fotos.length + nuevasFotos.length + e.target.files.length;
      if (total > 3) {
        setError('Solo puedes subir hasta 3 fotos en total.');
        return;
      }
      setNuevasFotos([...nuevasFotos, ...Array.from(e.target.files)].slice(0, 3 - fotos.length));
    }
  };
  // Eliminar foto existente (URL)
  const handleRemoveFoto = (idx) => {
    setFotos(fotos.filter((_, i) => i !== idx));
  };
  // Eliminar nueva foto (File)
  const handleRemoveNuevaFoto = (idx) => {
    setNuevasFotos(nuevasFotos.filter((_, i) => i !== idx));
  };

  // Guardar cambios (real)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!nombre.trim() || !talla || !uso || !sexo || !descripcion.trim() || (fotos.length + nuevasFotos.length) === 0) {
      setError('Por favor completa todos los campos y sube al menos una foto.');
      return;
    }
    if (fotos.length + nuevasFotos.length > 3) {
      setError('Solo puedes subir hasta 3 fotos en total.');
      return;
    }
    setLoading(true);
    try {
      // Construir formData para enviar imágenes y datos
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('talla', talla);
      formData.append('uso', uso);
      formData.append('sexo', sexo);
      formData.append('descripcion', descripcion);
      // Fotos existentes (solo nombre de archivo)
      fotos.forEach((foto) => {
        // Extrae solo el nombre del archivo, sin el path
        const nombreArchivo = foto.split('/').pop();
        formData.append('fotos_existentes', nombreArchivo);
      });
      // Nuevas fotos (archivos) - usa el campo 'imagenes' igual que en DonarRopa.jsx
      nuevasFotos.forEach((file) => {
        formData.append('imagenes', file);
      });
      await donatonService.updatePrenda(prenda.id, formData);
      setSuccess('¡Cambios guardados exitosamente!');
      setTimeout(() => {
        navigate('/feed');
      }, 1200);
    } catch (err) {
      setError('Error al guardar los cambios. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-publicacion-container">
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
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          type="button"
          title="Cerrar sesión"
        >
          <i className="fa fa-sign-out-alt" style={{ fontSize: 28 }}></i>
        </button>
      </div>
      {/* FORMULARIO DE EDICIÓN */}
      <form onSubmit={handleSubmit} className="editar-publicacion-form">
        {/* Columna izquierda */}
        <div className="editar-col-izq">
          <h2 className="editar-titulo">Editar publicación</h2>
          <label className="editar-label">Nombre</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ejemplo: Camisa a cuadros" className="editar-input" required />
          <span className="editar-ejemplo">Ejemplo: Camisa a cuadros</span>

          <label className="editar-label">Talla</label>
          <input type="text" value={talla} onChange={e => setTalla(e.target.value)} placeholder="Ejemplo: S, M, L, XL" className="editar-input" required />
          <span className="editar-ejemplo">Ejemplo: S, M, L, XL</span>

          <label className="editar-label">Tiempo de Uso</label>
          <input type="text" value={uso} onChange={e => setUso(e.target.value)} placeholder="Ejemplo: 30 días" className="editar-input" required />
          <span className="editar-ejemplo">Ejemplo: 30 días</span>

          <label className="editar-label">Sexo</label>
          <select value={sexo} onChange={e => setSexo(e.target.value)} className="editar-select" required>
            <option value="">Seleccione el sexo</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
          <span className="editar-ejemplo">Ejemplo: Masculino, Femenino, Otro</span>
        </div>
        {/* Columna derecha */}
        <div className="editar-col-der">
          <label className="editar-label">Agregar o eliminar fotos</label>
          <div className="editar-fotos-row">
            <input id="foto-input" type="file" accept="image/*" multiple onChange={handleAddFoto} style={{display: 'none'}} />
            <button type="button" onClick={() => document.getElementById('foto-input').click()} className="editar-foto-btn" aria-label="Subir foto"><b>+</b></button>
            <input type="text" value={''} placeholder="Agregue fotos de la prenda desde su dispositivo" className="editar-input" disabled />
          </div>
          {/* Miniaturas de fotos existentes */}
          <div className="editar-fotos-miniaturas">
            {fotos.map((foto, idx) => (
              <div key={idx} className="editar-foto-miniatura">
                <img src={foto} alt={`foto${idx}`} className="editar-foto-img" />
                <button type="button" onClick={() => handleRemoveFoto(idx)} className="editar-foto-delete">×</button>
              </div>
            ))}
            {nuevasFotos.map((foto, idx) => (
              <div key={idx} className="editar-foto-miniatura">
                <img src={URL.createObjectURL(foto)} alt={`nueva${idx}`} className="editar-foto-img" />
                <button type="button" onClick={() => handleRemoveNuevaFoto(idx)} className="editar-foto-delete">×</button>
              </div>
            ))}
          </div>
          <label className="editar-label">Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ejemplo: Camisa hecha de algodón" rows={4} className="editar-textarea" required />
          <span className="editar-ejemplo">Ejemplo: Camisa hecha de algodón</span>
          <div className="editar-botones">
            <button type="button" onClick={() => navigate(-1)} className="editar-cancelar">Cancelar</button>
            <button type="submit" className="feed-card-btn editar-guardar" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
          {error && <div style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '1rem', marginTop: 4 }}>{error}</div>}
          {success && <div style={{ color: '#21E058', textAlign: 'center', fontSize: '1rem', marginTop: 4 }}>{success}</div>}
        </div>
      </form>
    </div>
  );
}

export default EditarPublicacion;
