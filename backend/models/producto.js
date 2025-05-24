const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
    default: '', // Mejor que sea opcional con default vacío
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0,
  },
  categoria: {
    type: String,
    enum: ['banner', 'poster', 'agenda', 'tarjeta'],
    required: true,
  },
  materiales: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventario', // Referencia a la colección de inventario
  }],
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Producto', productoSchema);
