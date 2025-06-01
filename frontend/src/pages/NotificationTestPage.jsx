import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../hooks/use-notifications';
import { useMessageNotifications } from '../hooks/use-message-notifications';
import { createNotification } from '../services/notifications';
import { 
  createTestNotification as createTestNotif, 
  simulateIncomingMessage, 
  cleanupTestNotifications,
  createMultipleTestNotifications,
  testNotificationSystem
} from '../services/notification-testing';
import { supabase } from '../supabaseClient';

function NotificationTestPage() {
  const { currentUser } = useContext(AuthContext);
  const notifications = useNotifications(currentUser?.id, 10);
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Activar el hook de notificaciones de mensajes
  useMessageNotifications();

  // Función para crear una notificación de prueba
  const createTestNotification = async () => {
    if (!currentUser || !testMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await createNotification({
        user_id: currentUser.id,
        sender_id: null,
        prenda_id: null,
        message: testMessage.trim()
      });

      if (result.error) {
        console.error('Error creando notificación de prueba:', result.error);
        alert('Error creando notificación: ' + result.error.message);
      } else {
        console.log('Notificación de prueba creada exitosamente');
        setTestMessage('');
        alert('Notificación de prueba creada exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
    setIsLoading(false);
  };

  // Función para simular un mensaje en Supabase (para probar las notificaciones automáticas)
  const simulateMessage = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const result = await supabase.from('messages').insert({
        username: 'test_sender',
        user_destino: currentUser.username,
        content: 'Este es un mensaje de prueba para generar una notificación automática',
        room: 'test_room_prenda_123',
        created_at: new Date().toISOString()
      });

      if (result.error) {
        console.error('Error simulando mensaje:', result.error);
        alert('Error simulando mensaje: ' + result.error.message);
      } else {
        console.log('Mensaje simulado exitosamente');
        alert('Mensaje simulado exitosamente. Deberías ver una notificación automática.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
    setIsLoading(false);
  };

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      const result = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (result.error) {
        console.error('Error marcando como leída:', result.error);
      } else {
        console.log('Notificación marcada como leída');
      }
    } catch (error) {
      console.error('Error:', error);
    }  };

  // Enhanced testing functions using notification-testing.js
  const runQuickTest = async () => {
    setIsLoading(true);
    try {
      const result = await createTestNotif(currentUser.id, 'message', 123);
      alert('✅ Test notification created successfully!');
      console.log('Test notification:', result);
    } catch (error) {
      console.error('❌ Test failed:', error);
      alert('❌ Test failed: ' + error.message);
    }
    setIsLoading(false);
  };

  const simulateChat = async () => {
    setIsLoading(true);
    try {
      const result = await simulateIncomingMessage('chat_prenda_456', currentUser.id, 'TestDonor');
      alert('✅ Chat simulation completed! Check your notifications.');
      console.log('Simulated chat:', result);
    } catch (error) {
      console.error('❌ Chat simulation failed:', error);
      alert('❌ Chat simulation failed: ' + error.message);
    }
    setIsLoading(false);
  };

  const createBulkTests = async () => {
    setIsLoading(true);
    try {
      const notifications = await createMultipleTestNotifications(currentUser.id, 5);
      alert(`✅ Created ${notifications.length} test notifications!`);
      console.log('Bulk notifications:', notifications);
    } catch (error) {
      console.error('❌ Bulk test failed:', error);
      alert('❌ Bulk test failed: ' + error.message);
    }
    setIsLoading(false);
  };

  const runSystemTest = async () => {
    setIsLoading(true);
    try {
      const result = await testNotificationSystem(currentUser.id);
      if (result.status === 'success') {
        alert('✅ System test passed! All components working correctly.');
      } else {
        alert('❌ System test failed: ' + result.message);
      }
      console.log('System test result:', result);
    } catch (error) {
      console.error('❌ System test error:', error);
      alert('❌ System test error: ' + error.message);
    }
    setIsLoading(false);
  };

  const cleanupTests = async () => {
    setIsLoading(true);
    try {
      await cleanupTestNotifications(currentUser.id);
      alert('✅ Test notifications cleaned up successfully!');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      alert('❌ Cleanup failed: ' + error.message);
    }
    setIsLoading(false);
  };

  if (!currentUser) {
    return (
      <div style={{ padding: 20, color: '#fff', background: '#18192b', minHeight: '100vh' }}>
        <h1>Página de Prueba de Notificaciones</h1>
        <p>Debes iniciar sesión para probar las notificaciones.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: '#fff', background: '#18192b', minHeight: '100vh' }}>
      <h1>Página de Prueba de Notificaciones</h1>
      <p>Usuario actual: {currentUser.username} (ID: {currentUser.id})</p>
      
      <div style={{ marginBottom: 30, padding: 20, background: '#23233a', borderRadius: 8 }}>
        <h2>Crear Notificación de Prueba</h2>
        <div style={{ marginBottom: 15 }}>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Mensaje de la notificación de prueba"
            style={{
              width: '300px',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #444',
              background: '#2a2a3a',
              color: '#fff'
            }}
          />
        </div>
        <button
          onClick={createTestNotification}
          disabled={isLoading || !testMessage.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            background: '#3151cf',
            color: '#fff',
            cursor: 'pointer',
            marginRight: 10
          }}
        >
          {isLoading ? 'Creando...' : 'Crear Notificación de Prueba'}
        </button>

        <button
          onClick={simulateMessage}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            background: '#21e058',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Simulando...' : 'Simular Mensaje Automático'}        </button>
      </div>

      {/* Enhanced Testing Section */}
      <div style={{ marginBottom: 30, padding: 20, background: '#1e3a1e', borderRadius: 8, border: '1px solid #21e058' }}>
        <h2 style={{ color: '#21e058' }}>🧪 Enhanced Testing Suite</h2>
        <p style={{ color: '#babcc4', marginBottom: 20 }}>Advanced testing tools for comprehensive notification system validation</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={runQuickTest}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: '#7b5cff',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Quick Test
          </button>

          <button
            onClick={simulateChat}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: '#ff6b6b',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Simulate Chat Message
          </button>

          <button
            onClick={createBulkTests}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: '#ffb300',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Create 5 Test Notifications
          </button>

          <button
            onClick={runSystemTest}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: '#21e058',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Run System Test
          </button>

          <button
            onClick={cleanupTests}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              background: '#8b1e1e',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🧹 Cleanup Test Data
          </button>
        </div>
      </div>

      <div style={{ padding: 20, background: '#23233a', borderRadius: 8 }}>
        <h2>Notificaciones Actuales ({notifications.length})</h2>
        {notifications.length === 0 ? (
          <p style={{ color: '#babcc4' }}>No hay notificaciones.</p>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: 15,
                  marginBottom: 10,
                  background: notification.read ? '#1c1d2e' : '#2a2a3a',
                  borderRadius: 6,
                  border: notification.read ? '1px solid #333' : '1px solid #3151cf'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, marginBottom: 5 }}>{notification.message}</p>
                    <small style={{ color: '#babcc4' }}>
                      {new Date(notification.created_ad).toLocaleString()}
                      {notification.prenda_id && ` • Prenda ID: ${notification.prenda_id}`}
                      {notification.sender_id && ` • Sender ID: ${notification.sender_id}`}
                    </small>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: '#7b5cff',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, padding: 15, background: '#2a2a3a', borderRadius: 6 }}>
        <h3>Instrucciones de Prueba:</h3>
        <ol style={{ color: '#babcc4' }}>
          <li>Usa "Crear Notificación de Prueba" para crear una notificación manual</li>
          <li>Usa "Simular Mensaje Automático" para simular un mensaje que active el sistema automático</li>
          <li>Ve a otra página con chat y envía mensajes para probar en tiempo real</li>
          <li>Las notificaciones no leídas aparecen con borde azul</li>
          <li>Puedes marcar notificaciones como leídas</li>
        </ol>
      </div>
    </div>
  );
}

export default NotificationTestPage;
