const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  precioUnitario: { type: Number, required: true, min: 0 },
  materiales: [{
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventario', required: true },
    cantidadPorUnidad: { type: Number, required: true, min: 1 },
  }],
  fechaCreacion: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
