import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [msalError, setMsalError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      // Normaliza el correo antes de enviarlo
      const correo = email.trim().toLowerCase();
      const success = await login(correo, password);
      if (success) {
        navigate('/feed');
      } else {
        setLoginError('Correo o contraseña incorrectos.');
      }
    } catch (err) {
      setLoginError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setMsalError('');
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      });
      const email = loginResponse.account.username;
      if (!email.endsWith('@correo.uis.edu.co')) {
        setMsalError('Solo se permite iniciar sesión con cuentas @correo.uis.edu.co');
        await instance.logoutPopup();
        return;
      }
      // Redirigir al feed tras login Microsoft
      navigate('/feed');
    } catch (err) {
      setMsalError('Error al iniciar sesión con Microsoft');
    }
  };

  return (
    <div className="login-bg-container">
      <div className="login-bg-overlay"></div>
      <div className="login-header-title">DONATON UIS</div>
      <div className="login-form-container">
        <div className="login-avatar">
          <img src="/logo-pequeno.svg" alt="Donaton UIS" />
        </div>
        <h2 className="login-title">Te damos la<br />bienvenida de nuevo</h2>
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
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ background: '#191a2e', color: '#fff', border: 'none', borderRadius: 10, padding: '1rem 3.2rem 1rem 1.1rem', fontSize: '1.08rem', width: '100%' }}
            />
            <span
              onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#babcc4', fontSize: 22 }}
              tabIndex={0}
              role="button"
              aria-label="Mostrar/ocultar contraseña"
            >
              {showPassword ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#babcc4" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="#babcc4" strokeWidth="2"/></svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22" stroke="#babcc4" strokeWidth="2"/></svg>
              )}
            </span>
          </div>
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
          <button className="login-btn" type="submit" disabled={!captchaChecked || loading}>{loading ? 'Cargando...' : 'Continuar'}</button>
        </form>
        {loginError && <div style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center', fontSize: '0.98rem' }}>{loginError}</div>}
        <div className="login-links" style={{ textAlign: 'center', width: '100%' }}>
          <a href="#" className="login-link" onClick={e => { e.preventDefault(); navigate('/restablecer-contrasena'); }}>¿Olvidaste tu contraseña?</a>
        </div>
        <div className="login-register-row">
          <span>No tienes una cuenta?</span>
          <a href="/register" className="login-link">Regístrate</a>
        </div>
        <div className="login-divider">
          <span className="login-divider-line"></span>
          <span className="login-divider-text">o</span>
          <span className="login-divider-line"></span>
        </div>
        <button className="login-microsoft-btn" type="button" onClick={handleMicrosoftLogin}>
          <img src="/microsoft-logo.svg" alt="Microsoft" className="login-microsoft-logo" />
          Iniciar con cuenta de Microsoft
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

export default Login;
