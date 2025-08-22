// controllers/clienteController.js
const Cliente = require('../models/cliente');

const normalizePhone = v => (v ? String(v).replace(/\D+/g, '') : v);

// Crear
exports.createCliente = async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;
    const tel = normalizePhone(telefono);

    const existeTelefono = await Cliente.findOne({ telefono: tel });
    if (existeTelefono) {
      return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }

    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo });
      if (existeCorreo) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
    }

    const cliente = new Cliente({ nombre, apellido, telefono: tel, correo });
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear cliente', error: err.message });
  }
};

// Listar
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar
exports.updateCliente = async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;
    const tel = normalizePhone(telefono);

    const existeTelefono = await Cliente.findOne({ telefono: tel, _id: { $ne: req.params.id } });
    if (existeTelefono) {
      return res.status(400).json({ message: 'El teléfono ya está registrado en otro cliente' });
    }

    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo, _id: { $ne: req.params.id } });
      if (existeCorreo) {
        return res.status(400).json({ message: 'El correo ya está registrado en otro cliente' });
      }
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, telefono: tel, correo },
      { new: true }
    );

    if (!clienteActualizado) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(clienteActualizado);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar cliente', error: err.message });
  }
};

// Eliminar
exports.deleteCliente = async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Buscar por teléfono (normalizado)
exports.getClienteByTelefono = async (req, res) => {
  try {
    const tel = normalizePhone(req.params.telefono);
    const cliente = await Cliente.findOne({ telefono: tel }).lean();
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
