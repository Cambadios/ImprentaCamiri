// models/cliente.js
const mongoose = require('mongoose');

function normalizePhone(v) {
  if (!v) return v;
  // Deja solo dígitos (ej. +591 7 123 456 -> 5917123456 o si quieres sin 591, ajusta aquí)
  return String(v).replace(/\D+/g, '');
}

const clienteSchema = new mongoose.Schema({
  nombre:   { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  telefono: {
    type: String,
    required: true,
    trim: true,
    set: normalizePhone,
    validate: {
      validator: v => /^\d{7,12}$/.test(v), // ajusta el rango si usarás 591...
      message: props => `${props.value} no es un teléfono válido`
    },
    unique: true, // garantiza unicidad a nivel BD
  },
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} no es un correo válido`
    },
    unique: false // si quieres también unique, cámbialo a true
  },
  fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: true });

// Índices útiles
clienteSchema.index({ telefono: 1 }, { unique: true });
clienteSchema.index({ nombre: 'text', apellido: 'text', telefono: 'text', correo: 'text' });

module.exports = mongoose.model('Cliente', clienteSchema);
