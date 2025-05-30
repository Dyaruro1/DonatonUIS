import React, { useEffect, useState } from "react";
import "./AdminPost.css";
import AdminSidebar from "../components/AdminSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../services/api'; // Importa tu helper de axios

function AdminPost() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pendientes"); // 'pendientes' o 'disponibles'
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchPublicaciones() {
      setLoading(true);
      try {
        let data;
        if (tab === "pendientes") {
          const resp = await fetch("http://localhost:8000/api/prendas/admin-list/");
          data = await resp.json();
        } else {
          // Usa axios autenticado para publicaciones disponibles
          const resp = await api.get("/api/prendas/?upload_status=Cargado");
          data = resp.data;
        }
        setPublicaciones(Array.isArray(data) ? data : []);
      } catch (e) {
        setPublicaciones([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicaciones();
  }, [location, tab]);

  // Render tabs
  const renderTabs = () => (
    <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
      <button
        className={tab === 'pendientes' ? 'admin-tab-active' : 'admin-tab'}
        style={{
          background: tab === 'pendientes' ? '#23233a' : 'transparent',
          color: tab === 'pendientes' ? '#21e058' : '#babcc4',
          fontWeight: 700,
          fontSize: '1.13rem',
          border: 'none',
          borderRadius: 18,
          padding: '0.5rem 1.5rem',
          cursor: 'pointer',
          transition: 'background 0.18s, color 0.18s',
        }}
        onClick={() => setTab('pendientes')}
      >
        Publicaciones pendientes
      </button>
      <button
        className={tab === 'disponibles' ? 'admin-tab-active' : 'admin-tab'}
        style={{
          background: tab === 'disponibles' ? '#23233a' : 'transparent',
          color: tab === 'disponibles' ? '#21e058' : '#babcc4',
          fontWeight: 700,
          fontSize: '1.13rem',
          border: 'none',
          borderRadius: 18,
          padding: '0.5rem 1.5rem',
          cursor: 'pointer',
          transition: 'background 0.18s, color 0.18s',
        }}
        onClick={() => setTab('disponibles')}
      >
        Publicaciones disponibles
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#18192b" }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78 }}>
        <div className="admin-usuarios-container">
          <h2 className="admin-usuarios-title">
            {tab === 'pendientes' ? 'Publicaciones Pendientes' : 'Publicaciones Disponibles'}
          </h2>
          {renderTabs()}
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
                  <th>Contactar</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: '#fff', textAlign: 'center', padding: 24 }}>
                      No hay publicaciones {tab === 'pendientes' ? 'pendientes' : 'disponibles'}.
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
                        <span
                          style={{ fontWeight: 600, cursor: 'pointer', color: '#3151cf' }}
                          onClick={() => navigate(`/admin/posts/${p.id}`)}
                        >
                          {p.nombre}
                        </span>
                      </td>
                      <td>{p.visitas ?? 0}</td>
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
                          onClick={() => navigate(`/admin/posts/${p.id}`)}
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