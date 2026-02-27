import { Server, Socket } from 'socket.io';
import { setupSocketHandlers as setupHandlers } from './index';
import type { ClientToServerEvents, ServerToClientEvents } from '../types';

export const registerSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
): void => {
  // The existing setupSocketHandlers already registers all necessary handlers
  // We just need to ensure it's called for each connection
  console.log(`Socket connected: ${socket.id}`);
};

// Export the main setup function to be used in index.ts
export const setupAllSocketHandlers = (io: Server): void => {
  setupHandlers(io);
};
