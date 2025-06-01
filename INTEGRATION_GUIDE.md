# 🔔 Notification System Integration Guide

This guide shows you how to integrate the notification system into any page of your DonatonUIS application.

## Quick Start

### 1. Basic Integration (Existing Pattern)

The simplest way to add notifications to a page:

```jsx
// In your page component imports
import { useNotifications } from '../hooks/use-notifications';
import { useMessageNotifications } from '../hooks/use-message-notifications';
import NotificationBell from '../components/NotificationBell';

// In your component
function YourPage() {
  const { currentUser } = useContext(AuthContext);
  const notifications = useNotifications(currentUser?.id, 5);
  
  // Initialize message notifications monitoring
  useMessageNotifications();

  const handleNotificationClick = (notification) => {
    // Handle notification click - navigate to related content
    if (notification.prenda_id) {
      navigate(`/prenda/${notification.prenda_id}`);
    }
  };

  return (
    <div>
      {/* Your page header */}
      <header>
        <NotificationBell 
          notifications={notifications} 
          onNotificationClick={handleNotificationClick} 
        />
      </header>
      {/* Rest of your page */}
    </div>
  );
}
```

### 2. Advanced Integration (New Pattern)

For a more complete notification experience, use the NotificationHeader component:

```jsx
// In your page component imports
import NotificationHeader from '../components/NotificationHeader';
import { useMessageNotifications } from '../hooks/use-message-notifications';

// In your component
function YourPage() {
  // Initialize message notifications monitoring
  useMessageNotifications();

  return (
    <div>
      {/* Add this after your navigation but before main content */}
      <NotificationHeader />
      
      {/* Your main page content */}
      <main>
        {/* Your content here */}
      </main>
    </div>
  );
}
```

## Integration Examples

### Example 1: FeedPrendas Page (Already Integrated)

```jsx
// c:\Users\gutie\Documents\GitHub\DonatonUIS\frontend\src\pages\FeedPrendas.jsx
import NotificationHeader from '../components/NotificationHeader';
import { useMessageNotifications } from '../hooks/use-message-notifications';

function FeedPrendas() {
  // Initialize message notifications monitoring
  useMessageNotifications();

  return (
    <div className="feed-root">
      <main className="feed-main">
        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          {/* Navigation buttons here */}
        </div>
        
        {/* NOTIFICATION HEADER - This provides complete notification experience */}
        <NotificationHeader />
        
        {/* Rest of the page content */}
        <header className="feed-header">
          {/* Search and filters */}
        </header>
        {/* ... */}
      </main>
    </div>
  );
}
```

### Example 2: Chat Pages (SolicitudPrenda, ChatDonante)

```jsx
// For chat-related pages, you only need the monitoring hook
import { useMessageNotifications } from '../hooks/use-message-notifications';

function ChatPage() {
  // This automatically creates notifications when messages arrive
  useMessageNotifications();

  return (
    <div>
      {/* Your chat UI */}
    </div>
  );
}
```

### Example 3: Profile/Settings Pages

```jsx
// For user-centric pages, add full notification support
import NotificationHeader from '../components/NotificationHeader';
import { useMessageNotifications } from '../hooks/use-message-notifications';

function ProfilePage() {
  useMessageNotifications();

  return (
    <div>
      {/* Navigation */}
      <nav>
        {/* Your navigation */}
      </nav>
      
      {/* Notification header for better UX */}
      <NotificationHeader />
      
      {/* Profile content */}
      <main>
        {/* Your profile content */}
      </main>
    </div>
  );
}
```

## Component Reference

### NotificationHeader

A complete header component that includes:
- User avatar and info
- Notification bell with badge
- Click handlers for navigation
- Modern styling with gradient background

**Props:** None (uses context automatically)

**CSS:** Automatically includes `NotificationHeader.css`

### NotificationBell

A simple notification bell icon with badge.

**Props:**
- `notifications`: Array of notification objects
- `onNotificationClick`: Function to handle notification clicks

### useNotifications Hook

Fetches and manages notifications for a user.

**Parameters:**
- `userId`: The user ID to fetch notifications for
- `limit`: Maximum number of notifications to fetch (default: 10)

**Returns:**
- Array of notification objects

### useMessageNotifications Hook

Monitors incoming messages and automatically creates notifications.

**Parameters:** None (uses current user from context)

**Side Effects:**
- Listens to Supabase real-time messages
- Creates notifications when user receives messages
- Handles prenda_id extraction from room names

## Database Schema

Make sure your Supabase database includes the notifications table:

```sql
-- Run this SQL in your Supabase SQL editor
-- (Already included in supabase-notifications-setup.sql)

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) DEFAULT 'message',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  prenda_id INTEGER,
  sender_id INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_ad TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### Manual Testing
1. Visit `/test-notifications` to test the system manually
2. Use the enhanced testing suite to create various notification scenarios
3. Test cross-user functionality by having multiple users in different browsers

### Automated Testing
```jsx
import { testNotificationSystem } from '../services/notification-testing';

// In your test or development code
const runTest = async () => {
  const result = await testNotificationSystem(userId);
  console.log('Test result:', result);
};
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check that `useMessageNotifications()` is called in the component
2. **Database errors**: Ensure the notifications table exists and has proper RLS policies
3. **Real-time not working**: Verify Supabase connection and that the user is authenticated
4. **Styling issues**: Make sure CSS files are imported correctly

### Debug Mode

Add this to any component to see notification system status:

```jsx
const notifications = useNotifications(userId, 10);
console.log('Current notifications:', notifications);
console.log('User ID:', userId);
```

## Best Practices

1. **Always call `useMessageNotifications()`** in pages where users might receive messages
2. **Use NotificationHeader** for main application pages
3. **Use NotificationBell** for simpler integration needs
4. **Handle notification clicks** appropriately (navigate to related content)
5. **Test with multiple users** to ensure cross-user functionality
6. **Clean up test data** regularly in development

## File References

- **Hooks**: `src/hooks/use-notifications.js`, `src/hooks/use-message-notifications.js`
- **Components**: `src/components/NotificationBell.jsx`, `src/components/NotificationHeader.jsx`
- **Services**: `src/services/notifications.js`, `src/services/notification-testing.js`
- **Testing**: `src/pages/NotificationTestPage.jsx`
- **Database**: `supabase-notifications-setup.sql`
- **Documentation**: `NOTIFICACIONES_README.md`
