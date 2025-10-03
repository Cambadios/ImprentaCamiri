require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('Falta MONGO_URI en .env');
  }
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  // Crear un servidor HTTP para WebSocket
  const server = http.createServer(app);

  // Inicializar Socket.IO
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173", // URL de tu frontend Vite
      methods: ["GET", "POST"]
    }
  });

  // Conectar al WebSocket
  io.on('connection', (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    // Evento para recibir y reenviar mensajes
    socket.on('mensaje', (data) => {
      console.log("📩 Mensaje recibido:", data);
      io.emit('mensaje', data); // Enviar el mensaje a todos los clientes conectados
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
  });

  // Iniciar el servidor en el puerto especificado
  server.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Error al iniciar:', err);
  process.exit(1);
});