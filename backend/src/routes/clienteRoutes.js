const express = require('express');
const Cliente = require('../models/cliente');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Buscar por teléfono (ruta específica ANTES de :id)
router.get('/buscar-por-telefono/:telefono', auth, async (req, res, next) => {
  try {
    const { telefono } = req.params;
    const cliente = await Cliente.findOne({ telefono }).lean();
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (e) { next(e); }
});

// Crear cliente con validación
router.post('/', auth, async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;

    // Verificar duplicados
    const dupTel = await Cliente.findOne({ telefono }).lean();
    if (dupTel) return res.status(400).json({ message: 'El teléfono ya está registrado' });

    if (correo) {
      const dupMail = await Cliente.findOne({ correo }).lean();
      if (dupMail) return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const nuevoCliente = new Cliente({ nombre, apellido, telefono, correo });
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (e) { next(e); }
});

// Obtener todos los clientes (con filtros opcionales)
router.get('/', auth, async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 50 } = req.query;
    const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);

    const where = q
      ? { $or: [
          { nombre:   { $regex: q, $options: 'i' } },
          { apellido: { $regex: q, $options: 'i' } },
          { telefono: { $regex: q, $options: 'i' } },
          { correo:   { $regex: q, $options: 'i' } },
        ] }
      : {};

    const [data, total] = await Promise.all([
      Cliente.find(where).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Cliente.countDocuments(where)
    ]);

    res.status(200).json({
      data, total,
      page: Number(page), limit: Number(limit),
      pages: Math.ceil(total / Number(limit) || 1)
    });
  } catch (e) { next(e); }
});

// Obtener cliente por ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (e) { next(e); }
});

// Actualizar cliente con validación
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;

    // Verificar duplicados en OTROS clientes
    const dupTel = await Cliente.findOne({ telefono, _id: { $ne: req.params.id } }).lean();
    if (dupTel) return res.status(400).json({ message: 'El teléfono ya está registrado en otro cliente' });

    if (correo) {
      const dupMail = await Cliente.findOne({ correo, _id: { $ne: req.params.id } }).lean();
      if (dupMail) return res.status(400).json({ message: 'El correo ya está registrado en otro cliente' });
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, telefono, correo },
      { new: true }
    );

    if (!clienteActualizado) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(clienteActualizado);
  } catch (e) { next(e); }
});

// Eliminar cliente
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (e) { next(e); }
});

module.exports = router;
