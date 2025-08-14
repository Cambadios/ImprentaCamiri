const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{7,12}$/.test(v); // solo números, entre 7 y 12 dígitos
      },
      message: props => `${props.value} no es un teléfono válido`
    }
  },
  correo: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // valida email solo si está presente
      },
      message: props => `${props.value} no es un correo válido`
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;
