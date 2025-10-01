// models/inventario.js
const mongoose = require('mongoose');
const { generarCodigoPorCategoria } = require('../utils/generarCodigo');

const inventarioSchema = new mongoose.Schema({
  codigo:             { type: String, unique: true, sparse: true, index: true },
  nombre:             { type: String, required: true, trim: true, index: true },
  descripcion:        { type: String, required: true, trim: true },
  categoria:          { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
  marca:              { type: String, trim: true, index: true, default: '' },
  cantidadDisponible: { type: Number, required: true, min: 0 },
  unidadDeMedida:     { type: String, required: true, trim: true },
  precioUnitario:     { type: Number, required: true, min: 0 },
  fechaIngreso:       { type: Date, default: Date.now },
  stockMinimo:        { type: Number, min: 0, default: 0 } // opcional
}, { timestamps: true });

inventarioSchema.pre('save', async function (next) {
  try {
    if (this.codigo) return next();

    const Categoria = mongoose.model('Categoria');
    const cat = await Categoria.findById(this.categoria).lean();
    if (!cat) throw new Error('Categoría de insumo no encontrada');
    if (cat.tipo !== 'insumo') throw new Error('La categoría asignada no es de tipo insumo');

    this.codigo = await generarCodigoPorCategoria({ tipo: 'insumo', prefijo: cat.prefijo });
    next();
  } catch (err) {
    next(err);
  }
});

// Índice único “clave natural” para evitar duplicados accidentales de materiales
inventarioSchema.index(
  { nombre: 1, marca: 1, unidadDeMedida: 1, categoria: 1 },
  { unique: true, name: 'uk_insumo_natural' }
);

module.exports = mongoose.model('Inventario', inventarioSchema);