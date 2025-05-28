import React, { useEffect, useState } from "react";
import { Table, Tag, Spin } from "antd";
import "./AdminPost.css"; // Reutiliza estilos de tabla de usuarios

function AdminPost() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reemplaza la URL por tu endpoint real de publicaciones
    fetch("/api/publicaciones")
      .then((res) => res.json())
      .then((data) => {
        setPublicaciones(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="admin-usuarios-container">
      <h2 className="admin-usuarios-title">Gestión de Publicaciones</h2>
      {loading ? (
        <Spin size="large" />
      ) : (
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {publicaciones.map((p) => (
              <tr key={p.id}>
                <td>{p.titulo}</td>
                <td>{p.usuario?.nombre || p.usuario?.username || "Sin usuario"}</td>
                <td>
                  {p.estado === "aprobado" ? (
                    <Tag color="green">Aprobado</Tag>
                  ) : p.estado === "pendiente" ? (
                    <Tag color="orange">Pendiente</Tag>
                  ) : (
                    <Tag color="red">{p.estado}</Tag>
                  )}
                </td>
                <td>{p.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPost;