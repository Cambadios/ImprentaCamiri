const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  descripcion: { type: String, required: true },
  esPorDocena: { type: Boolean, default: false },
  numDocenas: { type: Number, default: 0 },
  imagenUrl: { type: String }
});

module.exports = mongoose.model('Inventario', inventarioSchema);
