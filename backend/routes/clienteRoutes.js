const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');

// Controlador para crear cliente con validación
router.post('/clientes', async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;

    console.log('Datos recibidos:', req.body);

    // Verificar teléfono duplicado
    const existeTelefono = await Cliente.findOne({ telefono });
    console.log('Existe teléfono:', existeTelefono);
    if (existeTelefono) {
      return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }

    // Verificar correo duplicado (si existe)
    if (correo) {
      const existeCorreo = await Cliente.findOne({ correo });
      console.log('Existe correo:', existeCorreo);
      if (existeCorreo) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
    }

    const nuevoCliente = new Cliente({ nombre, apellido, telefono, correo });
    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

// Obtener todos los clientes
router.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});

// Obtener cliente por ID
router.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ message: 'Error al obtener cliente' });
  }
});

// Actualizar cliente con validación de duplicados
router.put('/clientes/:id', async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;

    // Verificar teléfono duplicado en otro cliente
    const existeTelefono = await Cliente.findOne({ telefono, _id: { $ne: req.params.id } });
    if (existeTelefono) {
      return res.status(400).json({ message: 'El teléfono ya está registrado en otro cliente' });
    }

    // Verificar correo duplicado en otro cliente
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

    if (!clienteActualizado) return res.status(404).json({ message: 'Cliente no encontrado' });

    res.status(200).json(clienteActualizado);
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/clientes/:id', async (req, res) => {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
});

module.exports = router;
