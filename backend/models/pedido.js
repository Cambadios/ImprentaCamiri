const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: {
    type: String,
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
  precioTotal: {
    type: Number,
    required: true,
  },
  pagoCliente: {
    type: Number,
    required: true,
    default: 0,
  },
  estado: {
    type: String,
    required: true,
    enum: ['Pendiente', 'En proceso', 'Entregado', 'Cancelado'],
    default: 'Pendiente',
  },
  fechaEntrega: {
    type: Date,
    required: false,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;
