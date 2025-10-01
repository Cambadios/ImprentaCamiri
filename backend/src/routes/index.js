// src/routes/index.js
const express = require('express');

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const clienteRoutes = require('./clienteRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const inventarioRoutes = require('./inventarioRoutes');           // <- tu archivo
const inventarioMovRoutes = require('./inventarioMovimientoRoutes');    // <- movimientos
const productoRoutes = require('./productoRoutes');
const reporteRoutes = require('./reportesRoutes');
const dashboardRoutes = require('./dashboardsRoutes');
const exportRoutes = require('./exportRoutes');
const dashboardRoutesMaquinaria = require('./dashboardRoutesMaquinaria');
const categoriaRoutes = require('./categoriaRoutes');
const biRoutes = require('./biRoutes');

const router = express.Router();

/**
 * Si authRoutes ya define sus paths internos (ej. /usuarios/login),
 * se monta sin prefijo extra.
 */
router.use(authRoutes);

// Prefijos claros (orden recomendado: más específicos antes que genéricos)
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);

// 👇 Montar primero los movimientos para evitar que /inventario/:id capture "movimientos"
router.use('/inventario/movimientos', inventarioMovRoutes);
router.use('/inventario', inventarioRoutes);

router.use('/productos', productoRoutes);
router.use('/reportes', reporteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);
router.use('/dashboardMaquinaria', dashboardRoutesMaquinaria);
router.use('/categorias', categoriaRoutes);
router.use('/bi', biRoutes);


module.exports = router;
