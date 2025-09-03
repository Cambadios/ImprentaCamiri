// src/pages/admin/usuarios/UsuariosPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { apiFetch } from "../../../api/http";
import UsuariosList from "./UsuariosList";
import UsuarioForm from "./UsuariosForm";
import { downloadFile } from "../../../api/download";

const UsuariosPage = () => {
  const toast = useRef(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [visibleForm, setVisibleForm] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  // Rol actual (seguro)
  let currentRole = "usuario";
  try {
    const sessionRaw = localStorage.getItem("usuario");
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;
    currentRole = session?.usuario?.rol || session?.rol || "usuario";
  } catch (e) {
    console.log(e);
  }
  const isAdmin = currentRole === "admin" || currentRole === "administrador";
  const headerTitle = isAdmin ? "Gestión de Usuarios" : "Gestión de Usuarios";

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const resp = await apiFetch("/usuarios", { method: "GET" });
      const data = await resp.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Filtro local: nombre/correo/CI/teléfono/rol
  const usuariosFiltrados = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      [u?.nombreCompleto, u?.correo, u?.carnetIdentidad, u?.telefono, u?.rol]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [usuarios, search]);

  const onCrear = () => {
    setUsuarioEdit(null);
    setVisibleForm(true);
  };

  const onEditar = (row) => {
    setUsuarioEdit(row);
    setVisibleForm(true);
  };

  const onEliminar = (row) => {
    confirmDialog({
      message: `¿Eliminar al usuario "${row.nombreCompleto}"?`,
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const resp = await apiFetch(`/usuarios/${row._id}`, {
            method: "DELETE",
          });
          if (!resp.ok) throw new Error("Error al eliminar");
          toast.current?.show({
            severity: "success",
            summary: "Eliminado",
            detail: "Usuario eliminado correctamente",
            life: 2500,
          });
          fetchUsuarios();
        } catch (e) {
          console.error(e);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "No se pudo eliminar el usuario",
          });
        }
      },
    });
  };

  const onEnviarRecuperacion = async (row) => {
    try {
      const resp = await apiFetch(`/usuarios/olvide-contrasena`, {
        method: "POST",
        body: JSON.stringify({ correo: row.correo }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.mensaje || "Error");
      toast.current?.show({
        severity: "info",
        summary: "Recuperación",
        detail: data?.mensaje || "Enlace de recuperación enviado (simulado)",
      });
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo enviar el enlace de recuperación",
      });
    }
  };

  // Guardar (crear/editar)
  const onSubmitForm = async (payload, isEdit) => {
    try {
      const url = isEdit ? `/usuarios/${usuarioEdit._id}` : "/usuarios";
      const method = isEdit ? "PUT" : "POST";
      const resp = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.mensaje || "Error en el guardado");

      toast.current?.show({
        severity: "success",
        summary: isEdit ? "Actualizado" : "Creado",
        detail:
          data?.mensaje || (isEdit ? "Usuario actualizado" : "Usuario creado"),
      });

      setVisibleForm(false);
      setUsuarioEdit(null);
      fetchUsuarios();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: e.message || "No se pudo guardar",
      });
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header como ClientesPage */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">{headerTitle}</h2>
        <div className="space-x-3">
          <Button
            label="Nuevo Usuario"
            icon="pi pi-user-plus"
            className="p-button-success"
            onClick={onCrear}
            disabled={loading}
          />
          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() =>
              downloadFile("/api/export/usuarios.pdf", "Listado de Usuarios.pdf")
            }
          />
        </div>
      </div>

      {/* Barra de búsqueda (paleta copiada: gris + full-width) */}
      <div className="mb-4">
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            type="text"
            placeholder="Buscar por nombre, correo, CI, teléfono o rol"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </span>
      </div>

      {/* Lista */}
      <UsuariosList
        rows={usuariosFiltrados}
        loading={loading}
        onEdit={onEditar}
        onDelete={onEliminar}
        onSendRecovery={onEnviarRecuperacion}
      />

      {/* Form */}
      <UsuarioForm
        visible={visibleForm}
        onHide={() => {
          setVisibleForm(false);
          setUsuarioEdit(null);
        }}
        onSubmit={onSubmitForm}
        usuarioEdit={usuarioEdit}
      />
    </div>
  );
};

export default UsuariosPage;
