const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  fecha_pedido: {
    type: Date,
    required: true,
  },
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;
