const express = require('express');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente'); // Asegúrate de importar el modelo Cliente
const router = express.Router();

// Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const {
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal,
      pagoCliente,
      fechaEntrega
    } = req.body;

    // Validar que el cliente existe
    const clienteExistente = await Cliente.findById(cliente);
    if (!clienteExistente) {
      return res.status(400).send('El cliente no existe');
    }

    // Validación de campos obligatorios
    if (!producto || !cantidad || !precioTotal) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    const nuevoPedido = new Pedido({
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal,
      pagoCliente,
      fechaEntrega
    });

    await nuevoPedido.save();
    res.status(201).json({ message: 'Pedido creado correctamente' });
  } catch (err) {
    console.error("Error al crear el pedido:", err);
    res.status(500).json({ error: `Error al crear el pedido: ${err.message}` });
  }
});

// Obtener solo los productos de todos los pedidos
router.get('/productos', async (req, res) => {
  try {
    const productos = await Pedido.distinct('producto');
    res.status(200).json(productos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener todos los pedidos con los detalles de los productos y clientes
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('producto')  // Poblar detalles del producto
      .populate('cliente', 'nombre')  // Poblar solo el campo `nombre` del cliente
      .exec();
    res.status(200).json(pedidos);
  } catch (err) {
    console.error("Error al obtener los pedidos:", err);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});

// Obtener un pedido específico por ID con los detalles del producto y cliente
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('producto')  // Poblar detalles del producto
      .populate('cliente', 'nombre')  // Poblar solo el campo `nombre` del cliente
      .exec();
    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }
    res.status(200).json(pedido);
  } catch (err) {
    console.error("Error al obtener el pedido:", err);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});

// Actualizar un pedido por ID
router.put('/:id', async (req, res) => {
  try {
    const {
      cliente,
      producto,
      cantidad,
      estado,
      precioTotal,
      pagoCliente,
      fechaEntrega
    } = req.body;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      {
        cliente,
        producto,
        cantidad,
        estado,
        precioTotal,
        pagoCliente,
        fechaEntrega
      },
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.status(200).json(pedidoActualizado);
  } catch (err) {
    console.error("Error al actualizar el pedido:", err);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

// Eliminar un pedido por ID
router.delete('/:id', async (req, res) => {
  try {
    const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedidoEliminado) {
      return res.status(404).send('Pedido no encontrado');
    }
    res.status(200).json({ message: 'Pedido eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar el pedido:", err);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
});

module.exports = router;
