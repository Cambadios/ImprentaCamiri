// models/pedido.js
const mongoose = require('mongoose');

// Helper para redondear a 2 decimales
function to2(n) {
  if (n === null || n === undefined) return n;
  return Math.round(Number(n) * 100) / 100;
}

const pagoSchema = new mongoose.Schema({
  monto:  { type: Number, required: true, min: 0, set: to2 },
  metodo: { type: String, default: 'efectivo', trim: true },
  nota:   { type: String, trim: true },
  fecha:  { type: Date, default: Date.now }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  cliente:  { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true, index: true },

  // snapshot del precio al momento de pedir
  precioUnitarioPedido: { type: Number, required: true, min: 0, set: to2 },

  cantidad: { type: Number, required: true, min: 1 },

  // NUEVOS ESTADOS (FSM): no se puede retroceder ni saltar.
  estado: {
    type: String,
    enum: ['Pendiente', 'En Produccion', 'Hecho', 'Entregado'],
    default: 'Pendiente',
    index: true
  },

  // pagos
  pagos: { type: [pagoSchema], default: [] },

  // derivados
  total:  { type: Number, required: true, min: 0, set: to2 },   // precioUnitarioPedido * cantidad
  pagado: { type: Number, required: true, min: 0, default: 0, set: to2 },
  saldo:  { type: Number, required: true, min: 0, set: to2 },

  estadoPago: {
    type: String,
    enum: ['Sin pago', 'Parcial', 'Pagado'],
    default: 'Sin pago',
    index: true
  },

  fechaEntrega: { type: Date }, // fecha prometida
  entregadoEn:  { type: Date }, // fecha real de entrega (solo para lógica interna antes de eliminar)
}, { timestamps: true });

// Índices adicionales para orden/consultas
pedidoSchema.index({ createdAt: -1 });

pedidoSchema.pre('validate', function(next) {
  // Recalcular total si tenemos precio y cantidad
  if (this.isModified('precioUnitarioPedido') || this.isModified('cantidad') || this.isNew) {
    const pu = Number(this.precioUnitarioPedido || 0);
    const q  = Number(this.cantidad || 0);
    this.total = to2(pu * q);
  }

  const total  = Number(this.total || 0);
  let pagado   = Number(this.pagado || 0);
  if (pagado < 0) pagado = 0;
  if (pagado > total) pagado = total;

  this.pagado = to2(pagado);
  this.saldo  = to2(Math.max(total - pagado, 0));

  // Derivar estadoPago
  if (this.pagado <= 0) this.estadoPago = 'Sin pago';
  else if (this.pagado < total) this.estadoPago = 'Parcial';
  else this.estadoPago = 'Pagado';

  next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);