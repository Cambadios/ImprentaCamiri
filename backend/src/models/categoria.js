const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre:   { type: String, required: true, trim: true },
  tipo:     { type: String, enum: ['insumo', 'producto'], required: true, index: true },
  prefijo:  { type: String, required: true, trim: true, uppercase: true, match: [/^[A-Z]{3,6}$/, 'Prefijo inválido (3-6 letras)'] },
  descripcion: { type: String, trim: true }
}, { timestamps: true });

// Unicidad por (prefijo, nombre)
categoriaSchema.index(
  { prefijo: 1, nombre: 1 },
  { unique: true, collation: { locale: 'es', strength: 1 } } // strength:1 => ignora mayúsculas y acentos
);

// (Opcional) Si también quieres mantener único (tipo, prefijo), deja este índice:
categoriaSchema.index({ tipo: 1, prefijo: 1 }, { unique: true });

// Búsqueda útil
categoriaSchema.index({ nombre: 'text', prefijo: 'text' });

module.exports = mongoose.model('Categoria', categoriaSchema);
