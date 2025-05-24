from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from datetime import datetime
from typing import List

router = APIRouter(prefix="/donaciones", tags=["donaciones"])

@router.post("/", response_model=schemas.DonacionOut)
def donar_ropa(donacion: schemas.DonacionCreate, db: Session = Depends(database.get_db)):
    db_donacion = models.Donacion(
        usuario_id=1,  # TODO: obtener usuario autenticado
        prenda_id=donacion.prenda_id,
        fecha=donacion.fecha
    )
    db.add(db_donacion)
    db.commit()
    db.refresh(db_donacion)
    return db_donacion

@router.get("/usuario", response_model=List[schemas.DonacionOut])
def get_mis_donaciones(db: Session = Depends(database.get_db)):
    # TODO: obtener usuario autenticado
    donaciones = db.query(models.Donacion).filter(models.Donacion.usuario_id == 1).all()
    return donaciones
