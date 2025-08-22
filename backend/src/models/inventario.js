// models/inventario.js
const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  codigo:             { type: String, unique: true, sparse: true },
  nombre:             { type: String, required: true, trim: true, index: true },
  descripcion:        { type: String, required: true, trim: true },
  categoria:          { type: String, required: true, trim: true, index: true },
  cantidadDisponible: { type: Number, required: true, min: 0 },
  unidadDeMedida:     { type: String, required: true, trim: true },
  precioUnitario:     { type: Number, required: true, min: 0 },
  fechaIngreso:       { type: Date, default: Date.now }
}, { timestamps: true });

inventarioSchema.pre('save', async function (next) {
  if (!this.codigo) {
    let count = await mongoose.model('Inventario').countDocuments();
    let numero = (count + 1).toString().padStart(4, '0');
    let codigoGenerado = `INV-${numero}`;
    while (await mongoose.model('Inventario').exists({ codigo: codigoGenerado })) {
      count++;
      numero = (count + 1).toString().padStart(4, '0');
      codigoGenerado = `INV-${numero}`;
    }
    this.codigo = codigoGenerado;
  }
  next();
});

module.exports = mongoose.model('Inventario', inventarioSchema);
