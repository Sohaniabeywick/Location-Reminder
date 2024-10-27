from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel, condecimal
from typing import List, Tuple
from typing import Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import requests
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

# Function to train KNN model
def train_knn_model(db: Session):
    places = db.query(models.Place).all()
    
    # Prepare features (latitude, longitude) and labels (placename)
    X = [[place.latitude, place.longitude] for place in places]
    y = [place.placename for place in places]

    # Feature Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train KNN Model
    knn_model = KNeighborsClassifier(n_neighbors=5)
    knn_model.fit(X_scaled, y)
    
    print("KNN Model trained successfully!")

    return knn_model, scaler


app = FastAPI()

# Train the KNN model during application startup
knn_model, scaler = train_knn_model(SessionLocal())

models.Base.metadata.create_all(bind=engine)

class PlaceBase(BaseModel):
    placename:str
    category:str
    latitude: condecimal(ge=-90, le=90, decimal_places=6)
    longitude: condecimal(ge=-180, le=180, decimal_places=6)
    
class PlaceResponse(BaseModel):
    placename: str
    category:str
    latitude: float
    longitude: float
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
      
db_dependency = Annotated[Session, Depends(get_db)]

#Endpoint to predict the nearest place
@app.post("/predict_place/")
async def predict_place(current_location: PlaceBase, db: db_dependency):
    current_location_scaled = scaler.transform([[current_location.latitude, current_location.longitude]])
    predicted_place = knn_model.predict(current_location_scaled)
    print(predicted_place)
    place_details = db.query(models.Place).filter_by(placename=predicted_place[0]).first()
    
    if place_details:
        return PlaceResponse(**place_details.__dict__)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place details not found.")
    

def save_place_to_database(db: Session, place_info: dict):
    db_place = models.Place(**place_info)
    db.add(db_place)
    db.commit()
    db.refresh(db_place)

@app.get("/hopePlaces/")
async def get_near_places(keyword: str, latitude: float, longitude: float, db: db_dependency):
    api_key = "AIzaSyBz9TaPw92znCNWtpHHWX_4ojDaeZ4Cw_E"
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=+{keyword}+near+{latitude},{longitude}&key={api_key}&region=lk"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        places_info = []
        for place in data.get("results", []):
            
            place_info = {
                "placename": place.get("name", ""),
                "category" : keyword,
                "latitude": place.get("geometry", {}).get("location", {}).get("lat", 0),
                "longitude": place.get("geometry", {}).get("location", {}).get("lng", 0),
            }
            places_info.append(place_info)
            print(f"Place: {place_info['placename']}, Latitude: {place_info['latitude']}, Longitude: {place_info['longitude']}")
            
            save_place_to_database(db, place_info)
        return {"message": "Places information saved to the database."}

    except requests.RequestException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
            

@app.post("/place/", status_code=status.HTTP_201_CREATED)
async def create_place(place:PlaceBase, db: db_dependency):
    db_place = models.Place(**place.dict())
    db.add(db_place)
    db.commit()
    return {db_place.placename,"Successfully Save..!"}
    

@app.get("/")
def read_root():
    return {"An Open End-point of the Location-Reminder Application..!!"}

@app.get("/open")
def read_root():
    print("Manuka")
    return {"Hello": "Manuka"}

