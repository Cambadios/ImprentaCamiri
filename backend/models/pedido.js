const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },  // Referencia al modelo Producto
  cantidad: { type: Number, required: true },
  estado: { type: String, enum: ['Pendiente', 'En proceso', 'Entregado', 'Cancelado'], default: 'Pendiente' },
  precioTotal: { type: Number, required: true },
  pagoCliente: { type: Number, required: true },
  fechaEntrega: { type: Date },
});

module.exports = mongoose.model('Pedido', pedidoSchema);
