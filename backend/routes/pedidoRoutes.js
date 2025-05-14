const express = require('express');
const Pedido = require('../models/pedido');  // Asegúrate de tener el modelo Pedido
const router = express.Router();

// Ruta para crear un nuevo pedido
router.post('/pedidos', async (req, res) => {
  try {
    const { cliente, producto, cantidad, estado, precioTotal } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!cliente || !producto || !cantidad || !precioTotal) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    // Crear un nuevo pedido
    const nuevoPedido = new Pedido({
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal,
    });

    // Guardar el nuevo pedido en la base de datos
    await nuevoPedido.save();
    res.status(201).send('Pedido creado correctamente');
  } catch (err) {
    console.error("Error al crear el pedido:", err);
    res.status(500).send(`Error al crear el pedido: ${err.message}`);
  }
});

// Ruta para obtener todos los pedidos sin los campos 'createdAt', 'updatedAt' y '__v'
router.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find().select('-createdAt -updatedAt -__v');  // Excluye los campos 'createdAt', 'updatedAt' y '__v'
    res.status(200).json(pedidos);
  } catch (err) {
    console.error("Error al obtener los pedidos:", err);
    res.status(500).send('Error al obtener los pedidos');
  }
});

// Ruta para obtener un pedido específico por ID, sin los campos 'createdAt', 'updatedAt' y '__v'
router.get('/pedidos/:id', async (req, res) => {
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

// Ruta para actualizar un pedido
router.put('/pedidos/:id', async (req, res) => {
  try {
    const { cliente, producto, cantidad, estado, precioTotal } = req.body;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(req.params.id, {
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal
    }, { new: true }); // Devuelve el pedido actualizado

    if (!pedidoActualizado) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.status(200).json(pedidoActualizado);
  } catch (err) {
    console.error("Error al actualizar el pedido:", err);
    res.status(500).send('Error al actualizar el pedido');
  }
});

// Ruta para eliminar un pedido
router.delete('/pedidos/:id', async (req, res) => {
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
