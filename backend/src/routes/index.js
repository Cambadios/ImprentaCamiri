// src/routes/index.js
const express = require('express');

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const clienteRoutes = require('./clienteRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const inventarioRoutes = require('./inventarioRoutes');
const productoRoutes = require('./productoRoutes');
const reporteRoutes = require('./reportesRoutes');
const dashboardRoutes = require('./dashboardsRoutes')
const exportRoutes = require('./exportRoutes');
const dashboardRoutesMaquinaria = require('./dashboardRoutesMaquinaria');
const categoriaRoutes = require('./categoriaRoutes');
const biRoutes = require('./biRoutes');


const router = express.Router();

// Si authRoutes ya define '/usuarios/login' dentro, lo montas sin prefijo extra:
router.use(authRoutes);

// Rutas con prefijo claro
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/productos', productoRoutes);
router.use('/reportes', reporteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);
router.use('/dashboardMaquinaria', dashboardRoutesMaquinaria);
router.use('/categorias', categoriaRoutes);
router.use('/bi', biRoutes )

// Reportes (si adentro define '/reporte-pdf')
router.use(reporteRoutes);

module.exports = router;
