type WSEventType = 'check-connection';
type WSEventHandler = () => void;

class WSEventEmitter {
  private listeners: Record<WSEventType, WSEventHandler[]> = {
    'check-connection': [],
  };

  on(event: WSEventType, handler: WSEventHandler) {
    if (!this.listeners[event]) return () => {};
    this.listeners[event].push(handler);
    return () => {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    };
  }

  emit(event: WSEventType) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(h => h());
  }
}

export const wsEvents = new WSEventEmitter();
