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
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [tab, setTab] = useState("disponibles");
  const [userId, setUserId] = useState(null);

  const handleSidebarNav = (route) => {
    navigate(route);
  };

  // Obtener el usuario actual para "Mis publicaciones"
  useEffect(() => {
    donatonService.getCurrentUser?.().then(res => {
      setUserId(res?.data?.id);
    }).catch(() => {});
  }, []);

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

  useEffect(() => {
    console.log("sidebarOpen es:", sidebarOpen);
  }, [sidebarOpen]);

  // Filtros y búsqueda
  const prendasFiltradas = prendas.filter(prenda => {
    if (tab === "mis") {
      if (!userId || prenda.usuario_id !== userId) return false;
    }
    if (search && !prenda.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && filterValue) {
      if (filter === "talla" && prenda.talla !== filterValue) return false;
      if (filter === "sexo" && prenda.sexo !== filterValue) return false;
      if (filter === "uso" && prenda.uso !== filterValue) return false;
    }
    return true;
  });

  return (
    <div className={`feed-root`}>
      <main className="feed-main">
        {/* BOTONES DE NAVEGACIÓN SIMPLES */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', marginTop: '1rem' }}>
          <button className={`feed-navbar-btn${window.location.pathname === '/feed' || window.location.pathname === '/' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleSidebarNav('/feed')}>
            <span className="feed-navbar-icon">🧺</span>
            <span className="feed-navbar-label">Prendas</span>
          </button>
          <button className={`feed-navbar-btn${window.location.pathname === '/donar' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleSidebarNav('/donar')}>
            <span className="feed-navbar-icon">🤲</span>
            <span className="feed-navbar-label">Donar</span>
          </button>
          <button className={`feed-navbar-btn${window.location.pathname === '/perfil' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleSidebarNav('/perfil')}>
            <span className="feed-navbar-icon">👤</span>
            <span className="feed-navbar-label">Perfil</span>
          </button>
          <button className={`feed-navbar-btn${window.location.pathname === '/ajustes' ? ' feed-navbar-btn-active' : ''}`} onClick={() => handleSidebarNav('/ajustes')}>
            <span className="feed-navbar-icon">⚙️</span>
            <span className="feed-navbar-label">Configuración</span>
          </button>
        </div>
        {/* CONTENIDO PRINCIPAL */}
        <header className="feed-header">
          <input className="feed-search" placeholder="¿Qué estás buscando?" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="feed-filter" value={filter} onChange={e => { setFilter(e.target.value); setFilterValue(""); }}>
            <option value="">Filtrar por...</option>
            <option value="talla">Talla</option>
            <option value="sexo">Sexo</option>
            <option value="uso">Uso</option>
          </select>
          {filter === "talla" && (
            <select className="feed-filter" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
              <option value="">Todas las tallas</option>
              <option value="38">38</option>
              <option value="40">40</option>
              <option value="42">42</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          )}
          {filter === "sexo" && (
            <select className="feed-filter" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
              <option value="">Ambos</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          )}
          {filter === "uso" && (
            <select className="feed-filter" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
              <option value="">Todos</option>
              <option value="0d">Nuevo</option>
              <option value="20d">Poco uso</option>
              <option value="30d">Usado</option>
              <option value="60d">Muy usado</option>
            </select>
          )}
          <div className="feed-user-actions">
            <span className="feed-bell"><i className="fa fa-bell"></i></span>
            <span className="feed-avatar"><img src="/logo-pequeno.svg" alt="avatar" /></span>
          </div>
        </header>
        <div className="feed-publicaciones-row" style={{ justifyContent: 'flex-start', gap: '2.5rem' }}>
          <span className="feed-publicaciones-title" style={{ marginRight: '2.5rem' }}>Prendas disponibles</span>
          <div className="feed-publicaciones-tabs">
            <span className={`feed-tab${tab === 'disponibles' ? ' feed-tab-active' : ''}`} onClick={() => setTab('disponibles')}>Disponibles</span>
            <span className={`feed-tab${tab === 'mis' ? ' feed-tab-active' : ''}`} onClick={() => setTab('mis')}>Mis publicaciones</span>
          </div>
        </div>
        <section className="feed-grid">
          {prendasFiltradas.length > 0 ? (
            prendasFiltradas.map((prenda, idx) => (
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
                  <button className="feed-card-btn" onClick={() => navigate(`/prenda/${prenda.id}`)}>Detalles de la prenda</button>
                </div>
              </div>
            ))
          ) : (
            !loading && <div className="feed-empty">No hay prendas disponibles.</div>
          )}
        </section>
        <div ref={loader} style={{ height: 40 }}></div>
        {loading && <div className="feed-loading">Cargando...</div>}
      </main>
    </div>
  );
}

export default FeedPrendas;
