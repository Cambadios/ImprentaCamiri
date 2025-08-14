const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { auth } = require('./middleware/auth');  // Middleware de autenticación
const authController = require('./controllers/authController');  // Controlador de login
const { errorHandler } = require('./middleware/errorHandler');  // Middleware de errores

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// Configuración de CORS
const origins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({
  origin: origins.length ? origins : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ruta de login (No requiere autenticación)
app.post('/api/usuarios/login', authController.login);  // Aquí se usa correctamente la función login

// Ruta para registrar un nuevo usuario (nuevo endpoint)
app.post('/api/usuarios/register', authController.register);  // Ruta para registrar usuarios

// Rutas protegidas que sí requieren autenticación
app.use('/api/usuarios/protected', auth, (req, res) => {
  res.json({ message: 'Acceso autorizado' });
});

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;
