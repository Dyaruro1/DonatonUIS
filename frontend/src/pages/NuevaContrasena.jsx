import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

function NuevaContrasena() {
  // Remove searchParams and token extraction
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false); // To track if Supabase processed the recovery token
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Supabase event: PASSWORD_RECOVERY, session:", session);
        // The session is now set by Supabase, user can update their password
        setSessionReady(true);
        if (session?.user?.email) setUserEmail(session.user.email);
      } else if (event === "SIGNED_IN" && session?.user) {
        // This case might happen if the user is already signed in through other means
        // or if the recovery link somehow also signs them in directly.
        // For password recovery, PASSWORD_RECOVERY is the primary event.
        console.log("Supabase event: SIGNED_IN, session:", session);
        setSessionReady(true); // Also allow password update if a session is established
        if (session?.user?.email) setUserEmail(session.user.email);
      }
    });

    // Check if the hash fragment for recovery is present on initial load
    // Supabase SDK usually handles this automatically and fires onAuthStateChange
    if (window.location.hash.includes('type=recovery') && window.location.hash.includes('access_token')) {
        console.log("Recovery hash detected in URL.");
        // We don't need to call setSession manually here,
        // onAuthStateChange with PASSWORD_RECOVERY event should handle it.
        // If it doesn't fire, there might be an issue with Supabase client setup or redirects.
    }


    return () => {
      if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!sessionReady) {
      setError('El proceso de recuperación de contraseña aún no está listo. Por favor, espera o asegúrate de haber seguido el enlace correctamente.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Por favor ingresa y confirma tu nueva contraseña.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!userEmail) {
      setError('No se pudo obtener el correo del usuario.');
      return;
    }
    setLoading(true);
    try {
      // Cambia la contraseña usando Supabase
      const { error: supabaseError } = await supabase.auth.updateUser({ password });
      if (supabaseError) {
        console.error("Error updating password with Supabase:", supabaseError);
        setError(supabaseError.message || 'El enlace es inválido o ha expirado. Solicita un nuevo restablecimiento.');
      } else {
        // Sincronizar con Django
        try {
          await import('../services/api').then(({ authService }) => authService.sincronizarContrasenaSupabase(userEmail, password));
          setSuccess(true);
          setTimeout(() => navigate('/'), 3500);
        } catch (syncErr) {
          setError('La contraseña se actualizó en Supabase pero no en el sistema. Intenta de nuevo o contacta soporte.');
        }
      }
    } catch (err) {
      setError('El enlace es inválido o ha expirado. Solicita un nuevo restablecimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: "url('/fondo-uis.jpg') no-repeat center center fixed",
        backgroundSize: 'cover',
        zIndex: 999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(24,25,43,0.58)',
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          minWidth: 350,
          margin: '0 auto',
          padding: '2.5rem',
          boxSizing: 'border-box',
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 2px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg height="80" width="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#21E058" />
            <path d="M40 44c-8.837 0-16 7.163-16 16h32c0-8.837-7.163-16-16-16z" fill="#fff" />
            <circle cx="40" cy="32" r="12" fill="#fff" />
            <circle cx="40" cy="32" r="8" fill="#21E058" />
          </svg>
        </div>
        <h2 style={{ textAlign: 'center', fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.2rem', color: '#222' }}>Crea una nueva contraseña</h2>
        {success ? (
          <div style={{textAlign: 'center', color: '#21E058', fontWeight: 500, margin: '1.5rem 0'}}>
            ¡Contraseña actualizada exitosamente!<br />
            <span style={{color: '#222', marginTop: '1.2rem', fontWeight: 400, display: 'block'}}>
              Ahora puedes iniciar sesión con tu nueva contraseña.<br />
              Serás redirigido a la página principal.
            </span>
          </div>
        ) : (
          <form style={{ width: '100%' }} onSubmit={handleSubmit}>
            <div style={{color: '#333', fontSize: '1rem', textAlign: 'center', marginBottom: '1.2rem'}}>
              Ingresa tu nueva contraseña para tu cuenta.
            </div>            <label style={{ fontSize: '0.95rem', color: '#21E058', fontWeight: 500, marginBottom: 4, marginTop: 8 }} htmlFor="password">Nueva contraseña</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                style={{ border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '0.6rem 3.2rem 0.6rem 0.9rem', fontSize: '1rem', outline: 'none', marginBottom: 8, width: '100%', boxSizing: 'border-box' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={!sessionReady || loading} // Disable if session not ready
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
            </div>            <label style={{ fontSize: '0.95rem', color: '#21E058', fontWeight: 500, marginBottom: 4, marginTop: 8 }} htmlFor="confirmPassword">Confirmar contraseña</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                style={{ border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '0.6rem 3.2rem 0.6rem 0.9rem', fontSize: '1rem', outline: 'none', marginBottom: 8, width: '100%', boxSizing: 'border-box' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={!sessionReady || loading} // Disable if session not ready
              />
              <span
                onClick={() => setShowConfirmPassword(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#babcc4', fontSize: 22 }}
                tabIndex={0}
                role="button"
                aria-label="Mostrar/ocultar contraseña"
              >
                {showConfirmPassword ? (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#babcc4" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="#babcc4" strokeWidth="2"/></svg>
                ) : (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M1 1l22 22" stroke="#babcc4" strokeWidth="2"/></svg>
                )}
              </span>
            </div>
            <button style={{ width: '100%', background: '#21E058', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.7rem 0', marginTop: 8, marginBottom: 4, cursor: 'pointer', transition: 'background 0.2s' }} type="submit" disabled={!sessionReady || loading}>{loading ? 'Actualizando...' : 'Actualizar contraseña'}</button>
            {error && <div style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
            {!sessionReady && !loading && !success && <div style={{ color: 'orange', margin: '0.5rem 0', textAlign: 'center', fontSize: '0.98rem' }}>Procesando enlace de recuperación...</div>}
          </form>
        )}
        <div style={{ width: '100%', textAlign: 'center', marginBottom: 8 }}>
          <a href="/" style={{ color: '#21E058', textDecoration: 'none', fontSize: '0.98rem', fontWeight: 500 }}>Volver a la página principal</a>
        </div>
      </div>
    </div>
  );
}

export default NuevaContrasena;
