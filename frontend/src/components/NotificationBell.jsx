import React, { useState, useRef } from 'react';
import './NotificationBell.css';

export default function NotificationBell({ notifications, onNotificationClick }) {
  const [open, setOpen] = useState(false);
  const bellRef = useRef();

  // Cierra el panel si se hace click fuera
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
                <div className="notification-msg">{n.message}</div>
                <div className="notification-date">{new Date(n.created_at).toLocaleString()}</div>
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
