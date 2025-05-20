const express = require('express');
const Pedido = require('../models/pedido');
const router = express.Router();

// Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { cliente, producto, cantidad, estado, precioTotal } = req.body;

    if (!cliente || !producto || !cantidad || !precioTotal) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    const nuevoPedido = new Pedido({
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal,
    });

    await nuevoPedido.save();
    res.status(201).send('Pedido creado correctamente');
  } catch (err) {
    console.error("Error al crear el pedido:", err);
    res.status(500).send(`Error al crear el pedido: ${err.message}`);
  }
});

// Obtener solo los productos de todos los pedidos (ruta estática: debe ir antes de la dinámica)
router.get('/productos', async (req, res) => {
  try {
    const productos = await Pedido.distinct('producto');
    res.status(200).json(productos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
});

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find().select('-createdAt -updatedAt -__v');
    res.status(200).json(pedidos);
  } catch (err) {
    console.error("Error al obtener los pedidos:", err);
    res.status(500).send('Error al obtener los pedidos');
  }
});

// Obtener un pedido específico por ID (ruta dinámica: va después de las estáticas)
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).select('-createdAt -updatedAt -__v');
    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }
    res.status(200).json(pedido);
  } catch (err) {
    console.error("Error al obtener el pedido:", err);
    res.status(500).send('Error al obtener el pedido');
  }
});

// Actualizar un pedido por ID
router.put('/:id', async (req, res) => {
  try {
    const { cliente, producto, cantidad, estado, precioTotal } = req.body;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { cliente, producto, cantidad, estado, precioTotal },
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.status(200).json(pedidoActualizado);
  } catch (err) {
    console.error("Error al actualizar el pedido:", err);
    res.status(500).send('Error al actualizar el pedido');
  }
});

// Eliminar un pedido por ID
router.delete('/:id', async (req, res) => {
  try {
    const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedidoEliminado) {
      return res.status(404).send('Pedido no encontrado');
    }
    res.status(200).send('Pedido eliminado correctamente');
  } catch (err) {
    console.error("Error al eliminar el pedido:", err);
    res.status(500).send('Error al eliminar el pedido');
  }
});

module.exports = router;