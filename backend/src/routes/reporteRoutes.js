// src/routes/reporteRoutes.js
const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const ReporteController = require('../controllers/reporteController');

router.use(auth, requireRole('administrador'));

router.get('/ventas', ReporteController.ventas);               // ?from&to&groupBy=day|month
router.get('/top-productos', ReporteController.topProductos);  // ?from&to&limit=10
router.get('/top-clientes', ReporteController.topClientes);    // ?from&to&limit=10
router.get('/pedidos-por-estado', ReporteController.pedidosPorEstado); // ?from&to
router.get('/inventario/bajo-stock', ReporteController.bajoStock);     // ?threshold=10
router.get('/kardex', ReporteController.kardex);               // ?productoId&from&to
router.get('/lead-time', ReporteController.leadTime);          // ?from&to

// Descargas (PDF/XLSX)
router.get('/descargar', ReporteController.descargar);         // ?tipo=ventas|top-productos|...&formato=pdf|xlsx&...params

module.exports = router;
