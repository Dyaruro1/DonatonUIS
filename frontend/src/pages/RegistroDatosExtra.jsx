import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import './RegistroDatosExtra.css';

function RegistroDatosExtra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [sexo, setSexo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState(email || '');
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombres);
      formData.append('apellido', apellidos);
      formData.append('correo', correo);
      formData.append('contrasena', password);
      formData.append('nombre_usuario', nombreUsuario);
      formData.append('sexo', sexo);
      formData.append('fecha_nacimiento', fechaNacimiento);
      formData.append('telefono', telefono);
      if (foto) {
        formData.append('foto', foto);
      }

      await authService.register(formData); // No pongas headers aquí, axios lo hace solo con FormData

      if (password === 'MICROSOFT_AUTH') {
        navigate('/feed');
      } else {
        const loginResp = await authService.login(correo, password);
        localStorage.setItem('token', loginResp.data.token);
        navigate('/feed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        // Mostrar solo el mensaje relevante si existe
        const data = err.response.data;
        if (data.detail) {
          setError('Error: ' + data.detail);
        } else {
          setError('Error: ' + JSON.stringify(data, null, 2));
        }
      } else {
        setError('Error al registrar usuario.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-bg-img" style={{height: '100vh', overflowY: 'auto'}}>
      <div className="registro-sidebar-img">
        <img src="/logo-pequeno.svg" alt="logo" className="registro-sidebar-logo-img" />
      </div>
      <div className="registro-content-img">
        <div className="registro-header-img">
          <h1 className="registro-title-img">Registro</h1>
          <span className="registro-title-uis-img">DONATON UIS</span>
        </div>
        <form className="registro-form-img" onSubmit={handleSubmit}>
          <div className="registro-row-img">
            <div className="registro-avatar-section-img">
              <div className="registro-avatar-img">
                {foto ? (
                  <img src={URL.createObjectURL(foto)} alt="avatar" className="registro-avatar-img-real" />
                ) : (
                  <span className="registro-avatar-placeholder-img"> <svg width="60" height="60" fill="#1ed760" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z"/></svg> </span>
                )}
              </div>
              <label htmlFor="foto" className="registro-foto-link-img">¡Sube una foto!</label>
              {foto && (
                <button type="button" onClick={handleRemoveFoto} style={{
                  marginTop: 8,
                  background: '#ff6b6b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.3rem 0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'block',
                }}>
                  Quitar foto
                </button>
              )}
              <input id="foto" type="file" accept="image/*" style={{display:'none'}} onChange={handleFotoChange} ref={fileInputRef} />
            </div>
            <div className="registro-user-fields-img">
              <span className="registro-section-title-img">Perfil de usuario</span>
              <div className="registro-user-fields-row-img">
                <div className="registro-user-fields-col-img">
                  <label>Nombres</label>
                  <input value={nombres} onChange={e => setNombres(e.target.value)} required />
                  <label>Apellidos</label>
                  <input value={apellidos} onChange={e => setApellidos(e.target.value)} required />
                  <label>Nombre de usuario</label>
                  <input value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} required />
                </div>
                <div className="registro-user-fields-col-img">
                  <label>Sexo</label>
                  <select value={sexo} onChange={e => setSexo(e.target.value)} required>
                    <option value="">Selecciona</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                  <label>Fecha de nacimiento</label>
                  <div className="registro-date-fields-img">
                    <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="registro-contact-section-img">
            <span className="registro-section-title-img">Información de contacto</span>
            <div className="registro-contact-fields-img">
              <input placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
              <input placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required />
            </div>
          </div>
          <div className="registro-btn-row-img">
            <button className="registro-btn-img" type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
          </div>
          {error && <div className="registro-error-img">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default RegistroDatosExtra;
