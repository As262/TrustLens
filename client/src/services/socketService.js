import io from 'socket.io-client';

let socket = null;

export const socketService = {
  connect: (userId) => {
    socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      socket.emit('userConnected', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
    }
  },

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  },

  off: (event) => {
    if (socket) {
      socket.off(event);
    }
  },

  getSocket: () => socket,
};

export default socketService;
