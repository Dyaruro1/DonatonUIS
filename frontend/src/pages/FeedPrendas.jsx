import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedPrendas.css';
import { donatonService } from '../services/api';

function FeedPrendas() {
  const [prendas, setPrendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 12;
  const loader = useRef(null);
  const navigate = useNavigate();
  const handleSidebarNav = (route) => {
    navigate(route);
  };

  // Scroll infinito
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const resp = await donatonService.getPrendasDisponibles(skip, limit);
      if (resp.data.length < limit) setHasMore(false);
      setPrendas(prev => [...prev, ...resp.data]);
      setSkip(prev => prev + limit);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [skip, loading, hasMore]);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  // Observer para scroll infinito
  useEffect(() => {
    if (!loader.current) return;
    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, { threshold: 1 });
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loader, loadMore, hasMore, loading]);

  return (
    <div className="feed-root">
      <aside className="feed-sidebar">
        <div className="sidebar-logo"><img src="/logo-pequeno.svg" alt="logo" /></div>
        <nav className="sidebar-nav">
          <button className="sidebar-btn active" title="Inicio" onClick={() => handleSidebarNav('/feed')}>
            <i className="fa-solid fa-house"></i>
          </button>
          <button className="sidebar-btn" title="Donaciones" onClick={() => handleSidebarNav('/donar')}>
            <i className="fa-solid fa-hand-holding-heart"></i>
          </button>
          <button className="sidebar-btn" title="Favoritos" onClick={() => handleSidebarNav('/favoritos')}>
            <i className="fa-solid fa-heart"></i>
          </button>
          <button className="sidebar-btn" title="Estadísticas" onClick={() => handleSidebarNav('/estadisticas')}>
            <i className="fa-solid fa-chart-column"></i>
          </button>
          <button className="sidebar-btn" title="Perfil" onClick={() => handleSidebarNav('/perfil')}>
            <i className="fa-solid fa-user"></i>
          </button>
          <button className="sidebar-btn" title="Ajustes" onClick={() => handleSidebarNav('/ajustes')}>
            <i className="fa-solid fa-gear"></i>
          </button>
        </nav>
      </aside>
      <main className="feed-main">
        <header className="feed-header">
          <input className="feed-search" placeholder="¿Qué estás buscando?" />
          <select className="feed-filter">
            <option>Filtrar por...</option>
            <option value="talla">Talla</option>
            <option value="sexo">Sexo</option>
            <option value="uso">Uso</option>
          </select>
          <div className="feed-user-actions">
            <span className="feed-bell"><i className="fa fa-bell"></i></span>
            <span className="feed-avatar"><img src="/logo-pequeno.svg" alt="avatar" /></span>
          </div>
        </header>
        <div className="feed-publicaciones-row">
          <span className="feed-publicaciones-title">Publicaciones recientes</span>
          <div className="feed-publicaciones-tabs">
            <span className="feed-tab feed-tab-active">General</span>
            <span className="feed-tab">Mis publicaciones</span>
          </div>
        </div>
        <section className="feed-grid">
          {prendas.map((prenda, idx) => (
            <div className="feed-card" key={prenda.id || idx}>
              <div className="feed-card-img">
                <img src={prenda.imagen_url || '/fondo-uis.jpg'} alt={prenda.nombre} />
              </div>
              <div className="feed-card-body">
                <div className="feed-card-title">{prenda.nombre}</div>
                <div className="feed-card-info">
                  <div>Talla <span>{prenda.talla}</span></div>
                  <div>Sexo <span>{prenda.sexo}</span></div>
                  <div>Uso <span>{prenda.uso}</span></div>
                </div>
                <button className="feed-card-btn">Detalles de la prenda</button>
              </div>
            </div>
          ))}
        </section>
        <div ref={loader} style={{ height: 40 }}></div>
        {loading && <div className="feed-loading">Cargando...</div>}
        {!hasMore && prendas.length === 0 && <div className="feed-empty">No hay prendas disponibles.</div>}
      </main>
    </div>
  );
}

export default FeedPrendas;
