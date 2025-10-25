// routes/clientes.js
const express = require('express');
const ctrl = require('../controllers/clienteController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rutas específicas ANTES de '/:id'
router.get('/buscar-por-telefono/:telefono', auth, ctrl.getClienteByTelefono);
router.get('/buscar-por-ci/:ci', auth, ctrl.getClienteByCI);

router.post('/', auth, ctrl.createCliente);
router.get('/', auth, ctrl.getClientes);
router.get('/:id', auth, ctrl.getClienteById);
router.put('/:id', auth, ctrl.updateCliente);
router.delete('/:id', auth, ctrl.deleteCliente);

module.exports = router;
