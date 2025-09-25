// backend/src/routes/biRoutes.js
const { Router } = require('express');
const { auth } = require('../middleware/auth');
const bi = require('../controllers/biController'); // <- asegúrate que el archivo se llame biController.js

const router = Router();

router.get('/kpis', auth, bi.kpis);
router.get('/series', auth, bi.series);
router.get('/clientes', auth, bi.clientesResumen);
router.get('/clientes/:id', auth, bi.clienteDetalle);
router.get('/pedidos/estado', auth, bi.estadoPedidos);
router.get('/insumos/stock', auth, bi.insumosStock);

module.exports = router;
