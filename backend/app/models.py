from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class SexoEnum(str, enum.Enum):
    masculino = "masculino"
    femenino = "femenino"
    otro = "otro"

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String, nullable=False)
    nombre_usuario = Column(String, unique=True, index=True, nullable=False)
    sexo = Column(Enum(SexoEnum), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    telefono = Column(String, nullable=True)
    universidad = Column(String, nullable=True)
    facultad = Column(String, nullable=True)
    programa = Column(String, nullable=True)
    tipo_usuario = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    foto_url = Column(String, nullable=True)
    donaciones = relationship("Donacion", back_populates="usuario")
    solicitudes = relationship("Solicitud", back_populates="usuario")

class Prenda(Base):
    __tablename__ = "prendas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    talla = Column(String, nullable=False)
    sexo = Column(Enum(SexoEnum), nullable=False)
    uso = Column(String, nullable=True)
    imagen_url = Column(String, nullable=True)
    donaciones = relationship("Donacion", back_populates="prenda")

class Donacion(Base):
    __tablename__ = "donaciones"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    prenda_id = Column(Integer, ForeignKey("prendas.id"))
    fecha = Column(DateTime, nullable=False)
    usuario = relationship("Usuario", back_populates="donaciones")
    prenda = relationship("Prenda", back_populates="donaciones")

class Solicitud(Base):
    __tablename__ = "solicitudes"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    prenda_id = Column(Integer, ForeignKey("prendas.id"))
    fecha = Column(DateTime, nullable=False)
    estado = Column(String, default="pendiente")
    usuario = relationship("Usuario", back_populates="solicitudes")
    prenda = relationship("Prenda")
