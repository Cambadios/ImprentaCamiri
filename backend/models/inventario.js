const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: { type: String, required: true, trim: true },
  cantidad: { type: Number, required: true, min: 0 },
  descripcion: { type: String, required: true, trim: true },
  esPorDocena: { type: Boolean, default: false },
  numDocenas: { type: Number, default: 0, min: 0 },
  fechaIngreso: { type: Date, default: Date.now }
}, { timestamps: true });

// Generar código automático antes de guardar
inventarioSchema.pre('save', async function (next) {
  if (!this.codigo) {
    const count = await mongoose.model('Inventario').countDocuments();
    const numero = (count + 1).toString().padStart(4, '0');
    this.codigo = `INV-${numero}`;
  }
  next();
});

module.exports = mongoose.model('Inventario', inventarioSchema);
