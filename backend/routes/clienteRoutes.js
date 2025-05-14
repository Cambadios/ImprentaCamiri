const express = require('express');
const Cliente = require('../models/cliente');  // Asegúrate de tener el modelo correcto
const router = express.Router();

// Ruta para crear un nuevo cliente
router.post('/clientes', async (req, res) => {
  const { nombre, apellido, telefono, fecha_pedido } = req.body;

  try {
    const nuevoCliente = new Cliente({
      nombre,
      apellido,
      telefono,
      fecha_pedido,
    });

    await nuevoCliente.save();
    res.status(201).send('Cliente creado correctamente');
  } catch (err) {
    console.error('Error al crear el cliente:', err);
    res.status(500).send('Error al crear el cliente');
  }
});


// Ruta para eliminar un cliente por ID
router.delete('/clientes/:id', async (req, res) => {
  console.log('ID recibido para eliminación:', req.params.id);  // Verifica que el ID esté llegando correctamente
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) {
      console.log('Cliente no encontrado');  // Verifica si el cliente no existe
      return res.status(404).send('Cliente no encontrado');
    }
    console.log('Cliente eliminado:', clienteEliminado);  // Verifica que el cliente haya sido eliminado
    res.status(200).send('Cliente eliminado correctamente');
  } catch (err) {
    console.error('Error al eliminar el cliente:', err);
    res.status(500).send('Error al eliminar el cliente');
  }
});




// Ruta para obtener todos los clientes
router.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (err) {
    console.error('Error al obtener los clientes:', err);
    res.status(500).send('Error al obtener los clientes');
  }
});


// Ruta para obtener un cliente por ID
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


module.exports = router;
