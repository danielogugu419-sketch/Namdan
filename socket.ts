import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('NEMDAN Real-time Socket connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection warning (using HTTP fallback):', err.message);
    });
  }
  return socket;
}
