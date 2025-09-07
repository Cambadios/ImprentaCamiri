const Categoria = require('../models/categoria');

exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, tipo, prefijo, descripcion } = req.body;
    if (!nombre || !tipo || !prefijo) {
      return res.status(400).json({ message: 'nombre, tipo y prefijo son requeridos' });
    }
    const cat = await Categoria.create({ nombre, tipo, prefijo, descripcion });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Ya existe una categoría con ese prefijo y nombre.' });
    }
    res.status(400).json({ message: e.message });
  }
};

exports.listarCategorias = async (req, res) => {
  try {
    const { tipo } = req.query;
    const where = tipo ? { tipo } : {};
    // Usa la misma collation si filtras/ordenas por campos del índice
    const cats = await Categoria.find(where).collation({ locale: 'es', strength: 1 })
      .sort({ tipo: 1, nombre: 1 })
      .lean();
    res.json(cats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, prefijo, descripcion } = req.body;
    const cat = await Categoria.findByIdAndUpdate(
      id,
      { nombre, tipo, prefijo, descripcion },
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(cat);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Ya existe una categoría con ese prefijo y nombre.' });
    }
    res.status(400).json({ message: e.message });
  }
};

exports.eliminarCategoria = async (req, res) => {
  try {
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoría eliminada' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
