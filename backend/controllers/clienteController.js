const Cliente = require('../models/cliente');

// Crear un nuevo cliente con validación duplicados
exports.createCliente = async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;

    // Validar teléfono duplicado
    const existeTelefono = await Cliente.findOne({ telefono });
    if (existeTelefono) {
      return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }

    // Validar correo duplicado (si se proporciona)
    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo });
      if (existeCorreo) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
    }

    const cliente = new Cliente({
      nombre,
      apellido,
      telefono,
      correo,
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

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar cliente con validación duplicados
exports.updateCliente = async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;

    // Validar teléfono duplicado en otro cliente
    const existeTelefono = await Cliente.findOne({ telefono, _id: { $ne: req.params.id } });
    if (existeTelefono) {
      return res.status(400).json({ message: 'El teléfono ya está registrado en otro cliente' });
    }

    // Validar correo duplicado en otro cliente
    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo, _id: { $ne: req.params.id } });
      if (existeCorreo) {
        return res.status(400).json({ message: 'El correo ya está registrado en otro cliente' });
      }
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, telefono, correo },
      { new: true }
    );

    if (!clienteActualizado) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json(clienteActualizado);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar cliente', error: err.message });
  }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
