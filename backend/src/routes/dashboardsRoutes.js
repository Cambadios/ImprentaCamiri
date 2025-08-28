// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// Si quieres restringir a admin algunas métricas:
// const { auth, requireRole } = require('../middleware/auth');

const ctrl = require('../controllers/dashboardController');

// -------- Ventas & Pagos --------
router.get('/ventas/ingresos', auth, ctrl.ventasIngresos);
router.get('/ventas/estado-pago', auth, ctrl.ventasEstadoPago);
router.get('/ventas/top-clientes', auth, ctrl.ventasTopClientes);
router.get('/ventas/cobranza', auth, ctrl.ventasCobranza);

// -------- Productos (BOM + rentabilidad) --------
router.get('/productos/top', auth, ctrl.productosTop);
router.get('/productos/consumo-materiales', auth, ctrl.productosConsumoMateriales);
router.get('/productos/margen', auth, ctrl.productosMargen);

// -------- Inventario (stock & rotación) --------
router.get('/inventario/bajo-stock', auth, ctrl.inventarioBajoStock);
router.get('/inventario/valor-por-categoria', auth, ctrl.inventarioValorPorCategoria);
router.get('/inventario/rotacion-materiales', auth, ctrl.inventarioRotacionMateriales);

// -------- Clientes --------
router.get('/clientes/nuevos', auth, ctrl.clientesNuevos);
router.get('/clientes/recurrentes', auth, ctrl.clientesRecurrentes);

module.exports = router;
