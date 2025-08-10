import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const coloresPie = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardCompleto() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    fetch("/api/pedidos").then(res => res.json()).then(setPedidos).catch(console.error);
    fetch("/api/productos").then(res => res.json()).then(setProductos).catch(console.error);
    fetch("/api/inventario").then(res => res.json()).then(setInventario).catch(console.error);
  }, []);

  const totalIngresos = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);

  const ingresosPorDia = pedidos.reduce((acc, p) => {
    const fecha = new Date(p.fecha).toLocaleDateString("es-BO");
    acc[fecha] = acc[fecha] || { name: fecha, ingresos: 0 };
    acc[fecha].ingresos += p.total || 0;
    return acc;
  }, {});
  const dataIngresos = Object.values(ingresosPorDia).slice(-10);

  const productosPorCategoria = productos.reduce((acc, prod) => {
    const cat = prod.categoria || "Otros";
    acc[cat] = acc[cat] ? acc[cat] + 1 : 1;
    return acc;
  }, {});
  const dataPie = Object.entries(productosPorCategoria).map(([name, value]) => ({ name, value }));

  const inventarioBajo = inventario.filter(i => i.cantidad <= 5);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Resumen Rápido</h2>
        <ul className="space-y-4 text-sm text-gray-700">
          <li>Pedidos: {pedidos.length}</li>
          <li>Ingresos: Bs {totalIngresos.toFixed(2)}</li>
          <li>Productos: {productos.length}</li>
          <li>Inventario Bajo: {inventarioBajo.length}</li>
        </ul>
        <hr className="my-6" />
        <h3 className="font-semibold text-sm mb-2">Categorías</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          {dataPie.map((cat, i) => (
            <li key={i}>• {cat.name} ({cat.value})</li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard General</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {/* Gráfico de área */}
          <div className="bg-white rounded-xl shadow p-4 col-span-2">
            <h2 className="text-lg font-semibold mb-4">Ingresos por Día</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dataIngresos}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="ingresos" stroke="#10b981" fill="url(#colorIngresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Productos por Categoría</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coloresPie[index % coloresPie.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Productos con inventario bajo */}
          <div className="bg-white rounded-xl shadow p-4 col-span-1">
            <h2 className="text-lg font-semibold mb-4">Inventario Bajo</h2>
            <ul className="text-sm text-gray-700 space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {inventarioBajo.length === 0 && <li>No hay productos con stock bajo.</li>}
              {inventarioBajo.map((prod, idx) => (
                <li key={idx} className="border-b pb-1">{prod.nombre} — {prod.cantidad} unidades</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}