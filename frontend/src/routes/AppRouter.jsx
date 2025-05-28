import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DonarRopa from '../pages/DonarRopa';
import SolicitarRopa from '../pages/SolicitarRopa';
import PerfilUsuario from '../pages/PerfilUsuario';
import RegistroDatosExtra from '../pages/RegistroDatosExtra';
import RestablecerContrasena from '../pages/RestablecerContrasena';
import FeedPrendas from '../pages/FeedPrendas';
import PrendaDetalle from '../pages/PrendaDetalle';
import EditarPublicacion from '../pages/EditarPublicacion';
import Ajustes from '../pages/Ajustes';
import PrendaPublicaDetalle from '../pages/PrendaPublicaDetalle';
import AdminHome from '../pages/AdminHome';
import AdminUsuarios from '../pages/AdminUsuarios';
import AdminPost from '../pages/AdminPost';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';
  // const isAuthenticated = false; // Cambia según lógica de autenticación
  // Para pruebas académicas, permitir acceso libre a /donar
  const isAuthenticated = true;
  return (
    <>
      {/* Solo muestra el Navbar si no es Home, Login ni Register */}
      {!isHome && !isLogin && !isRegister && <Navbar />}
      <div className={!isLogin && !isRegister && !isHome ? "container" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donar" element={<DonarRopa />} />
          <Route path="/prenda-detalle" element={<PrendaDetalle />} />
          <Route path="/editar-publicacion" element={<EditarPublicacion />} />
          <Route path="/solicitar" element={isAuthenticated ? <SolicitarRopa /> : <Navigate to="/login" />} />
          <Route path="/perfil" element={isAuthenticated ? <PerfilUsuario /> : <Navigate to="/login" />} />
          <Route path="/registro-datos-extra" element={<RegistroDatosExtra />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route path="/feed" element={<FeedPrendas />} />
          <Route path="/prenda-publica" element={<PrendaPublicaDetalle />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/users" element={<AdminUsuarios />} />
          <Route path="/admin/posts" element={<AdminPost />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default AppRouter;