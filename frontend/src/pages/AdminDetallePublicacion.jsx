import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";
import "./AdminDetallePublicacion.css";

function AdminDetallePublicacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prenda, setPrenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    console.log('ID recibido en AdminDetallePublicacion:', id);
    async function fetchPrenda() {
      setLoading(true);
      setError("");
      try {
        // Usa fetch directo para evitar problemas de baseURL
        const resp = await fetch(`http://localhost:8000/api/prendas/${id}/`);
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${errText}`);
        }
        const data = await resp.json();
        console.log('Respuesta de la prenda:', data);
        setPrenda(data);
      } catch (e) {
        setError("No se pudo cargar la publicación: " + (e.message || e));
        console.error('Error al obtener la prenda:', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPrenda();
    else setError('ID de publicación no válido');
  }, [id]);

  const handleDelete = async () => {
    setEliminando(true);
    try {
      await fetch(`http://localhost:8000/api/prendas/${id}/`, { method: 'DELETE' });
      navigate("/admin/posts");
    } catch (e) {
      setError("No se pudo eliminar la publicación. " + (e.message || e));
    } finally {
      setEliminando(false);
      setShowConfirm(false);
    }
  };

  // Siempre muestra el id recibido y el estado
  if (loading) return <div style={{color:'#fff'}}>Cargando... (id: {id})</div>;
  if (error) return <div style={{color:'#ff6b6b'}}>Error: {error} (id: {id})</div>;
  if (!prenda) return <div style={{color:'#ff6b6b'}}>No se encontró la prenda (id: {id})</div>;

  const imagenes = prenda.imagenes && prenda.imagenes.length > 0 ? prenda.imagenes : (prenda.imagen_url ? [{ imagen: prenda.imagen_url }] : []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#18192b" }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78, padding: '2rem 0' }}>
        <button onClick={() => navigate("/admin/posts")} style={{marginLeft:32,marginBottom:24,background:'#23233a',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:600,cursor:'pointer'}}>Atrás</button>
        <div className="detalle-admin-container">
          <div className="detalle-admin-imgs">
            <div className="detalle-admin-thumbs">
              {imagenes.map((img, idx) => (
                <img
                  key={idx}
                  src={img.imagen.startsWith('http') ? img.imagen : `http://localhost:8000${img.imagen}`}
                  alt="thumb"
                  className={imgIndex === idx ? "active" : ""}
                  onClick={() => setImgIndex(idx)}
                  style={{cursor:'pointer'}}
                />
              ))}
            </div>
            <div className="detalle-admin-main-img">
              {imagenes[imgIndex] && (
                <img
                  src={imagenes[imgIndex].imagen.startsWith('http') ? imagenes[imgIndex].imagen : `http://localhost:8000${imagenes[imgIndex].imagen}`}
                  alt="main"
                />
              )}
            </div>
          </div>
          <div className="detalle-admin-info">
            <h2 style={{color:'#fff',fontWeight:700}}>{prenda.nombre}</h2>
            <div style={{color:'#babcc4',marginBottom:8}}>Publicado por <b>{prenda.usuario_nombre || prenda.usuario?.nombre || 'Desconocido'}</b></div>
            <div style={{display:'flex',gap:32,marginBottom:18}}>
              <div style={{color:'#babcc4'}}>Talla <span style={{color:'#3151cf',fontWeight:700}}>{prenda.talla}</span></div>
              <div style={{color:'#babcc4'}}>Sexo <span style={{color:'#7b5cff',fontWeight:700}}>{prenda.sexo}</span></div>
              <div style={{color:'#babcc4'}}>Uso <span style={{color:'#7b5cff',fontWeight:700}}>{prenda.uso}</span></div>
            </div>
            <div style={{marginBottom:24}}>
              <h3 style={{color:'#fff',marginBottom:6}}>Descripción</h3>
              <div style={{color:'#babcc4'}}>{prenda.descripcion}</div>
            </div>
            <button
              style={{background:'#ff3b3b',color:'#fff',fontWeight:700,fontSize:'1.1rem',border:'none',borderRadius:8,padding:'0.9rem 2.2rem',cursor:'pointer'}}
              onClick={()=>setShowConfirm(true)}
              disabled={eliminando}
            >
              Eliminar publicación
            </button>
            {showConfirm && (
              <div className="detalle-admin-modal-bg" onClick={()=>setShowConfirm(false)}>
                <div className="detalle-admin-modal" onClick={e=>e.stopPropagation()}>
                  <div style={{color:'#ff3b3b',fontWeight:700,fontSize:'1.18rem',marginBottom:10}}>
                    ¿Seguro que deseas eliminar esta publicación?
                  </div>
                  <div style={{color:'#fff',fontSize:'1.05rem',marginBottom:22}}>
                    Esta acción no se puede deshacer.
                  </div>
                  <div style={{display:'flex',gap:18,justifyContent:'center'}}>
                    <button
                      style={{background:'#8b1e1e',color:'#fff',fontWeight:600,fontSize:'1.08rem',border:'none',borderRadius:8,padding:'0.9rem 2.2rem',cursor:'pointer'}}
                      onClick={()=>setShowConfirm(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      style={{background:'#0d1b36',color:'#fff',fontWeight:600,fontSize:'1.08rem',border:'none',borderRadius:8,padding:'0.9rem 2.2rem',cursor:'pointer'}}
                      onClick={handleDelete}
                      disabled={eliminando}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDetallePublicacion;
