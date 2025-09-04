// routes/dashboardRoutesMaquinaria.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardControllerMaquinaria');

// KPIs
// /api/dashboardMaquinaria/metrics?range=30d&lowStock=10
router.get('/metrics', ctrl.getMetrics);

// Donut por estado
// /api/dashboardMaquinaria/pedidos/status-breakdown?range=30d
router.get('/pedidos/status-breakdown', ctrl.getStatusBreakdown);

// Tendencia de pedidos
// /api/dashboardMaquinaria/pedidos/trend?scope=12m
router.get('/pedidos/trend', ctrl.getOrdersTrend);

// Top ventas
// /api/dashboardMaquinaria/ventas/top?range=30d&limit=7
router.get('/ventas/top', ctrl.getTopSales);

// Necesidades de compra
router.get('/insumos/needs', ctrl.getPurchaseNeeds);

// Alertas de mantenimiento (placeholder)
router.get('/mantenimiento/alerts', ctrl.getMaintAlerts);

module.exports = router;
