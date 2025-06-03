import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { authService } from '../services/api';
import './Login.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [msalError, setMsalError] = useState('');
  const [loading, setLoading] = useState(false);  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { login } = authService;
  const [error, setError] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportConfirmMsg, setSupportConfirmMsg] = useState('');

  // Elimina tokens viejos al entrar a la pantalla de registro
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Validación de dominio de correo
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed.endsWith('@correo.uis.edu.co') && !emailTrimmed.endsWith('@uis.edu.co')) {
      setError('Solo se permite registrar cuentas institucionales @correo.uis.edu.co o @uis.edu.co de la Universidad Industrial de Santander.');
      return;
    }
    if (password.length < 8 || /^\s+$/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres y no puede ser solo espacios.');
      return;
    }
    if (!captchaChecked) {
      setError('Debes confirmar el captcha');
      return;
    }
    setLoading(true);
    try {
      // Chequeo de correo duplicado usando el endpoint de verificación
      const resp = await authService.checkEmail(emailTrimmed);
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
        setLoading(false);
        return;
      }
      // Verifica si ya existe una cuenta con ese correo
      const resp = await authService.checkEmail(email.trim().toLowerCase());
      if (resp.data.exists) {
        setMsalError('Ya existe una cuenta registrada con ese correo.');
        setLoading(false);
        return;
      }
      // Redirige a la página de datos extra pasando el email y una contraseña especial
      navigate('/registro-datos-extra', { state: { email, password: 'MICROSOFT_AUTH' } });
    } catch (err) {      setMsalError('Error al registrar con Microsoft');
      // Solo en caso de error real tras autenticación, cerrar sesión Microsoft
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar solicitud de soporte
  const handleSupportRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/soporte/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correoUsuario: supportEmail.trim(),
          mensaje: supportMessage.trim(),
          tipo: 'registro_ayuda'
        }),
      });
      
      if (response.ok) {
        setShowSupportModal(false);
        setSupportMessage('');
        setSupportEmail('');
        setSupportConfirmMsg('¡Solicitud enviada! Te responderemos pronto a tu correo.');
        setTimeout(() => setSupportConfirmMsg(''), 4000);
      } else {
        setSupportConfirmMsg('Error al enviar la solicitud. Intenta de nuevo.');
        setTimeout(() => setSupportConfirmMsg(''), 4000);
      }
    } catch (e) {
      setSupportConfirmMsg('Error al enviar la solicitud. Intenta de nuevo.');
      setTimeout(() => setSupportConfirmMsg(''), 4000);
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
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              style={{ background: '#fff', color: '#18192b', border: '1px solid #e0e0e0', borderRadius: 10, padding: '1rem 3.2rem 1rem 1.1rem', fontSize: '1.08rem', width: '100%' }}
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
          {/* aquí mostramos el mensaje de error, si lo hay */}
          {error && (
            <div className="login-error" style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button className="login-btn" type="submit" disabled={!captchaChecked || loading}>
            {loading ? 'Cargando...' : 'Continuar'}
          </button>
        </form>        <div className="login-links" style={{ textAlign: 'center', width: '100%' }}>
          <a 
            href="#" 
            className="login-link" 
            onClick={(e) => {
              e.preventDefault();
              setShowSupportModal(true);
            }}
          >
            ¿Necesitas ayuda?
          </a>
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
        </div>        <div className="login-terms-row">
          <a href="#" className="login-link">Términos de uso</a> <span>|</span> <a href="#" className="login-link">Política de privacidad</a>
        </div>
      </div>
      
      {/* MODAL DE SOPORTE */}
      {showSupportModal && (
        <>
          <div style={{
            position: 'fixed',
            left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(24,25,43,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 200
          }} />
          <div style={{
            position: 'fixed',
            left: 0, top: 0, width: '100vw', height: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 201
          }}>
            <div style={{
              background: '#23233a',
              borderRadius: 18,
              boxShadow: '0 4px 32px 0 rgba(0,0,0,0.3)',
              padding: '2.2rem 2.5rem 2rem 2.5rem',
              minWidth: 400, maxWidth: 500, width: '90%',
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              {/* Logo y título */}
              <img 
                src="/logo-pequeno.svg" 
                alt="Donaton UIS" 
                style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  background: '#fff',
                  marginBottom: 16,
                  padding: 8
                }} 
              />
              <div style={{ 
                color: '#fff', 
                fontWeight: 700, 
                fontSize: '1.4rem', 
                marginBottom: 8,
                textAlign: 'center'
              }}>
                ¿Necesitas ayuda?
              </div>
              <div style={{ 
                color: '#babcc4', 
                marginBottom: 20,
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                Envíanos tu consulta y te responderemos lo antes posible
              </div>
              
              {/* Campo de correo */}
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                style={{
                  width: '100%', 
                  borderRadius: 10, 
                  border: '1px solid #444', 
                  marginBottom: 16, 
                  padding: '12px 16px', 
                  fontSize: '1rem',
                  background: '#fff',
                  color: '#18192b'
                }}
              />
              
              {/* Campo de mensaje */}
              <textarea
                placeholder="Describe tu consulta o problema..."
                value={supportMessage}
                onChange={e => setSupportMessage(e.target.value)}
                style={{
                  width: '100%', 
                  minHeight: 100, 
                  borderRadius: 10, 
                  border: '1px solid #444', 
                  marginBottom: 20, 
                  padding: '12px 16px', 
                  fontSize: '1rem',
                  background: '#fff',
                  color: '#18192b',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              
              {/* Botones */}
              <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                <button
                  style={{ 
                    flex: 1, 
                    background: '#0d1b36', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 10, 
                    padding: '12px 0', 
                    fontWeight: 600, 
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => {
                    setShowSupportModal(false);
                    setSupportMessage('');
                    setSupportEmail('');
                  }}
                  onMouseOver={e => e.target.style.background = '#1a2a4a'}
                  onMouseOut={e => e.target.style.background = '#0d1b36'}
                >
                  Cancelar
                </button>
                <button
                  style={{ 
                    flex: 1, 
                    background: '#21e058', 
                    color: '#18192b', 
                    border: 'none', 
                    borderRadius: 10, 
                    padding: '12px 0', 
                    fontWeight: 600, 
                    fontSize: '1rem',
                    cursor: 'pointer',
                    opacity: (!supportMessage.trim() || !supportEmail.trim()) ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onClick={handleSupportRequest}
                  disabled={!supportMessage.trim() || !supportEmail.trim()}
                  onMouseOver={e => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#1ab84a';
                    }
                  }}
                  onMouseOut={e => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#21e058';
                    }
                  }}
                >
                  Enviar solicitud
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* MENSAJE DE CONFIRMACIÓN */}
      {supportConfirmMsg && (
        <div style={{
          position: 'fixed', 
          top: 30, 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: '#23233a', 
          color: '#fff', 
          padding: '16px 24px', 
          borderRadius: 12, 
          zIndex: 300, 
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid #444'
        }}>
          {supportConfirmMsg}
          <button 
            style={{ 
              marginLeft: 16, 
              background: 'none', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }} 
            onClick={() => setSupportConfirmMsg('')}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;
