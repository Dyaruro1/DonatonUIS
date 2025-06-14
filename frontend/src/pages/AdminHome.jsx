import React, { useContext } from "react";
import { Card, Button, Row, Col, Typography } from "antd";
import { UserOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Ajusta la ruta si es necesario
import AdminSidebar from '../components/AdminSidebar';
import "./AdminHome.css";

const { Title } = Typography;

const AdminHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Asegúrate de tener el usuario en el contexto

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#18192b' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 70 }}>
        <div className="admin-home-container">
          <div className="admin-home-header">
            <Title level={2} className="admin-home-title" style={{ color: '#21e058', textAlign: 'center', margin: 0 }}>
              Panel de Administrador
            </Title>
          </div>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Card className="admin-card admin-card-users" hoverable>
                <div className="admin-card-icon admin-card-icon-users">
                  <UserOutlined style={{ fontSize: "60px" }} />
                </div>
                <Title level={4} className="admin-card-title">Gestión de Usuarios</Title>
                <p className="admin-card-description">Administra los usuarios registrados en la plataforma.</p>
                <Button className="admin-card-button" type="primary" onClick={() => navigate("/admin/users")}>
                  Ir a usuarios
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="admin-card admin-card-posts" hoverable>
                <div className="admin-card-icon admin-card-icon-posts">
                  <FileTextOutlined style={{ fontSize: "60px" }} />
                </div>
                <Title level={4} className="admin-card-title">Gestión de Publicaciones</Title>
                <p className="admin-card-description">Revisa y administra las publicaciones de la comunidad.</p>
                <Button className="admin-card-button" type="primary" onClick={() => navigate("/admin/posts")}>
                  Ir a publicaciones
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;