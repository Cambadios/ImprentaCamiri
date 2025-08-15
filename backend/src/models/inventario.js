const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  categoria: { type: String, required: true, trim: true },
  cantidadDisponible: { type: Number, required: true, min: 0 },
  unidadDeMedida: { type: String, required: true, trim: true },
  precioUnitario: { type: Number, required: true, min: 0 },
  fechaIngreso: { type: Date, default: Date.now }
}, { timestamps: true });

// Generar código automático antes de guardar
inventarioSchema.pre('save', async function (next) {
  if (!this.codigo) {
    let count = await mongoose.model('Inventario').countDocuments();
    let numero = (count + 1).toString().padStart(4, '0');
    let codigoGenerado = `INV-${numero}`;

    // Verifica si el código generado ya existe
    while (await mongoose.model('Inventario').exists({ codigo: codigoGenerado })) {
      count++; // Incrementa el contador si ya existe el código
      numero = (count + 1).toString().padStart(4, '0');
      codigoGenerado = `INV-${numero}`; // Genera un nuevo código
    }

    this.codigo = codigoGenerado; // Asigna el código único
  }
  next();
});


module.exports = mongoose.model('Inventario', inventarioSchema);
