// backend/controllers/clienteController.js
const Cliente = require('../models/cliente');

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const { nombre, apellido, telefono, fecha_pedido } = req.body;
    const cliente = new Cliente({
      nombre,
      apellido,
      telefono,
      fecha_pedido: new Date(fecha_pedido) // Asegúrate de que la fecha esté en formato adecuado
    });

    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear cliente', error: err.message });
  }
};

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Otros métodos para obtener, actualizar y eliminar clientes...
