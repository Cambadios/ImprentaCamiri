const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  monto: { type: Number, required: true, min: 0 },
  metodo: { type: String, default: 'efectivo', trim: true }, // opcional
  nota:   { type: String, trim: true },
  fecha:  { type: Date, default: Date.now }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  cliente:  { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },

  // snapshot del precio al momento de pedir
  precioUnitarioPedido: { type: Number, required: true, min: 0 },

  cantidad: { type: Number, required: true, min: 1 },

  estado: {
    type: String,
    enum: ['Pendiente', 'En proceso', 'Entregado', 'Cancelado'],
    default: 'Pendiente'
  },

  // pagos
  pagos: [pagoSchema],
  total: { type: Number, required: true, min: 0 },  // precioUnitarioPedido * cantidad
  pagado: { type: Number, required: true, min: 0, default: 0 },
  saldo:  { type: Number, required: true, min: 0 },

  // estado pago derivado (comodidad de consultas)
  estadoPago: {
    type: String,
    enum: ['Sin pago', 'Parcial', 'Pagado'],
    default: 'Sin pago'
  },

  fechaEntrega: { type: Date },             // fecha prometida
  entregadoEn:  { type: Date },             // fecha real de entrega
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
