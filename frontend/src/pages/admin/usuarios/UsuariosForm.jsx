// src/pages/admin/usuarios/UsuarioForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Password } from "primereact/password";
import { Button } from "primereact/button";

const roles = [
  { label: "ADMINISTRADOR", value: "administrador" },
  { label: "MAQUINARIA", value: "usuario_normal" },
];

const init = {
  nombreCompleto: "",
  correo: "",
  contrasena: "",
  telefono: "",
  carnetIdentidad: "",
  rol: "usuario",
};

const UsuarioForm = ({ visible, onHide, onSubmit, usuarioEdit }) => {
  const isEdit = !!usuarioEdit;
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setForm({
        nombreCompleto: usuarioEdit.nombreCompleto || "",
        correo: usuarioEdit.correo || "",
        contrasena: "",
        telefono: usuarioEdit.telefono || "",
        carnetIdentidad: usuarioEdit.carnetIdentidad || "",
        rol: usuarioEdit.rol || "usuario",
      });
    } else {
      setForm(init);
    }
  }, [usuarioEdit, isEdit, visible]);

  // Validaciones (mismas reglas que ya tenías)
  const correoOk = /^\S+@\S+\.\S+$/.test(form.correo || "");
  const telOk = /^[0-9+\-() ]{6,20}$/.test(form.telefono || "");
  const errors = useMemo(() => {
    const e = {};
    if (!form.nombreCompleto?.trim()) e.nombreCompleto = "El nombre completo es obligatorio";
    if (!form.correo?.trim()) e.correo = "El correo es obligatorio";
    else if (!correoOk) e.correo = "El correo no es válido";
    if (!isEdit) {
      if (!form.contrasena) e.contrasena = "La contraseña es obligatoria";
      else if ((form.contrasena || "").length < 6) e.contrasena = "Mínimo 6 caracteres";
    }
    if (!form.telefono?.trim()) e.telefono = "El teléfono es obligatorio";
    else if (!telOk) e.telefono = "Formato inválido (6–20, dígitos y + - ( ) )";
    if (!form.carnetIdentidad?.trim()) e.carnetIdentidad = "El CI es obligatorio";
    if (!form.rol) e.rol = "Selecciona un rol";
    return e;
  }, [form, isEdit, correoOk, telOk]);

  const disabledGuardar = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleChange = (field) => (e) => {
    const value = e?.target?.value ?? e?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        nombreCompleto: (form.nombreCompleto || "").trim(),
        correo: (form.correo || "").trim().toLowerCase(),
        telefono: (form.telefono || "").trim(),
        carnetIdentidad: (form.carnetIdentidad || "").trim(),
        rol: form.rol,
      };
      if (!isEdit) payload.contrasena = form.contrasena;
      await onSubmit(payload, isEdit);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar usuario" : "Nuevo usuario"}
      visible={visible}
      style={{ width: "520px", maxWidth: "95vw" }}
      modal
      onHide={onHide}
      footer={
        <div className="flex justify-between space-x-2">
          <Button
            label="Cancelar"
            onClick={onHide}
            className="p-button-outlined p-button-secondary"
          />
          <Button
            label={isEdit ? "Guardar" : "Crear"}
            onClick={submit}
            disabled={disabledGuardar}
            loading={saving}
          />
        </div>
      }
      className="rounded-2xl"
    >
      {/* === Paleta copiada de ClientesForm === */}
      <div className="p-fluid space-y-4">
        {/* Nombre completo */}
        <div className="p-field">
          <label htmlFor="nombreCompleto" className="block text-gray-700">
            Nombre completo
          </label>
          <InputText
            id="nombreCompleto"
            value={form.nombreCompleto}
            onChange={handleChange("nombreCompleto")}
            placeholder="Ej. Juan Pérez"
            className={`w-full p-inputtext-sm border-2 border-gray-300 rounded-md ${errors.nombreCompleto ? "p-invalid" : ""}`}
          />
          {errors.nombreCompleto && (
            <small className="p-error text-red-600">{errors.nombreCompleto}</small>
          )}
        </div>

        {/* Correo */}
        <div className="p-field">
          <label htmlFor="correo" className="block text-gray-700">
            Correo
          </label>
          <InputText
            id="correo"
            value={form.correo}
            onChange={handleChange("correo")}
            placeholder="ejemplo@correo.com"
            className={`w-full p-inputtext-sm border-2 border-gray-300 rounded-md ${errors.correo ? "p-invalid" : ""}`}
          />
          {errors.correo && (
            <small className="p-error text-red-600">{errors.correo}</small>
          )}
        </div>

        {/* Contraseña (solo crear) */}
        {!isEdit && (
          <div className="p-field">
            <label htmlFor="contrasena" className="block text-gray-700">
              Contraseña (mín. 6)
            </label>
            <Password
              id="contrasena"
              value={form.contrasena}
              onChange={handleChange("contrasena")}
              toggleMask
              feedback={false}
              placeholder="********"
              inputClassName={`w-full p-inputtext-sm border-2 border-gray-300 rounded-md ${errors.contrasena ? "p-invalid" : ""}`}
              className="w-full"
            />
            {errors.contrasena && (
              <small className="p-error text-red-600">{errors.contrasena}</small>
            )}
          </div>
        )}

        {/* Teléfono */}
        <div className="p-field">
          <label htmlFor="telefono" className="block text-gray-700">
            Teléfono
          </label>
          <InputText
            id="telefono"
            value={form.telefono}
            onChange={handleChange("telefono")}
            placeholder="+591 7xxxxxx"
            className={`w-full p-inputtext-sm border-2 border-gray-300 rounded-md ${errors.telefono ? "p-invalid" : ""}`}
          />
          {errors.telefono && (
            <small className="p-error text-red-600">{errors.telefono}</small>
          )}
        </div>

        {/* Carnet de identidad */}
        <div className="p-field">
          <label htmlFor="carnetIdentidad" className="block text-gray-700">
            Carnet de identidad
          </label>
          <InputText
            id="carnetIdentidad"
            value={form.carnetIdentidad}
            onChange={handleChange("carnetIdentidad")}
            placeholder="CI"
            className={`w-full p-inputtext-sm border-2 border-gray-300 rounded-md ${errors.carnetIdentidad ? "p-invalid" : ""}`}
          />
          {errors.carnetIdentidad && (
            <small className="p-error text-red-600">{errors.carnetIdentidad}</small>
          )}
        </div>

        {/* Rol */}
        <div className="p-field">
          <label htmlFor="rol" className="block text-gray-700">
            Rol
          </label>
          <Dropdown
            id="rol"
            value={form.rol}
            onChange={handleChange("rol")}
            options={roles}
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona un rol"
            className={`w-full ${errors.rol ? "p-invalid" : ""}`}
            panelClassName="rounded-md"
          />
          {errors.rol && (
            <small className="p-error text-red-600">{errors.rol}</small>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default UsuarioForm;
