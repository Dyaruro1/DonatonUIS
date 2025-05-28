import React, { useEffect, useState } from "react";
import "./AdminUsuarios.css";

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // Reemplaza la URL por tu endpoint real
    fetch("/api/usuarios/activos")
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  return (
    <div className="admin-usuarios-container">
      <h2 className="admin-usuarios-title">Usuarios Activos</h2>
      <table className="admin-usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.correo}</td>
              <td>{u.activo ? "Activo" : "Inactivo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosAdmin;