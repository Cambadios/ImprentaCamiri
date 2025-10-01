// models/movimientoInventario.js
const mongoose = require('mongoose');

const movimientoInventarioSchema = new mongoose.Schema({
  insumo:        { type: mongoose.Schema.Types.ObjectId, ref: 'Inventario', required: true, index: true },
  tipo:          { type: String, enum: ['INGRESO', 'SALIDA'], required: true, index: true },
  cantidad:      { type: Number, required: true, min: 0.0000001 },
  unidadDeMedida:{ type: String, required: true, trim: true },
  costoUnitario: { type: Number, min: 0, default: null },
  motivo:        { type: String, trim: true, default: '' },
  referencia:    { type: String, trim: true, default: '' },
  usuario:       { type: String, trim: true, default: '' },
  fecha:         { type: Date, default: Date.now, index: true }
}, { timestamps: true });

movimientoInventarioSchema.index({ insumo: 1, fecha: -1 });
movimientoInventarioSchema.index({ tipo: 1, fecha: -1 });

module.exports = mongoose.model('MovimientoInventario', movimientoInventarioSchema);
