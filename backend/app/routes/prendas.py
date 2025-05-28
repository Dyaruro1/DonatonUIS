from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, database
from datetime import datetime
from typing import List

router = APIRouter(prefix="/prendas", tags=["prendas"])

@router.get("/", response_model=List[schemas.PrendaOut])
def listar_prendas(skip: int = 0, limit: int = 12, db: Session = Depends(database.get_db)):
    prendas = db.query(models.Prenda).offset(skip).limit(limit).all()
    return prendas

@router.post("/", response_model=schemas.PrendaOut)
def crear_prenda(prenda: schemas.PrendaCreate, db: Session = Depends(database.get_db)):
    db_prenda = models.Prenda(**prenda.dict())
    db.add(db_prenda)
    db.commit()
    db.refresh(db_prenda)
    return db_prenda
