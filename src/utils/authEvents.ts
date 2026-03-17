/**
 * A tiny event emitter for auth events.
 * This breaks the circular dependency between client.ts (axios) and useUserStore (Zustand).
 * 
 * Usage:
 *   - client.ts calls `authEvents.emit('logout')` when token refresh fails
 *   - AppNavigator (or any component) calls `authEvents.on('logout', handler)` to listen
 */
type AuthEventType = 'logout';
type AuthEventHandler = () => void;

class AuthEventEmitter {
  private listeners: Record<AuthEventType, AuthEventHandler[]> = {
    logout: [],
  };

  on(event: AuthEventType, handler: AuthEventHandler) {
    this.listeners[event].push(handler);
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    };
  }

  emit(event: AuthEventType) {
    this.listeners[event].forEach(h => h());
  }
}

export const authEvents = new AuthEventEmitter();
