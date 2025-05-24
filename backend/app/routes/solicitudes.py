from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from datetime import datetime
from typing import List

router = APIRouter(prefix="/solicitudes", tags=["solicitudes"])

@router.post("/", response_model=schemas.SolicitudOut)
def solicitar_ropa(solicitud: schemas.SolicitudCreate, db: Session = Depends(database.get_db)):
    db_solicitud = models.Solicitud(
        usuario_id=1,  # TODO: obtener usuario autenticado
        prenda_id=solicitud.prenda_id,
        fecha=solicitud.fecha,
        estado=solicitud.estado
    )
    db.add(db_solicitud)
    db.commit()
    db.refresh(db_solicitud)
    return db_solicitud

@router.get("/usuario", response_model=List[schemas.SolicitudOut])
def get_mis_solicitudes(db: Session = Depends(database.get_db)):
    # TODO: obtener usuario autenticado
    solicitudes = db.query(models.Solicitud).filter(models.Solicitud.usuario_id == 1).all()
    return solicitudes
