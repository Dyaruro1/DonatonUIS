import React, { useEffect, useState } from "react";
import "./AdminPost.css";
import AdminSidebar from "../components/AdminSidebar";

function AdminPost() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prendas/admin-list/")
      .then((res) => res.json())
      .then((data) => {
        setPublicaciones(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#18192b" }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78 }}>
        <div className="admin-usuarios-container">
          <h2 className="admin-usuarios-title">Publicaciones activas</h2>
          {loading ? (
            <div style={{ color: "#fff" }}>Cargando...</div>
          ) : (
            <table className="admin-usuarios-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" disabled />
                  </th>
                  <th>Lista de publicaciones</th>
                  <th>Visitas</th>
                  <th>Postulados</th>
                  <th>Contactar</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <img
                        src={p.imagen_url || "/logo-pequeno.svg"}
                        alt="prenda"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                          background: "#23233a",
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>{p.nombre}</span>
                    </td>
                    <td>{p.visitas}</td>
                    <td>{p.postulados}</td>
                    <td>
                      <button
                        style={{
                          background: "none",
                          color: "#21e058",
                          border: "none",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Contactar donante
                      </button>
                    </td>
                    <td>
                      <button
                        className="admin-eye-btn"
                        title="Ver publicación"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <ellipse
                            cx="14"
                            cy="14"
                            rx="11"
                            ry="8"
                            fill="#23233a"
                            stroke="#babcc4"
                            strokeWidth="2"
                          />
                          <circle
                            cx="14"
                            cy="14"
                            r="3.5"
                            fill="#fff"
                            stroke="#babcc4"
                            strokeWidth="2"
                          />
                          <circle cx="14" cy="14" r="2" fill="#3151cf" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPost;