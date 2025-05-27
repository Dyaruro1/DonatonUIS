import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { authService } from '../services/api';
import './Login.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [msalError, setMsalError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { login } = authService;
  const [error, setError] = useState('');


  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!captchaChecked) {
      setError('Debes confirmar el captcha');
      return;
    }
    setLoading(true);
    try {
      // Chequeo de correo duplicado usando el endpoint de verificación
      const resp = await authService.checkEmail(email.trim().toLowerCase());
      if (resp.data.exists) {
        setError('Ya existe una cuenta registrada con ese correo.');
        setLoading(false);
        return;
      }
      navigate('/registro-datos-extra', { state: { email, password } });
    } catch (err) {
      setError('Error al verificar el correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftRegister = async () => {
    setMsalError('');
    setLoading(true);
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      });
      const email = loginResponse.account.username;
      if (!email.endsWith('@correo.uis.edu.co')) {
        setMsalError('Solo se permite registrar cuentas @correo.uis.edu.co');
        await instance.logoutPopup();
        setLoading(false);
        return;
      }
      // Redirige a la página de datos extra pasando el email y una contraseña especial
      navigate('/registro-datos-extra', { state: { email, password: 'MICROSOFT_AUTH' } });
    } catch (err) {
      setMsalError('Error al registrar con Microsoft');
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
          <img src="/logo-pequeno.svg" alt="Donaton UIS" style={{ width: 90, height: 90, borderRadius: '60%', background: '#fffcfc' }} />
        </div>
        <h2 className="login-title">Crea una cuenta</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <label className="login-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <div className="login-captcha-row">
            <input
              type="checkbox"
              id="captcha"
              checked={captchaChecked}
              onChange={e => setCaptchaChecked(e.target.checked)}
            />
            <label htmlFor="captcha" className="login-captcha-label">No soy un robot</label>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="login-captcha-img" />
          </div>
          {/* aquí mostramos el mensaje de error, si lo hay */}
          {error && (
            <div className="login-error" style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button className="login-btn" type="submit" disabled={!captchaChecked || loading}>
            {loading ? 'Cargando...' : 'Continuar'}
          </button>
        </form>
        <div className="login-links">
          <a href="#" className="login-link">¿Necesitas ayuda?</a>
        </div>
        <div className="login-register-row">
          <span>¿Ya tienes una cuenta?</span>
          <a href="/login" className="login-link">Inicia sesión</a>
        </div>
        <div className="login-divider">
          <span className="login-divider-line"></span>
          <span className="login-divider-text">o</span>
          <span className="login-divider-line"></span>
        </div>
        <button className="login-microsoft-btn" type="button" onClick={handleMicrosoftRegister} disabled={loading}>
          <img src="/microsoft-logo.svg" alt="Microsoft" className="login-microsoft-logo" />
          Registrar con cuenta de Microsoft
        </button>
        {msalError && <div style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center', fontSize: '0.98rem' }}>{msalError}</div>}
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

export default Register;
