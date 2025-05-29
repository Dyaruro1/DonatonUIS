import React, { useEffect, useState } from "react";
import "./AdminPost.css";
import AdminSidebar from "../components/AdminSidebar";

function AdminPost() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicaciones() {
      setLoading(true);
      try {
        // Usa la URL absoluta del backend para desarrollo local
        const resp = await fetch("http://localhost:8000/api/prendas/admin-list/");
        const data = await resp.json();
        console.log('DATA ADMIN:', data); // <-- Depuración
        setPublicaciones(data);
      } catch (e) {
        setPublicaciones([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicaciones();
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
                {publicaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: '#fff', textAlign: 'center', padding: 24 }}>
                      No hay publicaciones activas.
                    </td>
                  </tr>
                ) : (
                  publicaciones.map((p) => (
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
                          src={
                            p.imagen_url
                              ? (p.imagen_url.startsWith('http') ? p.imagen_url : `http://localhost:8000${p.imagen_url}`)
                              : (p.imagenes && p.imagenes[0]?.imagen
                                  ? (p.imagenes[0].imagen.startsWith('http') ? p.imagenes[0].imagen : `http://localhost:8000${p.imagenes[0].imagen}`)
                                  : "/logo-pequeno.svg")
                          }
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
                      <td>{p.visitas ?? 0}</td>
                      <td>{p.postulados ?? 0}</td>
                      <td>
                        <span
                          style={{
                            background: "none",
                            color: "#21e058",
                            border: "none",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          title={`Contactar donante`}
                          tabIndex={0}
                        >
                          Contactar donante
                        </span>
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPost;