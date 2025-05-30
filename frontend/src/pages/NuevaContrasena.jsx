import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

function NuevaContrasena() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
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
        <h2 style={{ textAlign: 'center', fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.2rem', color: '#222' }}>Establece tu nueva contraseña</h2>
        {success ? (
          <div style={{textAlign: 'center', color: '#21E058', fontWeight: 500, margin: '1.5rem 0'}}>
            ¡Contraseña actualizada correctamente!<br />Redirigiendo al inicio de sesión...
          </div>
        ) : (
          <>
            <form style={{ width: '100%' }} onSubmit={handleSubmit}>
              <label style={{ fontSize: '0.95rem', color: '#21E058', fontWeight: 500, marginBottom: 4, marginTop: 8 }} htmlFor="password">Nueva contraseña</label>
              <input
                id="password"
                type="password"
                style={{ border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '1rem', outline: 'none', marginBottom: 8, width: '100%', boxSizing: 'border-box' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <label style={{ fontSize: '0.95rem', color: '#21E058', fontWeight: 500, marginBottom: 4, marginTop: 8 }} htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                style={{ border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '1rem', outline: 'none', marginBottom: 8, width: '100%', boxSizing: 'border-box' }}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button style={{ width: '100%', background: '#21E058', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.7rem 0', marginTop: 8, marginBottom: 4, cursor: 'pointer', transition: 'background 0.2s' }} type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar nueva contraseña'}</button>
            </form>
            {error && <div style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
          </>
        )}
        <div style={{ width: '100%', textAlign: 'center', marginBottom: 8 }}>
          <a href="/" style={{ color: '#21E058', textDecoration: 'none', fontSize: '0.98rem', fontWeight: 500 }}>Volver a la página principal</a>
        </div>
        <div style={{ width: '100%', textAlign: 'center', fontSize: '0.93rem', color: '#888', marginTop: 4, marginBottom: 2 }}>
          <a href="#" style={{ color: '#21E058', textDecoration: 'none', fontSize: '0.98rem', fontWeight: 500 }}>Términos de uso</a> <span style={{margin: '0 0.3rem', color: '#bbb'}}>|</span> <a href="#" style={{ color: '#21E058', textDecoration: 'none', fontSize: '0.98rem', fontWeight: 500 }}>Política de privacidad</a>
        </div>
      </div>
    </div>
  );
}

export default NuevaContrasena;
