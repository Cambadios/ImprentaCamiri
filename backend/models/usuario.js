const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String, required: true, unique: true },
  carnetIdentidad: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['usuario_normal', 'administrador'],
    default: 'usuario_normal' 
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
