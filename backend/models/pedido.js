const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: {
    type: String,  // Ahora usamos un nombre de cliente en lugar de un ID
    required: true,
  },
  producto: {
    type: String,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'En Proceso', 'Completado', 'Entregado'],
    default: 'Pendiente',
  },
  precioTotal: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;
