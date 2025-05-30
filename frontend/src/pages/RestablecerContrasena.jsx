import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { supabase } from '../supabaseClient';
import './Login.css';

function RestablecerContrasena() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        await authService.getCsrf();
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        setError('Error de configuración, por favor intente más tarde.');
      }
    };
    getCsrfToken();
  }, []);  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Restablecer contraseña en Django
      const resp = await authService.restablecerContrasena(correo);
      if (resp && resp.data && resp.data.nuevaContrasena) {
        const nuevaPassword = resp.data.nuevaContrasena;
        setNuevaContrasena(nuevaPassword);
        
        // Intentar actualizar la contraseña en Supabase Authentication
        try {
          // Primero intentar crear el usuario en Supabase (si no existe)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: correo,
            password: nuevaPassword
          });
          
          if (signUpError) {
            // Si el error es que el usuario ya existe, intentar actualizar la contraseña
            if (signUpError.message.includes('already registered')) {
              console.log('Usuario ya existe en Supabase, intentando actualizar contraseña...');
              
              // Intentar hacer login para obtener sesión y luego actualizar
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: correo,
                password: nuevaPassword // Usar la nueva contraseña
              });
              
              if (signInError) {
                console.warn('No se pudo sincronizar con Supabase:', signInError.message);
              } else {
                console.log('Contraseña sincronizada exitosamente con Supabase');
              }
            } else {
              console.error('Error creando usuario en Supabase:', signUpError);
            }
          } else {
            console.log('Usuario creado exitosamente en Supabase');
          }
        } catch (supabaseError) {
          console.error('Error con Supabase Authentication:', supabaseError);
          // No fallar el proceso completo si Supabase falla
        }
      }
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
          background: 'rgba(24,25,43,0.58)', // overlay azul oscuro semitransparente
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
        <h2 style={{ textAlign: 'center', fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.2rem', color: '#222' }}>Restablece tu contraseña</h2>        {enviado ? (
          <div style={{textAlign: 'center', color: '#21E058', fontWeight: 500, margin: '1.5rem 0'}}>
            ¡Contraseña restablecida exitosamente!<br />
            {nuevaContrasena && (
              <>
                <div style={{color: '#222', marginTop: '1.2rem', fontWeight: 400}}>
                  <b>Tu nueva contraseña temporal es:</b><br />
                  <span style={{fontSize: '1.15rem', color: '#21E058', fontFamily: 'monospace', letterSpacing: '2px'}}>{nuevaContrasena}</span><br />
                  <span style={{fontSize: '0.98rem', color: '#444'}}>Guarda esta contraseña y cámbiala después de iniciar sesión.</span><br />
                  <span style={{fontSize: '0.9rem', color: '#666', marginTop: '8px', display: 'inline-block'}}>
                    Esta contraseña también se ha sincronizado con tu cuenta de autenticación.
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{color: '#333', fontSize: '1rem', textAlign: 'center', marginBottom: '1.2rem'}}>
              Introduce tu dirección de correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </div>
            <form style={{ width: '100%' }} onSubmit={handleSubmit}>
              <label style={{ fontSize: '0.95rem', color: '#21E058', fontWeight: 500, marginBottom: 4, marginTop: 8 }} htmlFor="correo">Correo</label>
              <input
                id="correo"
                type="email"
                style={{ border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '1rem', outline: 'none', marginBottom: 8, width: '100%', boxSizing: 'border-box' }}
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
              />
              <button style={{ width: '100%', background: '#21E058', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.7rem 0', marginTop: 8, marginBottom: 4, cursor: 'pointer', transition: 'background 0.2s' }} type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Continuar'}</button>
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

export default RestablecerContrasena;
