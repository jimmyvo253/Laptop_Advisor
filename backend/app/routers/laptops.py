from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import models, database
from app.schemas import laptop as laptop_schemas
from app.core import security

router = APIRouter(prefix="/laptops", tags=["laptops"])

@router.get("/", response_model=List[laptop_schemas.Laptop])
def read_laptops(db: Session = Depends(database.get_db)):
    laptops = db.query(models.Laptop).all()
    return laptops

@router.post("/", response_model=laptop_schemas.Laptop)
def create_laptop(
    laptop: laptop_schemas.LaptopCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_laptop = models.Laptop(**laptop.dict())
    db.add(db_laptop)
    db.commit()
    db.refresh(db_laptop)
    return db_laptop

@router.put("/{laptop_id}", response_model=laptop_schemas.Laptop)
def update_laptop(
    laptop_id: int,
    laptop_in: laptop_schemas.LaptopUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_laptop = db.query(models.Laptop).filter(models.Laptop.id == laptop_id).first()
    if not db_laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    
    update_data = laptop_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_laptop, field, value)
    
    db.add(db_laptop)
    db.commit()
    db.refresh(db_laptop)
    return db_laptop

@router.delete("/{laptop_id}")
def delete_laptop(
    laptop_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_laptop = db.query(models.Laptop).filter(models.Laptop.id == laptop_id).first()
    if not db_laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    
    db.delete(db_laptop)
    db.commit()
    return {"message": "Laptop deleted successfully"}
