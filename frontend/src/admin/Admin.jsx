// src/admin/Admin.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

const images = [
  "https://i.pinimg.com/736x/17/a0/3a/17a03ace53bc30adaa41076ecef390db.jpg",
  "https://i.pinimg.com/736x/58/53/0d/58530d89ee39c6edadc2050e999c7c55.jpg",
  "https://i.pinimg.com/736x/ec/2d/65/ec2d65b1b5b6db77cfccd103a2fc2401.jpg",
  "https://i.pinimg.com/736x/be/ce/66/bece66c645007d8ac38175255ed9af39.jpg",
  "https://i.pinimg.com/736x/65/af/c7/65afc7acdfe22a457e97e5c757360193.jpg",
  "https://i.pinimg.com/736x/5f/20/8e/5f208e18db4f240785d1d4ce88b99a2c.jpg",
];

// Botón reutilizable
function NavButton({ to, onClick, icon, label }) {
  const content = (
    <button className="admin-button" type="button" onClick={onClick}>
      <img src={icon} alt={label} />
      <span>{label}</span>
    </button>
  );
  return to ? (
    <Link to={to} className="no-link">{content}</Link>
  ) : content;
}

function Admin() {
  const [date, setDate] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "{}"); }
    catch { return {}; }
  }, []);
  const nombre = usuario?.nombreCompleto || "Usuario";

  useEffect(() => {
    const today = new Date();
    const opts = { day: "2-digit", month: "2-digit", year: "numeric" };
    setDate(today.toLocaleDateString("es-BO", opts));

    const interval = setInterval(() => {
      setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenAccount(false);
    }
    if (openAccount) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openAccount]);

  const prevImage = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const goPerfil = () => navigate("/perfil");
  const goConfig = () => navigate("/configuracion");

  return (
    <div className={`admin-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`bg-image-${i + 1} bg-image`} />
      ))}

      {/* Header */}
      <header className="admin-header">
        <h1>BIENVENIDO A LA ADMINISTRACIÓN DE IMPRENTA CAMIRI</h1>
        <p>Aquí podrás administrar toda la imprenta en tus manos.</p>
        <span className="date">{date}</span>
      </header>

      {/* Sidebar */}
      <nav className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        {/* Brand circular */}
        <div style={{ display: "grid", placeItems: "center", padding: "14px 10px 6px" }}>
          <div
            style={{
              width: 92, height: 92, borderRadius: 999,
              background:"radial-gradient(circle at 30% 30%, #fff 0%, #f7f0df 40%, #e6d7b7 100%)",
              boxShadow:"inset 0 2px 6px rgba(0,0,0,.06), 0 4px 10px rgba(0,0,0,.08)",
              display:"grid", placeItems:"center", textAlign:"center", padding:10
            }}
          >
            <span style={{ fontWeight:800, color:"#2e2a22", lineHeight:1.05, letterSpacing:.4, fontSize:12, textTransform:"uppercase" }}>
              Imprenta<br/>Camiri
            </span>
          </div>
        </div>

        {/* Navegación */}
        <NavButton onClick={() => navigate("/dashboard")} icon="https://png.pngtree.com/png-clipart/20230328/original/pngtree-dashboard-silhouette-icon-transparent-background-png-image_9007538.png" label="DASHBOARD" />
        <NavButton to="/admin/clientes" icon="https://cdn-icons-png.flaticon.com/512/686/686348.png" label="CLIENTE" />
        <NavButton to="/admin/pedidos" icon="https://cdn-icons-png.flaticon.com/512/6384/6384868.png" label="PEDIDO" />
        <NavButton to="/admin/inventario" icon="https://cdn-icons-png.flaticon.com/512/2897/2897785.png" label="INVENTARIO" />
        <NavButton to="/admin/productos" icon="https://cdn-icons-png.flaticon.com/512/2991/2991123.png" label="PRODUCTOS" />
        <NavButton to="/admin/usuarios" icon="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" label="USUARIOS" />
        <NavButton onClick={() => navigate("/reportes")} icon="https://cdn-icons-png.flaticon.com/512/5674/5674015.png" label="REPORTES" />

        {/* Usuario + cuenta */}
        <div ref={menuRef} style={{ position:"relative", marginTop:"auto", padding:"10px", borderTop:"1px solid rgba(0,0,0,.06)" }}>
          <button
            type="button"
            onClick={() => setOpenAccount(v => !v)}
            title="Cuenta"
            style={{
              width:"100%", display:"grid", gridTemplateColumns:"38px 1fr", alignItems:"center", gap:10,
              padding:8, background:"rgba(255,255,255,.5)", border:0, borderRadius:12, cursor:"pointer", textAlign:"left"
            }}
          >
            <div aria-hidden style={{
              width:38, height:38, borderRadius:999, display:"grid", placeItems:"center",
              background:"linear-gradient(145deg, #fff, #f2e7cf)", fontWeight:800, color:"#2e2a22"
            }}>
              {(nombre && nombre[0]) || "U"}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
              <span title={nombre} style={{ fontWeight:700, color:"#2e2a22", fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {nombre}
              </span>
              <span aria-hidden style={{ color:"#6b6457", transform: openAccount ? "rotate(180deg)" : "none", transition:"transform .15s ease" }}>
                ▴
              </span>
            </div>
          </button>

          {openAccount && (
            <div style={{
              position:"absolute", left:10, right:10, bottom:64, background:"#fff",
              borderRadius:12, boxShadow:"0 10px 30px rgba(0,0,0,.12)", padding:8,
              display:"grid", gap:6, zIndex:5
            }}>
              <button type="button" onClick={goPerfil} className="dropdown-btn">Perfil</button>
              <button type="button" onClick={goConfig} className="dropdown-btn">Configuración</button>
              <button type="button" onClick={handleLogout} className="dropdown-btn danger">Cerrar sesión</button>
            </div>
          )}
        </div>
      </nav>

      {/* Accesos centrales */}
      <div className="admin-buttons">
        <NavButton onClick={() => navigate("/dashboard")} icon="https://png.pngtree.com/png-clipart/20230328/original/pngtree-dashboard-silhouette-icon-transparent-background-png-image_9007538.png" label="DASHBOARD" />
        <NavButton to="/admin/clientes" icon="https://cdn-icons-png.flaticon.com/512/686/686348.png" label="CLIENTE" />
        <NavButton to="/admin/pedidos" icon="https://cdn-icons-png.flaticon.com/512/6384/6384868.png" label="PEDIDO" />
        <NavButton to="/admin/inventario" icon="https://cdn-icons-png.flaticon.com/512/2897/2897785.png" label="INVENTARIO" />
        <NavButton to="/admin/productos" icon="https://cdn-icons-png.flaticon.com/512/2991/2991123.png" label="PRODUCTOS" />
        <NavButton to="/admin/usuarios" icon="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" label="USUARIOS" />
        <NavButton onClick={() => navigate("/reportes")} icon="https://cdn-icons-png.flaticon.com/512/5674/5674015.png" label="REPORTES" />
      </div>

      {/* Carrusel */}
      <div className="carousel-container">
        <button className="carousel-btn prev-btn" onClick={prevImage} aria-label="Imagen anterior" type="button">
          &#10094;
        </button>
        <img src={images[currentIndex]} alt={`Imagen ${currentIndex + 1}`} className="carousel-image" />
        <button className="carousel-btn next-btn" onClick={nextImage} aria-label="Imagen siguiente" type="button">
          &#10095;
        </button>
      </div>

      {/* === NUEVA ZONA INFERIOR: Agenda + Avisos === */}
      <div className="dashboard-bottom">
        <AgendaWidget />
        <AvisosWidget />
      </div>
    </div>
  );
}

// --------- Widgets ---------

function AgendaWidget() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("agendaItems");
    if (saved) return JSON.parse(saved);
    // Semilla inicial
    return [
      { id: cryptoRandom(), titulo: "Entrega Flyer Empresa X", fecha: proxDia(2), etiqueta: "Urgente" },
      { id: cryptoRandom(), titulo: "Mantenimiento impresora", fecha: proxDia(5), etiqueta: "Técnico" },
    ];
  });
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [etiqueta, setEtiqueta] = useState("");

  useEffect(() => {
    localStorage.setItem("agendaItems", JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    e.preventDefault();
    if (!titulo || !fecha) return;
    setItems((prev) => [{ id: cryptoRandom(), titulo, fecha, etiqueta }, ...prev]);
    setTitulo(""); setFecha(""); setEtiqueta("");
  };
  const removeItem = (id) => setItems((prev) => prev.filter(i => i.id !== id));

  return (
    <section className="card widget">
      <div className="widget-head">
        <h3>Agenda / Recordatorios</h3>
      </div>

      <form className="widget-form" onSubmit={addItem}>
        <input
          type="text" placeholder="Título (p.ej. Entrega afiche)" value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input
          type="text" placeholder="Etiqueta (Urgente / Cliente / Técnico)" value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        />
        <button type="submit">Añadir</button>
      </form>

      <ul className="widget-list">
        {items.length === 0 && <li className="muted">Sin tareas por ahora.</li>}
        {items.map((i) => (
          <li key={i.id} className="widget-item">
            <div>
              <strong>{i.titulo}</strong>
              <div className="muted">{fmtFecha(i.fecha)} {i.etiqueta ? `• ${i.etiqueta}` : ""}</div>
            </div>
            <button className="pill danger" type="button" onClick={() => removeItem(i.id)}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AvisosWidget() {
  const [avisos, setAvisos] = useState(() => {
    const saved = localStorage.getItem("avisosInternos");
    if (saved) return JSON.parse(saved);
    return [
      { id: cryptoRandom(), titulo: "Nuevo papel fotográfico en stock", cuerpo: "Disponible desde hoy.", prioridad: "Info" },
      { id: cryptoRandom(), titulo: "Actualización del sistema", cuerpo: "Sábado 22:00, 15 min.", prioridad: "Aviso" },
      { id: cryptoRandom(), titulo: "Reunión de equipo", cuerpo: "Lunes 9:00 en sala 2.", prioridad: "Importante" },
    ];
  });

  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [prioridad, setPrioridad] = useState("Info");

  useEffect(() => {
    localStorage.setItem("avisosInternos", JSON.stringify(avisos));
  }, [avisos]);

  const addAviso = (e) => {
    e.preventDefault();
    if (!titulo) return;
    setAvisos(prev => [{ id: cryptoRandom(), titulo, cuerpo, prioridad }, ...prev]);
    setTitulo(""); setCuerpo(""); setPrioridad("Info");
  };
  const removeAviso = (id) => setAvisos(prev => prev.filter(a => a.id !== id));

  return (
    <section className="card widget">
      <div className="widget-head">
        <h3>Noticias / Avisos Internos</h3>
      </div>

      <form className="widget-form" onSubmit={addAviso}>
        <input type="text" placeholder="Título del aviso" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <input type="text" placeholder="Detalle (opcional)" value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} />
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option>Info</option>
          <option>Aviso</option>
          <option>Importante</option>
        </select>
        <button type="submit">Publicar</button>
      </form>

      <ul className="widget-list">
        {avisos.length === 0 && <li className="muted">Sin avisos por ahora.</li>}
        {avisos.map((a) => (
          <li key={a.id} className="widget-item">
            <div>
              <strong>{a.titulo}</strong>
              <div className="muted">
                {a.prioridad}{a.cuerpo ? ` • ${a.cuerpo}` : ""}
              </div>
            </div>
            <button className="pill" type="button" onClick={() => removeAviso(a.id)}>Ocultar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// utils
const dropdownBtnStyle = {
  all: "unset", padding: "10px 12px", borderRadius: 10, color: "#2e2a22", fontWeight: 600, cursor: "pointer",
};
function cryptoRandom() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function proxDia(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); }
function fmtFecha(iso) {
  try {
    const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`;
  } catch { return iso; }
}

export default Admin;
