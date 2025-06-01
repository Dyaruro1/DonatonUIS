import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../hooks/use-notifications';
import { useUserRooms } from '../hooks/use-user-rooms';
import NotificationBell from './NotificationBell';
import './NotificationHeader.css';

/**
 * Componente de header con notificaciones
 * Úsalo en cualquier página que necesite mostrar notificaciones
 */
function NotificationHeader({ title = "DonatonUIS", showBackButton = false }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  // Obtener rooms del usuario
  const userRooms = useUserRooms(currentUser?.username);
  // Obtener notificaciones del usuario actual y rooms
  const notifications = useNotifications(currentUser?.username, 5, userRooms);
  
  // Manejar click en notificación
  const handleNotificationClick = (notification) => {
    console.log('Notificación clickeada:', notification);
    
    // Si la notificación tiene prenda_id, navegar al chat correspondiente
    if (notification.prenda_id) {
      // Aquí podrías navegar al chat o página específica
      navigate(`/chat-donante`, { 
        state: { 
          prenda: { id: notification.prenda_id },
          fromNotification: true 
        } 
      });
    }
    
    // Opcional: marcar como leída
    // markNotificationAsRead(notification.id);
  };

  const handleBackButton = () => {
    navigate(-1);
  };

  if (!currentUser) {
    return (
      <header className="notification-header">
        <div className="notification-header-content">
          <h1 className="notification-header-title">{title}</h1>
        </div>
      </header>
    );
  }

  return (
    <header className="notification-header">
      <div className="notification-header-content">
        {showBackButton && (
          <button 
            className="notification-header-back"
            onClick={handleBackButton}
            title="Volver"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <h1 className="notification-header-title">{title}</h1>
        
        <div className="notification-header-actions">
          {/* Usuario actual */}
          <div className="notification-header-user">
            <img 
              src={currentUser.foto || '/logo-pequeno.svg'} 
              alt="Avatar" 
              className="notification-header-avatar"
            />
            <span className="notification-header-username">{currentUser.username}</span>
          </div>
          
          {/* Campana de notificaciones */}
          <NotificationBell 
            notifications={notifications.filter(n => !n.read)} // solo no leídas
            onNotificationClick={handleNotificationClick}
          />
        </div>
      </div>
    </header>
  );
}

export default NotificationHeader;
