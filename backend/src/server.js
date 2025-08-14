// src/server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('Falta MONGO_URI en .env');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Error al iniciar:', err);
  process.exit(1);
});
