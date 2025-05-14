const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },  // Nombre del producto
  cantidad: { type: Number, required: true },  // Stock del producto
  descripcion: { type: String, required: true }  // Descripción del producto
  // No incluimos 'fechaIngreso' aquí
});

module.exports = mongoose.model('Inventario', inventarioSchema);
