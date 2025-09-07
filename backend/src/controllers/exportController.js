// backend/src/controllers/exportController.js
const dayjs = require('dayjs');
const { exportTablePdf } = require('../utils/pdf');
const Cliente = require('../models/cliente');
const Inventario = require('../models/inventario');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario');
const Categoria = require('../models/categoria'); // <-- NUEVO
const path = require('path');

const LOGO = path.resolve(__dirname, '../public/logo.png');

// Helpers
const fmt = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '');
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');

exports.exportClientes = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';

    const clientes = await Cliente.find({}).sort({ createdAt: -1 }).lean();
    await exportTablePdf(res, {
      title: 'Listado de Clientes',
      subtitle: `Total: ${clientes.length}`,
      createdBy,
      logoPath: LOGO,
      filename: `clientes_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre', key: 'nombreCompleto', width: 140 },
        { header: 'Teléfono', key: 'telefono', width: 90 },
        { header: 'Correo', key: 'correo', width: 140 },
      ],
      rows: clientes.map(c => ({
        nombreCompleto: `${c.nombre || ''} ${c.apellido || ''}`.trim(),
        telefono: c.telefono || '-',
        correo: c.correo || '-',
      })),
    });
  } catch (e) { next(e); }
};

exports.exportInventario = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';

    const q = String(req.query.q || '').trim();
    const where = q ? {
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { categoria: { $regex: q, $options: 'i' } },
        { codigo: { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } },
      ]
    } : {};
    const items = await Inventario.find(where).sort({ nombre: 1 }).lean();
    await exportTablePdf(res, {
      title: 'Inventario (Insumos)',
      subtitle: `Total: ${items.length}${q ? ` · Filtro: "${q}"` : ''}`,
      createdBy,
      logoPath: LOGO,
      filename: `inventario_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Código', key: 'codigo', width: 60 },
        { header: 'Nombre', key: 'nombre', width: 120 },
        { header: 'Categoría', key: 'categoria', width: 90 },
        { header: 'Unidad', key: 'unidadDeMedida', width: 60 },
        { header: 'Cant.', key: 'cantidadDisponible', width: 50, isNumeric: true },
        { header: 'Precio', key: 'precioUnitario', width: 60, isNumeric: true },
        { header: 'Ingreso', key: 'fechaIngreso', width: 70 },
      ],
      rows: items.map(i => ({
        codigo: i.codigo,
        nombre: i.nombre,
        categoria: i.categoria || '-',
        unidadDeMedida: i.unidadDeMedida || '-',
        cantidadDisponible: i.cantidadDisponible ?? 0,
        precioUnitario: Number(i.precioUnitario ?? 0),
        fechaIngreso: fmt(i.fechaIngreso),
      })),
    });
  } catch (e) { next(e); }
};

exports.exportPedidos = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const { estado, q = '' } = req.query;
    const where = {};
    if (estado) where.estado = estado;

    if (q) {
      const clientes = await Cliente.find({
        $or: [
          { nombre:   { $regex: q, $options: 'i' } },
          { apellido: { $regex: q, $options: 'i' } },
          { telefono: { $regex: q.replace(/\D+/g, ''), $options: 'i' } },
        ]
      }, { _id: 1 }).lean();
      const productos = await Producto.find({
        nombre: { $regex: q, $options: 'i' }
      }, { _id: 1 }).lean();
      where.$or = [
        { cliente:  { $in: clientes.map(c => c._id) } },
        { producto: { $in: productos.map(p => p._id) } },
      ];
    }

    const pedidos = await Pedido.find(where)
      .populate('cliente', 'nombre apellido telefono')
      .populate('producto', 'nombre precioUnitario')
      .sort({ createdAt: -1 })
      .lean();

    await exportTablePdf(res, {
      title: 'Pedidos',
      subtitle: `Total: ${pedidos.length}${estado ? ` · Estado: ${estado}` : ''}${q ? ` · Filtro: "${q}"` : ''}`,
      createdBy,
      logoPath: LOGO,
      filename: `pedidos_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Cliente', key: 'cliente', width: 120 },
        { header: 'Producto', key: 'producto', width: 120 },
        { header: 'Cant.', key: 'cantidad', width: 40, isNumeric: true },
        { header: 'Total', key: 'total', width: 60, isNumeric: true },
        { header: 'Pagado', key: 'pagado', width: 60, isNumeric: true },
        { header: 'Saldo', key: 'saldo', width: 60, isNumeric: true },
        { header: 'Estado', key: 'estado', width: 70 },
        { header: 'Entrega', key: 'entrega', width: 70 },
      ],
      rows: pedidos.map(p => ({
        cliente: `${p.cliente?.nombre || ''} ${p.cliente?.apellido || ''}`.trim(),
        producto: p.producto?.nombre || '-',
        cantidad: Number(p.cantidad ?? 0),
        total:    Number(p.total ?? 0),
        pagado:   Number(p.pagado ?? 0),
        saldo:    Number(p.saldo ?? 0),
        estado: p.estado || '-',
        entrega: fmt(p.fechaEntrega),
      })),
    });
  } catch (e) { next(e); }
};

exports.exportProductos = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';

    const prods = await Producto.find({})
      .populate('materiales.material', 'nombre unidadDeMedida')
      .sort({ nombre: 1 })
      .lean();

    await exportTablePdf(res, {
      title: 'Productos',
      subtitle: `Total: ${prods.length}`,
      createdBy,
      logoPath: LOGO,
      filename: `productos_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre', key: 'nombre', width: 140 },
        { header: 'Descripción', key: 'descripcion', width: 190 },
        { header: 'Precio', key: 'precioUnitario', width: 60, isNumeric: true },
        { header: 'Materiales', key: 'materiales', width: 90 },
      ],
      rows: prods.map(p => ({
        nombre: p.nombre,
        descripcion: p.descripcion || '-',
        precioUnitario: Number(p.precioUnitario ?? 0),
        materiales: (p.materiales || [])
          .map(m => `${m.material?.nombre || ''} (${m.cantidadPorUnidad} ${m.material?.unidadDeMedida || ''})`)
          .join(', ') || '-',
      })),
    });
  } catch (e) { next(e); }
};

exports.exportUsuarios = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';

    const users = await Usuario.find({})
      .select('-contrasena')
      .sort({ createdAt: -1 })
      .lean();

    const mapRol = (rol) => {
      switch (rol) {
        case 'usuario_normal': return 'MAQUINARIA';
        case 'administrador':  return 'ADMINISTRADOR';
        default:               return rol || '-';
      }
    };

    await exportTablePdf(res, {
      title: 'Usuarios',
      subtitle: `Total: ${users.length}`,
      createdBy,
      logoPath: LOGO,
      filename: `usuarios_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre', key: 'nombreCompleto', width: 150 },
        { header: 'Correo', key: 'correo', width: 140 },
        { header: 'Teléfono', key: 'telefono', width: 90 },
        { header: 'Rol', key: 'rol', width: 90 },
      ],
      rows: users.map(u => ({
        nombreCompleto: u.nombreCompleto || '-',
        correo: u.correo || '-',
        telefono: u.telefono || '-',
        rol: mapRol(u.rol),
      })),
    });
  } catch (e) { next(e); }
};

/** ===================== NUEVO: CATEGORÍAS ===================== */
exports.exportCategorias = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const { q = '', tipo } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (q) {
      where.$or = [
        { nombre:  { $regex: q, $options: 'i' } },
        { prefijo: { $regex: q, $options: 'i' } },
        { tipo:    { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } },
      ];
    }

    const cats = await Categoria.find(where).sort({ tipo: 1, nombre: 1 }).lean();

    await exportTablePdf(res, {
      title: 'Categorías',
      subtitle: `Total: ${cats.length}${tipo ? ` · Tipo: ${cap(tipo)}` : ''}${q ? ` · Filtro: "${q}"` : ''}`,
      createdBy,
      logoPath: LOGO,
      filename: `categorias_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre', key: 'nombre', width: 140 },
        { header: 'Prefijo', key: 'prefijo', width: 60 },
        { header: 'Tipo', key: 'tipo', width: 80 },
        { header: 'Descripción', key: 'descripcion', width: 180 },
        { header: 'Creado', key: 'creado', width: 70 },
      ],
      rows: cats.map(c => ({
        nombre: c.nombre || '-',
        prefijo: (c.prefijo || '-').toUpperCase(),
        tipo: cap(c.tipo) || '-',
        descripcion: c.descripcion || '-',
        creado: fmt(c.createdAt),
      })),
    });
  } catch (e) { next(e); }
};
