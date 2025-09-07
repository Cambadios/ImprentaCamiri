const mongoose = require('mongoose');
const { generarCodigoPorCategoria } = require('../utils/generarCodigo');

const productoSchema = new mongoose.Schema({
  codigo:        { type: String, unique: true, sparse: true, index: true },
  nombre:        { type: String, required: true, trim: true, index: true },
  descripcion:   { type: String, required: true, trim: true },
  categoria:     { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
  precioUnitario:{ type: Number, required: true, min: 0 },
  materiales: [{
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventario', required: true },
    cantidadPorUnidad: { type: Number, required: true, min: 1 },
  }],
  fechaCreacion: { type: Date, default: Date.now }
}, { timestamps: true });

productoSchema.pre('save', async function (next) {
  try {
    if (this.codigo) return next();

    const Categoria = mongoose.model('Categoria');
    const cat = await Categoria.findById(this.categoria).lean();
    if (!cat) throw new Error('Categoría de producto no encontrada');
    if (cat.tipo !== 'producto') throw new Error('La categoría asignada no es de tipo producto');

    this.codigo = await generarCodigoPorCategoria({ tipo: 'producto', prefijo: cat.prefijo });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Producto', productoSchema);
