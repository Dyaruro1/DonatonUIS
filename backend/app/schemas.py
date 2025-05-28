from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
import enum

class SexoEnum(str, enum.Enum):
    masculino = "masculino"
    femenino = "femenino"
    otro = "otro"

class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    correo: EmailStr
    nombre_usuario: str
    sexo: SexoEnum
    fecha_nacimiento: date
    telefono: Optional[str] = None
    universidad: Optional[str] = None
    facultad: Optional[str] = None
    programa: Optional[str] = None
    tipo_usuario: Optional[str] = None
    direccion: Optional[str] = None
    foto_url: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    contrasena: str

class UsuarioOut(UsuarioBase):
    id: int
    class Config:
        orm_mode = True

class PrendaBase(BaseModel):
    nombre: str
    talla: str
    sexo: SexoEnum
    uso: Optional[str] = None
    imagen_url: Optional[str] = None

class PrendaCreate(PrendaBase):
    pass

class PrendaOut(PrendaBase):
    id: int
    class Config:
        orm_mode = True

class DonacionBase(BaseModel):
    prenda_id: int
    fecha: datetime

class DonacionCreate(DonacionBase):
    pass

class DonacionOut(DonacionBase):
    id: int
    usuario_id: int
    class Config:
        orm_mode = True

class SolicitudBase(BaseModel):
    prenda_id: int
    fecha: datetime
    estado: Optional[str] = "pendiente"

class SolicitudCreate(SolicitudBase):
    pass

class SolicitudOut(SolicitudBase):
    id: int
    usuario_id: int
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None
