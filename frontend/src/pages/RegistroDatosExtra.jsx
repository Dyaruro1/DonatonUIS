import React, { useState, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthService, getTokenService } from '../core/config.js';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient'; // Ensure supabase is imported
import './RegistroDatosExtra.css';

function RegistroDatosExtra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: initialEmail, password: initialPassword } = location.state || {}; // Renamed to avoid conflict
  const { refreshUser } = useContext(AuthContext);

  // Get services using dependency injection
  const authService = getAuthService();
  const tokenService = getTokenService();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [sexo, setSexo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState(initialEmail || ''); // Use renamed initialEmail
  // Note: 'password' from location.state is used directly in handleSubmit
  const [foto, setFoto] = useState(null);
  const [contacto1, setContacto1] = useState('');
  const [contacto2, setContacto2] = useState('');
  const [descripcion, setDescripcion] = useState('');
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
    // Use initialPassword from location.state directly for logic
    const currentPassword = initialPassword; 

    // Validación de fecha de nacimiento: no futura y al menos 12 años
    if (fechaNacimiento) {
      const partes = fechaNacimiento.split('-');
      if (partes.length === 3) {
        const fecha = new Date(`${partes[0]}-${partes[1]}-${partes[2]}T00:00:00`);
        const hoy = new Date();
        const hace12Anios = new Date(hoy.getFullYear() - 12, hoy.getMonth(), hoy.getDate());
        if (fecha > hace12Anios) {
          setError('Debes tener al menos 12 años para registrarte.');
          setLoading(false);
          return;
        }
        if (fecha > hoy) {
          setError('La fecha de nacimiento no puede ser en el futuro.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const formData = new FormData();
      formData.append('nombre', nombres);
      formData.append('apellido', apellidos);
      formData.append('correo', correo);
      formData.append('contrasena', currentPassword); // Use currentPassword
      formData.append('nombre_usuario', nombreUsuario);
      formData.append('sexo', sexo);
      formData.append('fecha_nacimiento', fechaNacimiento);
      formData.append('telefono', telefono);
      formData.append('contacto1', contacto1);
      formData.append('contacto2', contacto2);
      formData.append('descripcion', descripcion);
      if (foto) formData.append('foto', foto);

      await authService.register(formData);

      const loginResp = currentPassword === 'MICROSOFT_AUTH'
        ? await authService.login(correo, 'MICROSOFT_AUTH')
        : await authService.login(correo, currentPassword); // Use currentPassword

      localStorage.setItem('token', loginResp.data.token);
      await refreshUser();

      // Create user in Supabase Authentication if not a Microsoft Auth flow
      if (currentPassword !== 'MICROSOFT_AUTH') { // Use currentPassword
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: correo,
            password: currentPassword, // Use currentPassword
          });

          if (authError) {
            console.error('Error creating Supabase Auth user:', authError);
            // setError(prevError => prevError + `\nError en registro con Supabase: ${authError.message}`);
          } else {
            console.log('Supabase Auth user created/signed up successfully:', authData);
          }
        } catch (supabaseAuthError) {
          console.error('Exception during Supabase Auth user creation:', supabaseAuthError);
        }
      }

      navigate('/feed');

    } catch (err) {
      console.log('❌ /api/registrar/ error:', err.response?.data);
      let msg = 'Error al registrar usuario.';
      const data = err.response?.data;
      if (data) {
        if (Array.isArray(data.nombre_usuario) && data.nombre_usuario.length) {
          msg = data.nombre_usuario[0];
        } else if (Array.isArray(data.username) && data.username.length) {
          msg = data.username[0];
        } else if (typeof data.detail === 'string') {
          msg = data.detail;
        } else {
          const flat = Object.values(data).flat();
          if (flat.length) msg = flat.join(' ');
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-bg-img" style={{ height: '100vh', overflowY: 'auto' }}>
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
              <input id="foto" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} ref={fileInputRef} />
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
            <div className="registro-contact-fields-img" style={{ display: 'flex', gap: 30 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <label style={{ color: '#b3b3b3', marginBottom: 4, display: 'block' }}>Teléfono</label>
                <input placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
                <div style={{ marginTop: 12 }}>
                  <label style={{ color: '#b3b3b3', marginBottom: 4, display: 'block' }}>Otra forma de contacto</label>
                  <input placeholder="Otra forma de contacto" value={contacto1} style={{ width: '100%', minWidth: 220 }} onChange={e => setContacto1(e.target.value)} />
                  <label style={{ color: '#b3b3b3', margin: '13px 0 4px 0', display: 'block' }}>Otra forma de contacto 2</label>
                  <input placeholder="Otra forma de contacto 2" value={contacto2} style={{ width: '100%', minWidth: 220 }} onChange={e => setContacto2(e.target.value)} />
                </div>
              </div>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <label style={{ color: '#b3b3b3', marginBottom: 4, display: 'block' }}>Correo electrónico</label>
                  <input placeholder="Correo electrónico" value={correo} disabled style={{ width: '100%', minWidth: 220 }} />
                </div>
                <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                  <label style={{ color: '#b3b3b3', marginBottom: 4, display: 'block' }}>Descripción</label>
                  <input
                    placeholder="Breve descripción"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value.slice(0, 60))}
                    maxLength={60}
                    style={{ width: '100%' }}
                  />
                  <span style={{ color: '#7ee787', fontSize: '0.98rem', alignSelf: 'flex-end', marginTop: 2 }}>{descripcion.length} / 60 caracteres</span>
                </div>
              </div>
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
