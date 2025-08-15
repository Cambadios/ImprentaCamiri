const Producto = require('../models/producto');
const Inventario = require('../models/inventario');

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precioUnitario, materiales } = req.body;

    // Verificar que todos los campos estén presentes
    if (!nombre || !descripcion || precioUnitario == null || !materiales) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar existencia de materiales y actualizarlos en inventario
    for (let i = 0; i < materiales.length; i++) {
      const material = await Inventario.findById(materiales[i].material);
      if (!material) {
        return res.status(404).json({ message: `Material ${materiales[i].material} no encontrado en inventario` });
      }
      
      if (material.cantidadDisponible < materiales[i].cantidadPorUnidad) {
        return res.status(400).json({ message: `No hay suficiente cantidad de ${material.nombre} en inventario` });
      }

      // Actualizar inventario: descontar materiales utilizados
      material.cantidadDisponible -= materiales[i].cantidadPorUnidad;
      await material.save();
    }

    // Crear el nuevo producto
    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precioUnitario,
      materiales,
    });

    // Guardar el producto
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('materiales.material');
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precioUnitario, materiales } = req.body;

    const producto = await Producto.findByIdAndUpdate(
      id,
      { nombre, descripcion, precioUnitario, materiales },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
