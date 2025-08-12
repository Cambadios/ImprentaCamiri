const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: { 
    type: mongoose.Schema.Types.ObjectId,  // Cambiar a ObjectId para hacer referencia al Cliente
    ref: 'Cliente',  // Referencia al modelo Cliente
    required: true 
  },
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto',  // Referencia al modelo Producto
    required: true 
  },
  cantidad: { type: Number, required: true },
  estado: { type: String, enum: ['Pendiente', 'En proceso', 'Entregado', 'Cancelado'], default: 'Pendiente' },
  precioTotal: { type: Number, required: true },
  pagoCliente: { type: Number, required: true },
  fechaEntrega: { type: Date },
});

module.exports = mongoose.model('Pedido', pedidoSchema);
