from sqlalchemy.orm import Session
from app.database import models, database
from app.core import security
import numpy as np

def seed_data():
    db = database.SessionLocal()
    
    # Check if we already have data
    if db.query(models.Laptop).count() > 0:
        print("Database already has data. Skipping seed.")
        db.close()
        return

    # Create Admin User
    admin_user = models.User(
        email="admin@example.com",
        hashed_password=security.get_password_hash("admin123"),
        role=models.UserRole.ADMIN
    )
    db.add(admin_user)

    # Create Regular User
    regular_user = models.User(
        email="user@example.com",
        hashed_password=security.get_password_hash("user123"),
        role=models.UserRole.USER
    )
    db.add(regular_user)

    # Laptop Data from original main.py
    # Names
    LAPTOPS = [
        "Acer Nitro 5 AN515-57-505V",
        "Lenovo ThinkPad L13 Gen 2",
        "Dell Latitude 7530",
        "MSI Bravo 15 B5DD-007XES",
        "Asus ROG Zephyrus G14 GA401II-HE004T",
        "HP 17-CN0018NS",
        "Apple Macbook Air Apple M2",
        "Gigabyte AERO 15 OLED KC-8ES5130VP",
        "Laptop MSI Modern 14 F13MG 466VN",
        "Laptop gaming Acer Predator Helios 18 PH18 73 98AQ"
    ]

    # Matrix: [Performance, Resolution, Capacity, Portability, Battery, Price]
    X = np.array([
        [7,5,6,3,4,7], # Acer Nitro
        [5,5,5,7,7,5], # Lenovo
        [6,5,6,6,7,4], # Dell
        [7,5,6,3,4,7], # MSI Bravo
        [9,7,7,7,6,3], # Asus ROG
        [3,5,4,2,5,8], # HP
        [8,7,6,9,9,4], # Apple
        [8,9,8,4,5,2], # Gigabyte
        [5,5,5,8,7,6], # MSI Modern
        [9,7,9,1,3,1]  # Acer Predator
    ], dtype=float)

    for i in range(len(LAPTOPS)):
        laptop = models.Laptop(
            name=LAPTOPS[i],
            performance=float(X[i][0]),
            resolution=float(X[i][1]),
            capacity=float(X[i][2]),
            portability=float(X[i][3]),
            battery=float(X[i][4]),
            price=float(X[i][5])
        )
        db.add(laptop)

    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=database.engine)
    seed_data()
