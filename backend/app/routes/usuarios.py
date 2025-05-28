from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, database
from passlib.context import CryptContext

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/registrar", response_model=schemas.UsuarioOut)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    # Validar dominio de correo
    if not (usuario.correo.endswith("@correo.uis.edu.co") or usuario.correo.endswith("@uis.edu.co")):
        raise HTTPException(status_code=400, detail="El correo debe ser institucional")
    db_usuario = db.query(models.Usuario).filter(models.Usuario.correo == usuario.correo).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    db_usuario = db.query(models.Usuario).filter(models.Usuario.nombre_usuario == usuario.nombre_usuario).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    hashed_password = get_password_hash(usuario.contrasena)
    db_usuario = models.Usuario(
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo=usuario.correo,
        contrasena=hashed_password,
        nombre_usuario=usuario.nombre_usuario,
        sexo=usuario.sexo,
        fecha_nacimiento=usuario.fecha_nacimiento,
        telefono=usuario.telefono,
        universidad=usuario.universidad,
        facultad=usuario.facultad,
        programa=usuario.programa,
        tipo_usuario=usuario.tipo_usuario,
        direccion=usuario.direccion,
        foto_url=usuario.foto_url
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.get("/me", response_model=schemas.UsuarioOut)
def get_current_user():
    # Este endpoint debe protegerse con JWT en el futuro
    raise HTTPException(status_code=501, detail="No implementado")
