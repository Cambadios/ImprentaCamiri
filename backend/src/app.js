// En app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');  // Importa todas las rutas desde 'routes/index.js'
const { errorHandler } = require('./middleware/errorHandler');  // Middleware de errores

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// Configuración de CORS
const allowedOrigins = ['http://localhost:5173']; // Asegúrate de que el frontend esté en este puerto
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Permite el uso de cookies o encabezados de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Usa el enrutador importado en lugar de definir las rutas manualmente
app.use('/api', routes);  // Monta las rutas en el prefijo /api

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;
