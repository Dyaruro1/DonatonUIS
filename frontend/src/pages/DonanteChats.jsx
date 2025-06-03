import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./FeedPrendas.css";

function DonanteChats() {
  const location = useLocation();
  const navigate = useNavigate();
  // Se espera que la prenda se pase por location.state.prenda
  const prenda = location.state?.prenda;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNav = (route) => {
    navigate(route);
  };  useEffect(() => {
    
    if (!prenda?.id) {
      setError("No se encontró la información de la prenda.");
      setLoading(false);
      return;
    }// Traer todos los mensajes de la prenda
    supabase
      .from("messages")
      .select("*")
      .eq("prenda_id", prenda.id)      .then(({ data, error }) => {
        if (error) {
          setError("Error al cargar los chats");
        } else if (!data || data.length === 0) {
          // No hay mensajes para esta prenda
          setChats([]);        } else {
          // Agrupar por usuario solicitante (no el donante)
          // El room puede tener varios formatos:
          // 1. Nuevo formato: `${prenda.id}${username}` 
          // 2. Formato antiguo: solo el ID de la prenda (número)
          // 3. null o undefined
          const chatsMap = {};
            data.forEach((msg) => {
            let usernameSolicitante = null;
            
            // Obtener el username del donante para comparaciones
            const donanteUsername = prenda.donante?.username || prenda.donante?.nombre || prenda.usuario?.username || prenda.usuario?.nombre || '';
            
            // Caso 1: Room con formato nuevo `${prenda.id}${username}`
            if (msg.room && typeof msg.room === 'string' && prenda.id) {
              const room = msg.room.toString();
              const prendaIdStr = prenda.id.toString();
              
              // Si el room comienza con el ID de la prenda y tiene más caracteres
              if (room.startsWith(prendaIdStr) && room.length > prendaIdStr.length) {
                usernameSolicitante = room.substring(prendaIdStr.length);
              }              // Si el room es exactamente el ID de la prenda (formato antiguo)
              else if (room === prendaIdStr) {
                // Para el formato antiguo, usar el username del mensaje si no es el donante
                if (msg.username && msg.username !== donanteUsername) {
                  usernameSolicitante = msg.username;
                }
              }
            }
            // Caso 2: Room es null o undefined, usar el username del mensaje si no es el donante
            else if (msg.username && msg.username !== donanteUsername) {
              usernameSolicitante = msg.username;
            }
            
            // Si no pudimos extraer un username válido, omitir este mensaje
            if (!usernameSolicitante || usernameSolicitante.trim() === "") {
              return;
            }
            
            // Agrupar por username
            if (!chatsMap[usernameSolicitante]) {
              chatsMap[usernameSolicitante] = {
                username: usernameSolicitante,
                lastMessage: msg,
                messages: [msg],
              };
            } else {
              chatsMap[usernameSolicitante].messages.push(msg);
              // Actualizar último mensaje si es más reciente
              if (
                new Date(msg.created_at) >
                new Date(chatsMap[usernameSolicitante].lastMessage.created_at)
              ) {
                chatsMap[usernameSolicitante].lastMessage = msg;
              }
            }
          });
          setChats(Object.values(chatsMap));
        }
        setLoading(false);
      });
  }, [prenda]);
  if (!prenda) {
    return (
      <div style={{ color: "#fff", background: "#18192b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h2>No se encontró la información de la prenda.</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18192b', color: '#fff', padding: 0 }}>
      {/* MODAL DE CONFIRMACIÓN LOGOUT */}
      {showLogoutModal && (
        <>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
          }}></div>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 201,
          }}>
            <div style={{
              background: '#23233a',
              borderRadius: 18,
              boxShadow: '0 2px 32px 0 #0004',
              padding: '2.2rem 2.5rem 2rem 2.5rem',
              minWidth: 340,
              maxWidth: 400,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ff3b3b', fontWeight: 700, fontSize: '1.18rem', marginBottom: 10 }}>
                ¿Seguro que deseas cerrar sesión?
              </div>
              <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                Se cerrará tu sesión y perderás el acceso temporal a tu cuenta. Puedes volver a iniciar sesión cuando lo necesites.
              </div>
              <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                <button
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  Sí
                </button>
                <button
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => setShowLogoutModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* NAVBAR HORIZONTAL COHERENTE */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', marginBottom: '1.2rem', width: '100%' }}>
        <button className={`feed-navbar-btn feed-navbar-btn-active`} style={{ background: '#21e058', color: '#18192b' }} onClick={() => navigate('/feed')}>
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
          style={{ background: 'transparent', color: '#ff6b6b', border: 'none', borderRadius: '50%', padding: '0.7rem', fontWeight: 600, fontSize: '1.55rem', marginLeft: '2.5rem', cursor: 'pointer' }}
          onClick={() => setShowLogoutModal(true)}
          title="Cerrar sesión"
        >
          <i className="fa fa-sign-out-alt" style={{ fontSize: 28 }}></i>
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button 
            onClick={() => navigate('/feed')} 
            style={{ background: '#23233a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Volver al feed
          </button>
        </div>
        
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.1rem', margin: '0 0 32px 0' }}>
          Chats de "{prenda.nombre}"
        </h1>
        
        {loading ? (
          <div style={{ color: "#7ee787", fontSize: '1.1rem', textAlign: 'center', margin: '2rem 0' }}>Cargando chats...</div>
        ) : error ? (
          <div style={{ color: "#ff6b6b", fontSize: '1.1rem', textAlign: 'center', margin: '2rem 0' }}>{error}</div>
        ) : chats.length === 0 ? (
          <div style={{ 
            background: '#23244a', 
            borderRadius: 16, 
            padding: '2.5rem', 
            textAlign: 'center',
            color: '#babcc4',
            fontSize: '1.1rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <div>Aún no tienes chats para esta publicación.</div>
            <div style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>Los chats aparecerán cuando alguien te escriba.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chats.map((chat, index) => (
              <div 
                key={chat.username}
                style={{
                  background: '#23244a',
                  borderRadius: 16,
                  padding: '1.5rem',
                  border: '1px solid #2a2b4f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#2a2b4f';
                  e.currentTarget.style.borderColor = '#21e058';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#23244a';
                  e.currentTarget.style.borderColor = '#2a2b4f';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#21e058', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#18192b',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}>
                      {chat.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#21e058', fontSize: '1.1rem' }}>
                        {chat.username}
                      </div>
                      <div style={{ color: '#babcc4', fontSize: '0.9rem' }}>
                        {new Date(chat.lastMessage.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    color: '#fff', 
                    fontSize: '1rem',
                    backgroundColor: '#191a2e',
                    padding: '0.5rem 1rem',
                    borderRadius: 8,
                    marginLeft: 52
                  }}>
                    "{chat.lastMessage.content}"
                  </div>
                </div>
                <button
                  style={{ 
                    background: '#21e058', 
                    color: '#18192b', 
                    border: 'none', 
                    borderRadius: 8, 
                    padding: '0.8rem 1.5rem', 
                    fontWeight: 600, 
                    fontSize: '1rem', 
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginLeft: '1rem'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/donante/chat", {
                      state: {
                        prenda,
                        solicitante: chat.username,
                      },
                    });
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#7ee787'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#21e058'}
                >
                  Ver chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DonanteChats;
