import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

function RestablecerContrasena() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.restablecerContrasena(correo);
      setEnviado(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No existe una cuenta con ese correo.');
      } else {
        setError('No se pudo enviar el correo. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg-container">
      <div className="login-bg-overlay"></div>
      <div className="login-header-title">DONATON UIS</div>
      <div className="login-form-container">
        <div className="login-avatar">
          <svg height="80" width="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#21E058" />
            <path d="M40 44c-8.837 0-16 7.163-16 16h32c0-8.837-7.163-16-16-16z" fill="#fff" />
            <circle cx="40" cy="32" r="12" fill="#fff" />
            <circle cx="40" cy="32" r="8" fill="#21E058" />
          </svg>
        </div>
        <h2 className="login-title">Restablece tu contraseña</h2>
        {enviado ? (
          <div style={{textAlign: 'center', color: '#21E058', fontWeight: 500, margin: '1.5rem 0'}}>
            ¡Revisa tu correo para continuar con el restablecimiento!
          </div>
        ) : (
          <>
            <div style={{color: '#333', fontSize: '1rem', textAlign: 'center', marginBottom: '1.2rem'}}>
              Introduce tu dirección de correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-label" htmlFor="correo">Correo</label>
              <input
                id="correo"
                type="email"
                className="login-input"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
              />
              <button className="login-btn" type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Continuar'}</button>
            </form>
            {error && <div style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
          </>
        )}
        <div className="login-back-row">
          <a href="/" className="login-link">Volver a la página principal</a>
        </div>
        <div className="login-terms-row">
          <a href="#" className="login-link">Términos de uso</a> <span>|</span> <a href="#" className="login-link">Política de privacidad</a>
        </div>
      </div>
    </div>
  );
}

export default RestablecerContrasena;
