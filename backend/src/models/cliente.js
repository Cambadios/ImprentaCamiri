// models/cliente.js
const mongoose = require('mongoose');

function normalizeDigits(v) {
  if (!v) return v;
  return String(v).replace(/\D+/g, '');
}

function normalizePhone(v) {
  return normalizeDigits(v);
}

const clienteSchema = new mongoose.Schema({
  ci: {
    type: String,
    required: [true, 'El carnet de identidad es obligatorio'],
    trim: true,
    set: normalizeDigits,                 // solo dígitos
    validate: {
      validator: v => /^\d{5,12}$/.test(v), // ajusta rango a tu realidad local
      message: props => `${props.value} no es un CI válido`
    },
    unique: true                          // clave única en BD
  },

  nombre:   { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },

  telefono: {
    type: String,
    required: false,          // si ya no quieres obligatorio, déjalo false
    trim: true,
    set: normalizePhone,
    validate: {
      validator: v => !v || /^\d{7,12}$/.test(v),
      message: props => `${props.value} no es un teléfono válido`
    },
    unique: true              // si NO quieres que sea único, cámbialo a false y quita el índice abajo
  },

  correo: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} no es un correo válido`
    },
    unique: false
  },

  fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: true });

// Índices
clienteSchema.index({ ci: 1 }, { unique: true });
clienteSchema.index({ telefono: 1 }, { unique: true }); // elimina esta línea si ya no quieres teléfono único
clienteSchema.index({ nombre: 'text', apellido: 'text', telefono: 'text', correo: 'text', ci: 'text' });

module.exports = mongoose.model('Cliente', clienteSchema);
