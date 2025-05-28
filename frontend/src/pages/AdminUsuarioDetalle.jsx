import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../services/api';
import "./AdminUsuarioDetalle.css";
import AdminSidebar from '../components/AdminSidebar';

function AdminUsuarioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    api.get(`/api/usuarios/${id}/`)
      .then(res => setUser(res.data))
      .catch(() => setError("No se pudo cargar el usuario."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{color:'#fff'}}>Cargando...</div>;
  if (error) return <div style={{color:'#ff6b6b'}}>{error}</div>;
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#18192b' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 78 }}>
        <div className="admin-user-profile-root">
          <div className="admin-user-profile-header">
            <h1>Perfil del usuario</h1>
            <div className="admin-user-profile-settings"></div>
          </div>
          <div className="admin-user-profile-main">
            <div className="admin-user-profile-photo-col">
              <img src={user.foto || '/logo-pequeno.svg'} alt="avatar" className="admin-user-profile-photo" />
              <div className="admin-user-profile-username">@{user.username}</div>
            </div>
            <div className="admin-user-profile-info">
              <div className="admin-user-profile-row">
                <div className="admin-user-profile-card">
                  <label>Nombres</label>
                  <input value={user.nombre || ''} disabled />
                  <label>Apellidos</label>
                  <input value={user.apellido || ''} disabled />
                  <label>Descripción</label>
                  <input value={user.descripcion || ''} disabled />
                </div>
                <div className="admin-user-profile-card">
                  <label>Sexo</label>
                  <input value={user.sexo || ''} disabled />
                  <label>Fecha de nacimiento</label>
                  <div className="admin-user-profile-date-row">
                    <input value={user.fecha_nacimiento ? user.fecha_nacimiento.split('-')[2] : ''} disabled />
                    <span>-</span>
                    <input value={user.fecha_nacimiento ? user.fecha_nacimiento.split('-')[1] : ''} disabled />
                    <span>-</span>
                    <input value={user.fecha_nacimiento ? user.fecha_nacimiento.split('-')[0] : ''} disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="admin-user-profile-contact-section">
            <h2>Información de contacto</h2>
            <div className="admin-user-profile-contact-row">
              <div className="admin-user-profile-contact-card">
                <label>Teléfono</label>
                <input value={user.telefono || ''} disabled />
                <label>Otra forma de contacto</label>
                <input value={user.contacto1 || ''} disabled />
              </div>
              <div className="admin-user-profile-contact-card">
                <label>Correo electrónico</label>
                <input value={user.correo || ''} disabled />
                <label>Otra forma de contacto</label>
                <input value={user.contacto2 || ''} disabled />
              </div>
            </div>
          </div>
          <div className="admin-user-profile-actions-row">
            <button className="admin-user-profile-back-btn" onClick={() => navigate('/admin/users')}>Atrás</button>
            <button className="admin-user-profile-delete-btn" onClick={()=>setShowDelete(true)}>Eliminar usuario</button>
          </div>
          {showDelete && (
            <>
              <div className="modal-blur" onClick={()=>setShowDelete(false)}></div>
              <div className="modal-confirm">
                <div className="admin-user-modal-box">
                  <div className="admin-user-modal-title">¿Seguro de eliminar a este usuario ({user.nombre} {user.apellido})?</div>
                  <div className="admin-user-modal-desc">
                    Se eliminará su cuenta y todos sus datos de forma permanente. Esta acción no se puede deshacer
                  </div>
                  {deleteError && <div style={{color:'#ff6b6b',marginBottom:8}}>{deleteError}</div>}
                  <div className="admin-user-modal-actions">
                    <button className="admin-user-modal-btn admin-user-modal-btn-red" onClick={async()=>{
                      setDeleteError("");
                      setSaving(true);
                      try {
                        await api.delete(`/api/usuarios/${id}/`);
                        setShowDelete(false);
                        navigate('/admin/users');
                      } catch {
                        setDeleteError("No se pudo eliminar el usuario.");
                      }
                      setSaving(false);
                    }}>Sí</button>
                    <button className="admin-user-modal-btn admin-user-modal-btn-blue" onClick={()=>setShowDelete(false)}>No</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsuarioDetalle;
