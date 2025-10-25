// controllers/clienteController.js
const Cliente = require('../models/cliente');

const normalizeDigits = v => (v ? String(v).replace(/\D+/g, '') : v);
const normalizePhone  = v => (v ? String(v).replace(/\D+/g, '') : v);

// Helper para manejar duplicados de índice único
function handleDuplicateKeyError(err, res) {
  if (err && err.code === 11000) {
    const dupField = Object.keys(err.keyPattern || {})[0] || 'campo';
    const msg = dupField === 'ci'
      ? 'El CI ya está registrado'
      : dupField === 'telefono'
        ? 'El teléfono ya está registrado'
        : 'Valor duplicado en un campo único';
    return res.status(400).json({ message: msg, field: dupField });
  }
  return null;
}

// Crear
exports.createCliente = async (req, res) => {
  try {
    const { ci, nombre, apellido, telefono, correo } = req.body;
    const ciNorm  = normalizeDigits(ci);
    const telNorm = normalizePhone(telefono);

    // Validaciones manuales de unicidad (rápidas) — opcional
    const existeCI = await Cliente.findOne({ ci: ciNorm });
    if (existeCI) return res.status(400).json({ message: 'El CI ya está registrado' });

    if (telNorm) {
      const existeTel = await Cliente.findOne({ telefono: telNorm });
      if (existeTel) return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }

    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo });
      if (existeCorreo) return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const cliente = new Cliente({ ci: ciNorm, nombre, apellido, telefono: telNorm, correo });
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    if (handleDuplicateKeyError(err, res)) return;
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

// Por ID (Mongo _id)
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
    const { ci, nombre, apellido, telefono, correo } = req.body;
    const ciNorm  = ci !== undefined ? normalizeDigits(ci) : undefined;
    const telNorm = telefono !== undefined ? normalizePhone(telefono) : undefined;

    // Unicidad: CI en otro cliente
    if (ciNorm) {
      const existeCI = await Cliente.findOne({ ci: ciNorm, _id: { $ne: req.params.id } });
      if (existeCI) return res.status(400).json({ message: 'El CI ya está registrado en otro cliente' });
    }

    // Unicidad: Teléfono en otro cliente (si mantienes teléfono único)
    if (telNorm) {
      const existeTel = await Cliente.findOne({ telefono: telNorm, _id: { $ne: req.params.id } });
      if (existeTel) return res.status(400).json({ message: 'El teléfono ya está registrado en otro cliente' });
    }

    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo, _id: { $ne: req.params.id } });
      if (existeCorreo) return res.status(400).json({ message: 'El correo ya está registrado en otro cliente' });
    }

    const update = {};
    if (ciNorm !== undefined)  update.ci = ciNorm;
    if (nombre !== undefined)  update.nombre = nombre;
    if (apellido !== undefined)update.apellido = apellido;
    if (telNorm !== undefined) update.telefono = telNorm;
    if (correo !== undefined)  update.correo = correo;

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!clienteActualizado) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(clienteActualizado);
  } catch (err) {
    if (handleDuplicateKeyError(err, res)) return;
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

// Buscar por CI (solo dígitos)
exports.getClienteByCI = async (req, res) => {
  try {
    const ci = normalizeDigits(req.params.ci);
    const cliente = await Cliente.findOne({ ci }).lean();
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
