from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import usuarios, prendas, donaciones, solicitudes, auth

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DonatonUIS API")

# Permitir CORS para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(prendas.router)
app.include_router(donaciones.router)
app.include_router(solicitudes.router)
