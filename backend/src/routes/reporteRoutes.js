const express = require('express');
const { reportePdf, reporteDatos } = require('../controllers/reporteController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/reporte-pdf', auth, reportePdf);
router.get('/reporte-datos', auth, reporteDatos);

module.exports = router;
