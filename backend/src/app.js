// app.js
require('dotenv').config();  // <--- carga las variables de .env

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// Configuración de CORS usando .env
const allowedOrigins = [process.env.CORS_ORIGIN];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Usa el enrutador
app.use('/api', routes);

// Middleware de errores
app.use(errorHandler);

module.exports = app;
