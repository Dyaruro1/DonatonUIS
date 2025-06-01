-- Script para crear la tabla de notificaciones en Supabase
-- Ejecutar este script en el editor SQL de Supabase

-- Crear tabla de notificaciones si no existe
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  sender_id BIGINT NULL,
  prenda_id BIGINT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
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

-- Comentarios para documentar la tabla
COMMENT ON TABLE notifications IS 'Tabla para almacenar notificaciones del sistema';
COMMENT ON COLUMN notifications.user_id IS 'ID del usuario que recibe la notificación';
COMMENT ON COLUMN notifications.sender_id IS 'ID del usuario que envía/causa la notificación (opcional)';
COMMENT ON COLUMN notifications.prenda_id IS 'ID de la prenda relacionada con la notificación (opcional)';
COMMENT ON COLUMN notifications.message IS 'Mensaje de la notificación';
COMMENT ON COLUMN notifications.read IS 'Si la notificación ha sido leída';
COMMENT ON COLUMN notifications.created_at IS 'Fecha y hora de creación de la notificación';
