const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');  // Ruta de Login
const usuarioRoutes = require('./routes/usuarioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');  // Ruta de Clientes
const pedidoRoutes = require('./routes/pedidoRoutes');  // Ruta de Pedidos
const inventarioRoutes = require('./routes/inventarioRoutes');  // Ruta de Inventario

dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173',  // Cambia esto al puerto de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));  // Configuramos CORS con opciones específicas
app.use(express.json());  // Para procesar JSON en las solicitudes

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Usar las rutas de autenticación, clientes, pedidos e inventario

app.use('/api', usuarioRoutes);
app.use('/api', clienteRoutes);
//app.use('/api', pedidoRoutes);
app.use('/api', inventarioRoutes);
app.use('/api/pedidos', pedidoRoutes);  // Aquí agregamos la ruta del inventario

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
