import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './NotificationBell.css';


export default function NotificationBell({ notifications, onNotificationClick }) {
  const [open, setOpen] = useState(false);
  const [prendaNames, setPrendaNames] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const bellRef = useRef();
  

  // Cierra el panel si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Cargar nombres de publicaciones desde el backend
  useEffect(() => {
    const fetchPrendaNames = async () => {
      const prendaIds = notifications.map((n) => n.prenda_id).filter(Boolean);
      const uniqueIds = [...new Set(prendaIds)];

      const namesMap = {};
      for (const id of uniqueIds) {
        try {
          // console.log(`Fetching prenda name for ID: ${id}`);
          const response = await fetch(`http://localhost:8000/api/prendas/${id}/nombre/`);
          // console.log(`Response for ID ${id}:`, response);
          if (response.ok) {
            const data = await response.json();
            namesMap[id] = data.nombre;
          } else {
            console.error(`Error fetching prenda name for ID ${id}`);
          }
        } catch (error) {
          console.error(`Error fetching prenda name for ID ${id}:`, error);
        }
      }
      setPrendaNames(namesMap);
    };

    if (notifications.length > 0) {
      fetchPrendaNames();
    }
  }, [notifications]);

  // Consultar el total de no leídas para el usuario
  useEffect(() => {
    async function fetchTotalUnread() {
      if (notifications.length > 0 && notifications[0]?.user_destiny) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_destiny', notifications[0].user_destiny)
          .eq('read', false);
        if (!error) setTotalUnread(count || 0);
      } else {
        setTotalUnread(0);
      }
    }
    fetchTotalUnread();
  }, [notifications]);

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button className="notification-bell-btn" onClick={() => setOpen((v) => !v)}>
        <span role="img" aria-label="notificaciones" style={{ fontSize: 26 }}>🔔</span>
        {totalUnread > 0 && (
          <span className="notification-bell-badge">{totalUnread}</span>
        )}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-title">Notificaciones</div>
          {notifications && notifications.filter(n => !n.read).length > 0 ? (
            <>
              {notifications.filter(n => !n.read).map((n, idx) => (
                <div key={n.id || idx} className="notification-item" onClick={async () => {
                  const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('id', n.id);
                  if (error) {
                    console.error('Error actualizando notificación en la base de datos:', error);
                  }
                  onNotificationClick(n);
                }}>
                  <div className="notification-msg">
                    {n.user_sender
                      ? `${n.user_sender} te ha enviado un mensaje sobre la publicación "${prendaNames[n.prenda_id] || 'Cargando...'}"!`
                      : n.texto || n.message}
                  </div>
                  <div className="notification-date">{
                    n.created_at && !isNaN(new Date(n.created_at))
                      ? new Date(n.created_at).toLocaleString()
                      : 'Fecha no disponible'
                  }</div>
                </div>
              ))}
              <button
                onClick={async () => {
                  // Marcar todas como leídas en la base de datos para el usuario
                  const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('user_destiny', notifications[0]?.user_destiny);
                  if (error) {
                    console.error('Error al borrar notificaciones:', error);
                  } else {
                    // Forzar refresco local: quitar todas las no leídas de la vista
                    window.location.reload(); // Solución rápida para forzar el refresco del hook
                  }
                }}
                style={{
                  width: '100%',
                  background: '#eee',
                  color: '#222',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 0',
                  marginTop: 8,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Borrar notificaciones
              </button>
            </>
          ) : (
            <div className="notification-empty">No tienes notificaciones nuevas</div>
          )}
        </div>
      )}
    </div>
  );
}
