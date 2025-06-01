# Sistema de Notificaciones - DonatonUIS

## 📋 Descripción del Sistema

El sistema de notificaciones de DonatonUIS está diseñado para mantener a los usuarios informados sobre eventos importantes en tiempo real, especialmente cuando reciben nuevos mensajes de otros usuarios.

## 🔧 Características Implementadas

### ✅ Completado
1. **Notificaciones automáticas de mensajes** - El sistema detecta automáticamente cuando un usuario recibe un nuevo mensaje y crea una notificación
2. **Monitoreo en tiempo real** - Utiliza Supabase Realtime para escuchar cambios en la tabla de mensajes
3. **Integración en páginas clave** - El hook de notificaciones está activo en:
   - FeedPrendas.jsx (página principal)
   - SolicitudPrenda.jsx (donde se envían mensajes)
   - ChatDonante.jsx (interfaz de chat)
4. **Página de pruebas** - Página dedicada para probar el sistema de notificaciones
5. **Componente de campana** - Componente reutilizable para mostrar notificaciones

### 🛠️ Archivos Implementados

```
frontend/src/
├── hooks/
│   ├── use-notifications.js          # Hook para mostrar notificaciones
│   └── use-message-notifications.js  # Hook para monitorear mensajes
├── services/
│   └── notifications.js              # Servicio para crear notificaciones
├── components/
│   └── NotificationBell.jsx          # Componente de campana de notificaciones
├── pages/
│   └── NotificationTestPage.jsx      # Página de pruebas
└── supabase-notifications-setup.sql  # Script SQL para Supabase
```

## 🗄️ Configuración de Base de Datos

### 1. Crear tabla de notificaciones en Supabase

Ejecuta el siguiente script en el editor SQL de Supabase:

```sql
-- Crear tabla de notificaciones si no existe
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  sender_id BIGINT NULL,
  prenda_id BIGINT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_ad TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_ad ON notifications(created_ad);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Habilitar RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propias notificaciones
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Política para permitir insertar notificaciones (para el sistema)
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON notifications
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualizar notificaciones (marcar como leídas)
CREATE POLICY IF NOT EXISTS "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);
```

### 2. Verificar tabla de mensajes

Asegúrate de que tu tabla `messages` tenga estos campos:
- `username` (string): nombre del usuario que envía
- `user_destino` (string): nombre del usuario que recibe
- `content` (text): contenido del mensaje
- `room` (string): nombre de la sala/chat
- `created_at` (timestamp): fecha de creación

## 🚀 Cómo Usar el Sistema

### 1. Activar notificaciones en una página

```jsx
import { useMessageNotifications } from '../hooks/use-message-notifications';

function MiPagina() {
  // Simplemente llama al hook - no necesita props
  useMessageNotifications();
  
  return (
    <div>Mi contenido...</div>
  );
}
```

### 2. Mostrar notificaciones existentes

```jsx
import { useNotifications } from '../hooks/use-notifications';
import NotificationBell from '../components/NotificationBell';

function MiComponente() {
  const { currentUser } = useContext(AuthContext);
  const notifications = useNotifications(currentUser?.id, 5); // últimas 5 notificaciones
  
  const handleNotificationClick = (notification) => {
    // Manejar click en notificación
    console.log('Notificación clickeada:', notification);
    // Navegar a chat, marcar como leída, etc.
  };
  
  return (
    <div>
      <NotificationBell 
        notifications={notifications} 
        onNotificationClick={handleNotificationClick} 
      />
    </div>
  );
}
```

### 3. Crear notificaciones manualmente

```jsx
import { createNotification } from '../services/notifications';

const crearNotificacion = async () => {
  await createNotification({
    user_id: targetUserId,
    sender_id: senderUserId, // opcional
    prenda_id: prendaId,     // opcional
    message: "Tu mensaje de notificación aquí"
  });
};
```

## 🧪 Probar el Sistema

### 1. Página de Pruebas
Ve a `http://localhost:5174/test-notifications` para:
- Crear notificaciones de prueba
- Simular mensajes automáticos
- Ver notificaciones existentes
- Marcar notificaciones como leídas

### 2. Pruebas Manuales
1. Inicia sesión con dos usuarios diferentes
2. Ve a una página con chat (ej: SolicitudPrenda)
3. Envía un mensaje desde el primer usuario
4. Verifica que el segundo usuario reciba una notificación automática

## ⚙️ Configuración Avanzada

### Variables de Entorno
Asegúrate de tener configuradas las variables de Supabase en tu `.env`:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
```

### Personalización del Sistema

#### Cambiar el límite de notificaciones mostradas:
```jsx
const notifications = useNotifications(userId, 10); // mostrar 10 en lugar de 3
```

#### Filtrar notificaciones por tipo:
Puedes modificar el hook `use-notifications.js` para agregar filtros:
```jsx
// En use-notifications.js
.eq('type', 'message') // solo notificaciones de mensaje
.eq('read', false)     // solo no leídas
```

#### Personalizar el mensaje de notificación:
Modifica la función en `use-message-notifications.js`:
```jsx
message: `${senderName} te envió un mensaje${prendaId ? ` sobre una prenda` : ''}`
```

## 🐛 Solución de Problemas

### Problema: Las notificaciones no aparecen
1. Verifica que la tabla `notifications` existe en Supabase
2. Verifica que las políticas RLS están configuradas correctamente
3. Revisa la consola del navegador para errores

### Problema: Errores de campo `created_ad`
- El sistema usa `created_ad` en lugar de `created_at` para evitar conflictos
- Si cambias el nombre del campo, actualiza todos los archivos relevantes

### Problema: Usuario no definido
- Asegúrate de que `AuthContext` esté proporcionando `currentUser` correctamente
- Verifica que el usuario tiene `id` y `username`

## 📋 Próximas Mejoras

### Funcionalidades Pendientes
1. **Mejoras en identificación del remitente** - Resolver ID de usuario en lugar de usar solo username
2. **Notificaciones push** - Agregar notificaciones del navegador
3. **Tipos de notificación** - Diferentes tipos para mensajes, solicitudes, donaciones, etc.
4. **Configuración de usuario** - Permitir activar/desactivar tipos de notificaciones
5. **Notificaciones por email** - Enviar resúmenes por correo
6. **Historial completo** - Página dedicada para ver todas las notificaciones

### Optimizaciones Técnicas
1. **Caché de notificaciones** - Implementar caché local para mejor rendimiento
2. **Paginación** - Para usuarios con muchas notificaciones
3. **Limpieza automática** - Eliminar notificaciones antiguas
4. **Métricas** - Tracking de notificaciones leídas/no leídas

## 📞 Soporte

Si encuentras problemas o necesitas ayuda:
1. Revisa la consola del navegador para errores
2. Verifica la configuración de Supabase
3. Prueba el sistema en la página de pruebas (`/test-notifications`)
4. Revisa que todas las dependencias estén instaladas correctamente
