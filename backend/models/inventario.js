const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  descripcion: { type: String, required: true },
  esPorDocena: { type: Boolean, default: false },  // Nueva pregunta
  numDocenas: { type: Number, default: 0 },        // Solo si esPorDocena es true
  imagenUrl: { type: String }                      // URL de imagen del producto
});

module.exports = mongoose.model('Inventario', inventarioSchema);
