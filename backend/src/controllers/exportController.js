// backend/src/controllers/exportController.js
const dayjs = require('dayjs');
const { exportTablePdf } = require('../utils/pdf');
const Cliente = require('../models/cliente');
const Inventario = require('../models/inventario');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario');
const Categoria = require('../models/categoria');
const path = require('path');

const LOGO = path.resolve(__dirname, '../public/logo.png');
const fmt = (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '');
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');

// ----------------- CLIENTES -----------------
exports.exportClientes = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const clientes = await Cliente.find({}).sort({ createdAt: -1 }).lean();

    await exportTablePdf(res, {
      title: 'Listado de Clientes',
      listLabel: `Total: ${clientes.length}`,
      createdBy,
      logoPath: LOGO,
      filename: `clientes_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre',   key: 'nombreCompleto', width: 160 },
        { header: 'Teléfono', key: 'telefono',       width: 100 },
        { header: 'Correo',   key: 'correo',         width: 180 },
      ],
      rows: clientes.map(c => ({
        nombreCompleto: `${c.nombre || ''} ${c.apellido || ''}`.trim() || '-',
        telefono: c.telefono || '-',
        correo:   c.correo || '-',
      })),
    });
  } catch (e) { next(e); }
};

// ----------------- INVENTARIO -----------------
exports.exportInventario = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const q = String(req.query.q || '').trim();

    const where = q ? {
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { codigo: { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } },
      ]
    } : {};

    // 👉 si categoria es ref, poblamos para mostrar nombre legible
    const items = await Inventario.find(where)
      .populate('categoria', 'nombre')  // <-- importante
      .sort({ nombre: 1 })
      .lean();

    await exportTablePdf(res, {
      title: 'Inventario (Insumos)',
      listLabel: `Total: ${items.length}${q ? ` · Filtro: "${q}"` : ''}`,
      createdBy,
      logoPath: LOGO,
      filename: `inventario_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Código',   key: 'codigo',            width: 70 },
        { header: 'Nombre',   key: 'nombre',            width: 150 },
        { header: 'Categoría',key: 'categoria',         width: 110 },
        { header: 'Unidad',   key: 'unidadDeMedida',    width: 70 },
        { header: 'Cant.',    key: 'cantidadDisponible',width: 60, isNumeric: true },
        { header: 'Precio',   key: 'precioUnitario',    width: 70, isCurrency: true },
        { header: 'Ingreso',  key: 'fechaIngreso',      width: 80 },
      ],
      rows: items.map(i => ({
        codigo: i.codigo || '-',
        nombre: i.nombre || '-',
        categoria: (i.categoria && i.categoria.nombre) || i.categoria || '-', // nombre poblado o string
        unidadDeMedida: i.unidadDeMedida || '-',
        cantidadDisponible: Number(i.cantidadDisponible ?? 0),
        precioUnitario: Number(i.precioUnitario ?? 0),
        fechaIngreso: fmt(i.fechaIngreso),
      })),
    });
  } catch (e) { next(e); }
};

// ----------------- PEDIDOS -----------------
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
      listLabel: `Total: ${pedidos.length}${estado ? ` · Estado: ${estado}` : ''}${q ? ` · Filtro: "${q}"` : ''}`,
      createdBy,
      logoPath: LOGO,
      filename: `pedidos_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Cliente',  key: 'cliente',  width: 140 },
        { header: 'Producto', key: 'producto', width: 130 },
        { header: 'Cant.',    key: 'cantidad', width: 48, isNumeric: true },
        { header: 'Total',    key: 'total',    width: 80, isCurrency: true },
        { header: 'Pagado',   key: 'pagado',   width: 80, isCurrency: true },
        { header: 'Saldo',    key: 'saldo',    width: 80, isCurrency: true },
        { header: 'Estado',   key: 'estado',   width: 82 },
        { header: 'Entrega',  key: 'entrega',  width: 82 },
      ],
      rows: pedidos.map(p => ({
        cliente:  `${p.cliente?.nombre || ''} ${p.cliente?.apellido || ''}`.trim() || '-',
        producto: p.producto?.nombre || '-',
        cantidad: Number(p.cantidad ?? 0),
        total:    Number(p.total ?? 0),
        pagado:   Number(p.pagado ?? 0),
        saldo:    Number(p.saldo ?? 0),
        estado:   p.estado || '-',
        entrega:  fmt(p.fechaEntrega),
      })),
    });
  } catch (e) { next(e); }
};

// ----------------- PRODUCTOS -----------------
exports.exportProductos = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const prods = await Producto.find({})
      .populate('materiales.material', 'nombre unidadDeMedida')
      .sort({ nombre: 1 })
      .lean();

    await exportTablePdf(res, {
      title: 'Productos',
      listLabel: `Total: ${prods.length}`,
      createdBy,
      logoPath: LOGO,
      filename: `productos_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre',       key: 'nombre',        width: 150 },
        { header: 'Descripción',  key: 'descripcion',   width: 200 },
        { header: 'Precio',       key: 'precioUnitario',width: 80, isCurrency: true },
        { header: 'Materiales',   key: 'materiales',    width: 140 },
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

// ----------------- USUARIOS -----------------
exports.exportUsuarios = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const users = await Usuario.find({}).select('-contrasena').sort({ createdAt: -1 }).lean();

    const mapRol = (rol) => {
      switch (rol) {
        case 'usuario_normal': return 'MAQUINARIA';
        case 'administrador':  return 'ADMINISTRADOR';
        default:               return rol || '-';
      }
    };

    await exportTablePdf(res, {
      title: 'Usuarios',
      listLabel: `Total: ${users.length}`,
      createdBy,
      logoPath: LOGO,
      filename: `usuarios_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre',   key: 'nombreCompleto', width: 180 },
        { header: 'Correo',   key: 'correo',         width: 200 },
        { header: 'Teléfono', key: 'telefono',       width: 110 },
        { header: 'Rol',      key: 'rol',            width: 110 },
      ],
      rows: users.map(u => ({
        nombreCompleto: u.nombreCompleto || '-',
        correo:   u.correo || '-',
        telefono: u.telefono || '-',
        rol:      mapRol(u.rol),
      })),
    });
  } catch (e) { next(e); }
};

// ----------------- CATEGORÍAS -----------------
exports.exportCategorias = async (req, res, next) => {
  try {
    const createdBy = req.user?.nombreCompleto || req.user?.correo || 'Usuario';
    const { q = '', tipo } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (q) {
      where.$or = [
        { nombre: { $regex: q, $options: 'i' } },
        { prefijo: { $regex: q, $options: 'i' } },
        { tipo: { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } },
      ];
    }

    const cats = await Categoria.find(where).sort({ tipo: 1, nombre: 1 }).lean();

    await exportTablePdf(res, {
      title: 'Categorías',
      listLabel: `Total: ${cats.length}${tipo ? ` · Tipo: ${cap(tipo)}` : ''}${q ? ` · Filtro: "${q}"` : ''}`,
      createdBy,
      logoPath: LOGO,
      filename: `categorias_${dayjs().format('YYYYMMDD_HHmm')}.pdf`,
      columns: [
        { header: 'Nombre',       key: 'nombre',      width: 160 },
        { header: 'Prefijo',      key: 'prefijo',     width: 70 },
        { header: 'Tipo',         key: 'tipo',        width: 100 },
        { header: 'Descripción',  key: 'descripcion', width: 220 },
        { header: 'Creado',       key: 'creado',      width: 90 },
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
