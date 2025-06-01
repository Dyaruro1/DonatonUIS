import React, { useState, useRef, useEffect } from 'react';
import './NotificationBell.css';


export default function NotificationBell({ notifications, onNotificationClick }) {
  const [open, setOpen] = useState(false);
  const [prendaNames, setPrendaNames] = useState({});
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
          const response = await fetch(`/prendas/${id}/nombre/`);
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

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button className="notification-bell-btn" onClick={() => setOpen((v) => !v)}>
        <span role="img" aria-label="notificaciones" style={{ fontSize: 26 }}>🔔</span>
        {notifications && notifications.length > 0 && (
          <span className="notification-bell-badge">{notifications.length}</span>
        )}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-title">Notificaciones</div>
          {notifications && notifications.length > 0 ? (
            notifications.map((n, idx) => (
              <div key={n.id || idx} className="notification-item" onClick={() => onNotificationClick(n)}>
                {console.log('Notificación:', n)}
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
            ))
          ) : (
            <div className="notification-empty">No tienes notificaciones nuevas</div>
          )}
        </div>
      )}
    </div>
  );
}
