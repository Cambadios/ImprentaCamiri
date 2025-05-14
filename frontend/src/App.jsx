// src/App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./login/Login";
import Principal from "./principal/Principal";
import ClienteForm from "./clientes/ClienteForm";
import ClienteList from "./clientes/ClienteList";
import PedidoForm from "./pedidos/PedidoForm";
import PedidoList from "./pedidos/PedidoList";  // Asegúrate de que esta ruta esté bien definida

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/principal" element={<Principal />} />
      <Route path="/clientes" element={<ClienteList />} />
      <Route path="/clientes/agregar" element={<ClienteForm />} />
      <Route path="/pedidos" element={<PedidoList />} /> {/* Asegúrate de que esta ruta esté configurada */}
      <Route path="/pedidos/agregar" element={<PedidoForm />} />
    </Routes>
  );
}

export default App;
