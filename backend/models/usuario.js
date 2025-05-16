const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  rol: { type: String, required: true, default: 'usuario_normal' }
});

module.exports = mongoose.model('Usuario', usuarioSchema);