import { supabase } from '../supabaseClient';

/**
 * Utility functions for testing the notification system
 * These functions help simulate different notification scenarios
 */

/**
 * Create a test notification manually
 * Useful for testing the UI components without waiting for real events
 */
export const createTestNotification = async (userId, type = 'message', prenda_id = null) => {
  try {
    const testData = {
      user_id: userId,
      type: type,
      title: getTestTitle(type),
      message: getTestMessage(type),
      prenda_id: prenda_id,
      created_ad: new Date().toISOString(),
      is_read: false
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([testData])
      .select();

    if (error) {
      throw error;
    }

    console.log('✅ Test notification created:', data);
    return data[0];
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    throw error;
  }
};

/**
 * Simulate receiving a message from another user
 * This creates both a message and a notification
 */
export const simulateIncomingMessage = async (roomName, receiverUserId, senderUsername = 'TestUser') => {
  try {
    // Extract prenda_id from room name (format: "chat_prenda_123")
    const prenda_id = roomName.match(/chat_prenda_(\d+)/)?.[1];
    
    // Create a test message
    const messageData = {
      room_name: roomName,
      username: senderUsername,
      message: `¡Hola! Estoy interesado en tu prenda. ¿Podríamos conversar? (Mensaje de prueba generado a las ${new Date().toLocaleTimeString()})`,
      user_id: 999, // Fake sender ID for testing
      created_at: new Date().toISOString()
    };

    const { data: messageResult, error: messageError } = await supabase
      .from('messages')
      .insert([messageData])
      .select();

    if (messageError) {
      throw messageError;
    }

    // Create corresponding notification
    const notificationData = {
      user_id: receiverUserId,
      type: 'message',
      title: 'Nuevo mensaje',
      message: `${senderUsername} te ha enviado un mensaje`,
      prenda_id: prenda_id ? parseInt(prenda_id) : null,
      created_ad: new Date().toISOString(),
      is_read: false
    };

    const { data: notificationResult, error: notificationError } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();

    if (notificationError) {
      throw notificationError;
    }

    console.log('✅ Simulated incoming message:', {
      message: messageResult[0],
      notification: notificationResult[0]
    });

    return {
      message: messageResult[0],
      notification: notificationResult[0]
    };
  } catch (error) {
    console.error('❌ Error simulating incoming message:', error);
    throw error;
  }
};

/**
 * Clean up test notifications
 * Removes notifications created for testing purposes
 */
export const cleanupTestNotifications = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .in('title', ['Nuevo mensaje', 'Solicitud de prenda', 'Mensaje de prueba']);

    if (error) {
      throw error;
    }

    console.log('✅ Test notifications cleaned up for user:', userId);
  } catch (error) {
    console.error('❌ Error cleaning up test notifications:', error);
    throw error;
  }
};

/**
 * Create multiple test notifications for stress testing
 */
export const createMultipleTestNotifications = async (userId, count = 5) => {
  try {
    const notifications = [];
    const types = ['message', 'request', 'message', 'request', 'message'];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const notification = await createTestNotification(userId, type, Math.floor(Math.random() * 100) + 1);
      notifications.push(notification);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Created ${count} test notifications`);
    return notifications;
  } catch (error) {
    console.error('❌ Error creating multiple test notifications:', error);
    throw error;
  }
};

// Helper functions
const getTestTitle = (type) => {
  const titles = {
    message: 'Nuevo mensaje',
    request: 'Solicitud de prenda',
    default: 'Notificación de prueba'
  };
  return titles[type] || titles.default;
};

const getTestMessage = (type) => {
  const messages = {
    message: 'Has recibido un nuevo mensaje en el chat',
    request: 'Alguien ha solicitado una de tus prendas',
    default: 'Esta es una notificación de prueba del sistema'
  };
  return messages[type] || messages.default;
};

/**
 * Test if notifications are working correctly
 * Returns a health check status
 */
export const testNotificationSystem = async (userId) => {
  try {
    console.log('🔍 Testing notification system...');
    
    // 1. Test creating a notification
    const testNotification = await createTestNotification(userId, 'message');
    
    // 2. Test reading notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_ad', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    // 3. Test marking as read
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', testNotification.id);

    if (updateError) {
      throw updateError;
    }

    // 4. Clean up test
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', testNotification.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ Notification system test passed!');
    return {
      status: 'success',
      message: 'All notification system components are working correctly',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Notification system test failed:', error);
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
