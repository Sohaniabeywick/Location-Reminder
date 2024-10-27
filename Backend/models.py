from sqlalchemy import Boolean, Column, Integer, String, DECIMAL
from database import Base

class Place(Base):
    __tablename__ = 'places'
    
    id = Column(Integer, primary_key=True, index=True)
    placename = Column(String(50))
    category = Column(String(45))
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    
    