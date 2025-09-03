// src/routes/reportesRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/reportesController');

// Ventas 
router.get('/ventas/ingresos', auth, ctrl.ventasIngresos);
router.get('/ventas/volumen', auth, ctrl.ventasVolumen);
router.get('/ventas/ticket-promedio', auth, ctrl.ventasTicketPromedio);
router.get('/ventas/estado-pago', auth, ctrl.ventasEstadoPago);
router.get('/ventas/pagos-por-metodo', auth, ctrl.pagosPorMetodo);

//Productos 
router.get('/productos/top-ingreso', auth, ctrl.productosTopIngreso);
router.get('/productos/mas-pedidos', auth, ctrl.productosMasPedidos);
router.get('/productos/pareto', auth, ctrl.productosPareto);
router.get('/productos/margen', auth, ctrl.productosMargen);
router.get('/productos/consumo-materiales', auth, ctrl.productosConsumoMateriales);

//Inventario 
router.get('/inventario/bajo-stock', auth, ctrl.inventarioBajoStock);
router.get('/inventario/valor-por-categoria', auth, ctrl.inventarioValorPorCategoria);
router.get('/inventario/rotacion', auth, ctrl.inventarioRotacion);
router.get('/inventario/quiebre-proyeccion', auth, ctrl.inventarioQuiebreProyeccion);

//Clientes
router.get('/clientes/nuevos', auth, ctrl.clientesNuevos);
router.get('/clientes/recurrentes-vs-unicos', auth, ctrl.clientesRecurrentesVsUnicos);
router.get('/clientes/top', auth, ctrl.clientesTop);
router.get('/clientes/cohortes', auth, ctrl.clientesCohortesRetencion);

//Operaciones
router.get('/operaciones/otif', auth, ctrl.operacionesOTIF);
router.get('/operaciones/lead-time', auth, ctrl.operacionesLeadTime);
router.get('/operaciones/funnel-estados', auth, ctrl.operacionesFunnelEstados);

// Calidad de dato
router.get('/calidad/clientes', auth, ctrl.calidadClientes);
router.get('/calidad/saldo', auth, ctrl.calidadSaldo);

module.exports = router;
