// ??$$$ Socket.io client singleton
// ??$$$ VITE_SOCKET_URL: localhost in dev, Render URL in prod
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // ??$$$ polling first for Render free tier, upgrades to websocket
      transports: ['polling', 'websocket'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export default { getSocket, connectSocket, disconnectSocket };
