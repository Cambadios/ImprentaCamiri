const express = require('express');
const Cliente = require('../models/cliente');
const router = express.Router();

// ✅ Crear un nuevo cliente
router.post('/clientes', async (req, res) => {
  const { nombre, apellido, telefono, correo } = req.body;

  try {
    const nuevoCliente = new Cliente({
      nombre,
      apellido,
      telefono,
      correo
    });

    await nuevoCliente.save();
    res.status(201).send('Cliente creado correctamente');
  } catch (err) {
    console.error('Error al crear el cliente:', err);
    res.status(500).send('Error al crear el cliente');
  }
});

// ✅ Obtener todos los clientes
router.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (err) {
    console.error('Error al obtener los clientes:', err);
    res.status(500).send('Error al obtener los clientes');
  }
});

// ✅ Obtener un cliente por ID
router.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).send('Cliente no encontrado');
    }
    res.status(200).json(cliente);
  } catch (err) {
    console.error('Error al obtener el cliente:', err);
    res.status(500).send('Error al obtener el cliente');
  }
});

// ✅ Actualizar un cliente por ID
router.put('/clientes/:id', async (req, res) => {
  const { nombre, apellido, telefono, correo } = req.body;

  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, telefono, correo },
      { new: true }
    );

    if (!clienteActualizado) {
      return res.status(404).send('Cliente no encontrado');
    }

    res.status(200).json(clienteActualizado);
  } catch (err) {
    console.error('Error al actualizar el cliente:', err);
    res.status(500).send('Error al actualizar el cliente');
  }
});

// ✅ Eliminar un cliente por ID
router.delete('/clientes/:id', async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) {
      return res.status(404).send('Cliente no encontrado');
    }
    res.status(200).send('Cliente eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar el cliente:', err);
    res.status(500).send('Error al eliminar el cliente');
  }
});

module.exports = router;
