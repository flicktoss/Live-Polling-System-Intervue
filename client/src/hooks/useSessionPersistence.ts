import { useEffect } from 'react';
import { socket } from '../socket';

/**
 * Reads a saved session from localStorage and auto-rejoins
 * on page refresh (if not already joined and not kicked).
 */
export function useSessionPersistence(isJoined: boolean, isKicked: boolean): void {
  useEffect(() => {
    const saved = localStorage.getItem('poll_session');
    if (saved && !isJoined && !isKicked) {
      try {
        const { name, role } = JSON.parse(saved);
        if (name && role) {
          if (!socket.connected) {
            socket.connect();
          }
          const emitJoin = () => socket.emit('join', { name, role });
          if (socket.connected) {
            emitJoin();
          } else {
            socket.once('connect', emitJoin);
          }
        }
      } catch {
        localStorage.removeItem('poll_session');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
