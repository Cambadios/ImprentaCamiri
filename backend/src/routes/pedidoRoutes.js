const express = require('express');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Crear un nuevo pedido
router.post('/', auth, async (req, res, next) => {
  try {
    const { cliente, producto, cantidad, estado, precioTotal, pagoCliente, fechaEntrega } = req.body;

    // validar cliente
    const clienteExistente = await Cliente.findById(cliente).lean();
    if (!clienteExistente) return res.status(400).json({ error: 'El cliente no existe' });

    if (!producto || !cantidad || !precioTotal) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const nuevoPedido = new Pedido({ cliente, producto, cantidad, estado, precioTotal, pagoCliente, fechaEntrega });
    await nuevoPedido.save();
    res.status(201).json({ message: 'Pedido creado correctamente' });
  } catch (e) { next(e); }
});

// Obtener solo los productos de todos los pedidos
router.get('/productos', auth, async (req, res, next) => {
  try {
    const productos = await Pedido.distinct('producto');
    res.status(200).json(products);
  } catch (e) { next(e); }
});

// Obtener todos los pedidos
router.get('/', auth, async (req, res, next) => {
  try {
    const pedidos = await Pedido.find()
      .populate('producto')
      .populate('cliente')
      .lean()
      .exec();
    res.status(200).json(pedidos);
  } catch (e) { next(e); }
});

// Obtener un pedido específico por ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('producto')
      .populate('cliente')
      .lean()
      .exec();
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
});

// Actualizar un pedido por ID
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { cliente, producto, cantidad, estado, precioTotal, pagoCliente, fechaEntrega } = req.body;
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { cliente, producto, cantidad, estado, precioTotal, pagoCliente, fechaEntrega },
      { new: true }
    );
    if (!pedidoActualizado) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(200).json(pedidoActualizado);
  } catch (e) { next(e); }
});

// Eliminar un pedido por ID
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedidoEliminado) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(200).json({ message: 'Pedido eliminado correctamente' });
  } catch (e) { next(e); }
});

module.exports = router;
