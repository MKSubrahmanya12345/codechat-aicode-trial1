// ??$$$ Custom hook for socket.io events
import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';

const useSocket = (eventHandlers = {}) => {
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    const socket = connectSocket();

    // Register event handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Cleanup event handlers
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, []);

  return getSocket();
};

export default useSocket;
