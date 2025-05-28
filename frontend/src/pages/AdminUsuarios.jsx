import React, { useEffect, useState } from "react";
import "./AdminUsuarios.css";
import api from '../services/api';

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get('/api/usuarios/')
      .then(res => setUsuarios(res.data))
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  }, []);

  const toggleActivo = async (id, activo) => {
    try {
      await api.patch(`/api/usuarios/${id}/`, { is_active: !activo });
      setUsuarios(usuarios => usuarios.map(u => u.id === id ? { ...u, is_active: !activo } : u));
    } catch {
      alert("No se pudo cambiar el estado del usuario.");
    }
  };

  return (
    <div className="admin-usuarios-container">
      <h2 className="admin-usuarios-title">Usuarios activos</h2>
      {loading ? <div style={{color:'#fff'}}>Cargando...</div> : error ? <div style={{color:'#ff6b6b'}}>{error}</div> : (
      <table className="admin-usuarios-table">
        <thead>
          <tr>
            <th><input type="checkbox" disabled /></th>
            <th>Lista de usuarios</th>
            <th>Última vez activo</th>
            <th>Estado</th>
            <th>Contactar</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td><input type="checkbox" /></td>
              <td style={{display:'flex',alignItems:'center',gap:12}}>
                <img src={u.foto || '/logo-pequeno.svg'} alt="avatar" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',background:'#23233a'}} />
                <span style={{fontWeight:600}}>{u.nombre} {u.apellido}</span>
              </td>
              <td>Hoy</td>
              <td>
                <span style={{background:u.is_active?"#21e058":"#babcc4",color:u.is_active?"#fff":"#23233a",padding:'4px 16px',borderRadius:8,fontWeight:600}}>
                  {u.is_active ? "En línea" : "Desconectado"}
                </span>
              </td>
              <td>
                <button style={{background:'none',color:'#21e058',border:'none',fontWeight:600,cursor:'pointer'}}>
                  Contactar usuario
                </button>
              </td>
              <td>
                <button onClick={()=>toggleActivo(u.id, u.is_active)} style={{background:'none',border:'none',cursor:'pointer'}} title={u.is_active?"Bloquear usuario":"Desbloquear usuario"}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#babcc4" strokeWidth="2" fill="none" />
                    <ellipse cx="12" cy="12" rx="6" ry="3" fill={u.is_active?"#21e058":"#babcc4"} />
                    <circle cx="12" cy="12" r="2" fill="#fff" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

export default UsuariosAdmin;