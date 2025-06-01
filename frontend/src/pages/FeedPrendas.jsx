import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedPrendas.css';
import { donatonService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import { useNotifications } from '../hooks/use-notifications';

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
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser?.id;
  const username = currentUser?.username;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifications = useNotifications(username, 3);

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

  useEffect(() => {
    console.log("sidebarOpen es:", sidebarOpen);
  }, [sidebarOpen]);

  // Filtros y búsqueda
  const parseUso = uso => {
    if (!uso) return 0;
    // Ejemplo: '60d', '2m', '1a'
    const match = uso.match(/(\d+)([dma])/i);
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit === 'd') return value;
    if (unit === 'm') return value * 30;
    if (unit === 'a') return value * 365;
    return value;
  };

  // Deduplicate prendas by id before filtering
  const uniquePrendas = Array.from(
    new Map(prendas.map(p => [p.id, p])).values()
  );

  const prendasFiltradas = uniquePrendas.filter(prenda => {
    // Ajusta para usar userId del contexto
    if (tab === "mis") {
      if (!userId || prenda.donante?.id !== userId) return false;
    } else if (tab === "disponibles") {
      if (userId && prenda.donante?.id === userId) return false;
    }
    if (search && !prenda.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && filterValue) {
      if (filter === "talla" && prenda.talla !== filterValue) return false;
      if (filter === "sexo" && prenda.sexo !== filterValue) return false;
      if (filter === "status" && prenda.status !== filterValue) return false;
    }
    return true;
  });

  const handleDetallePrenda = async (prenda) => {
    // Si el usuario está autenticado y no es el donante, incrementar visitas
    if (currentUser && prenda.donante && prenda.donante.id !== currentUser.id) {
      try {
        await donatonService.incrementarVisitas(prenda.id);
      } catch (e) {
        // No hacer nada si falla
      }
    }
    navigate('/prenda-publica', { state: { prenda } });
  };

  // Maneja click en una notificación
  const handleNotificationClick = notif => {
    // Aquí podrías navegar al chat o prenda relacionada
    if (notif.prenda_id) {
      // Busca la prenda en el estado o haz fetch si es necesario
      const prenda = prendas.find(p => p.id === notif.prenda_id);
      if (prenda) {
        navigate('/prenda-publica', { state: { prenda } });
      }
    }
    // Opcional: marcar como leída en Supabase
    // ...
  };

  return (
    <div className={`feed-root`}>
      {/* MODAL DE CONFIRMACIÓN LOGOUT */}
      {showLogoutModal && (
        <>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(24,25,43,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 200,
          }}></div>
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 201,
          }}>
            <div style={{
              background: '#23233a',
              borderRadius: 18,
              boxShadow: '0 2px 32px 0 #0004',
              padding: '2.2rem 2.5rem 2rem 2.5rem',
              minWidth: 340,
              maxWidth: 400,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ff3b3b', fontWeight: 700, fontSize: '1.18rem', marginBottom: 10 }}>
                ¿Seguro que deseas cerrar sesión?
              </div>
              <div style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 22 }}>
                Se cerrará tu sesión y perderás el acceso temporal a tu cuenta. Puedes volver a iniciar sesión cuando lo necesites.
              </div>
              <div style={{ display: 'flex', gap: 18, width: '100%', justifyContent: 'center' }}>
                <button
                  style={{ flex: 1, background: '#8b1e1e', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  Sí
                </button>
                <button
                  style={{ flex: 1, background: '#0d1b36', color: '#fff', fontWeight: 600, fontSize: '1.08rem', border: 'none', borderRadius: 8, padding: '0.9rem 0', cursor: 'pointer', transition: 'background 0.18s' }}
                  onClick={() => setShowLogoutModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
          <button
            className="feed-navbar-btn feed-navbar-btn-logout"
            style={{
              background: 'transparent',
              color: '#ff6b6b',
              border: 'none',
              borderRadius: '50%',
              padding: '0.7rem', // Aumenta el padding
              fontWeight: 600,
              fontSize: '1.55rem', // Aumenta el tamaño de fuente
              marginLeft: '2.5rem',
              marginRight: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.18s, color 0.18s',
              width: 48, // Aumenta el ancho
              height: 48, // Aumenta el alto
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#ff6b6b22'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff6b6b'; }}
            onClick={() => setShowLogoutModal(true)}
            type="button"
            title="Cerrar sesión"
          >
            <i className="fa fa-sign-out-alt" style={{ fontSize: 28 }}></i>
          </button>
        </div>
        {/* CONTENIDO PRINCIPAL */}
        <header className="feed-header">
          <input className="feed-search" placeholder="¿Qué estás buscando?" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="feed-filter" value={filter} onChange={e => { setFilter(e.target.value); setFilterValue(""); }}>
            <option value="">Filtrar por...</option>
            <option value="talla">Talla</option>
            <option value="sexo">Sexo</option>
            <option value="status">Disponibilidad</option>
          </select>
          {filter === "talla" && (
            <select className="feed-filter" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
              <option value="">Todas las tallas</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="Única">Única</option>
              <option value="Infantil">Infantil</option>
            </select>
          )}
          {filter === "sexo" && (
            <select className="feed-filter" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
              <option value="">Todos</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          )}
          {filter === "status" && (
            <select className="feed-filter" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
              <option value="">Todas</option>
              <option value="disponible">Disponible</option>
              <option value="en_solicitud">En solicitud</option>
            </select>
          )}
          <div className="feed-user-actions">
            <NotificationBell notifications={notifications} onNotificationClick={handleNotificationClick} />
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
                  <img
                    src={
                      prenda.foto1_url || prenda.foto1 || '/fondo-uis.jpg'
                    }
                    alt={prenda.nombre}
                  />
                </div>
                <div className="feed-card-body">
                  <div className="feed-card-title">{prenda.nombre}</div>
                  <div className="feed-card-info">
                    <div>Talla <span>{prenda.talla}</span></div>
                    <div>Sexo <span>{prenda.sexo}</span></div>
                    <div>Uso <span>{prenda.uso}</span></div>
                  </div>
                  {/* Estado de la prenda */}
                  <div style={{ color: '#babcc4', fontWeight: 600, fontSize: '1.08rem', margin: '4px 0 0 0' }}>
                    Estado <span style={{ color: prenda.status === 'disponible' ? '#21E058' : '#ffb300', fontWeight: 700, marginLeft: 8 }}>
                      {prenda.status === 'disponible' ? 'Disponible' : prenda.status === 'en_solicitud' ? 'En solicitud' : prenda.status}
                    </span>
                  </div>
                  {tab === 'mis' ? (
                    <>
                      <button className="feed-card-btn" onClick={() => navigate('/editar-publicacion', { state: { prenda } })}>Editar prenda</button>
                      <button className="feed-card-btn" style={{ marginTop: 8, background: '#21e058', color: '#18192b' }} onClick={() => { console.log('DEBUG ChatDonante navigate prenda:', prenda); navigate('/chat-donante', { state: { prenda } }); }}>Ver chat</button>
                    </>
                  ) : (
                    <button className="feed-card-btn" onClick={() => handleDetallePrenda(prenda)}>Detalles de la prenda</button>
                  )}
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
