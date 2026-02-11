from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    with open("patients.json", "r") as f:
        data = json.load(f)
    return data


# path
@app.get("/")
def hello():
    return {"message": "Patient management system"}


@app.get("/about")
def about():
    return {"message": "A fully functional api to manage patient records"}


# define the end point
@app.get("/view")
def view():
    data = load_data()
    return data


@app.get("/patient/{patient_id}")
def get_patient(patient_id: str = Path(...,description= 'ID of the patient in the DB', example = 'P001')):
    data = load_data()
    patient = data.get(patient_id.upper())
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.get("/sort")
def sort_patients(
    sort_by: str = Query(
        ...,
        description="Sort on the basis of height, weight, or bmi. Valid fields: height, weight, bmi",
    ),
    order: str = Query("asc", description="Sort order: asc or desc"),
):
    allowed_fields = {"weight", "height", "bmi"}
    sort_field = sort_by.lower()
    sort_order = order.lower()

    if sort_field not in allowed_fields:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort field. Use one of: weight, height, bmi",
        )
    if sort_order not in {"asc", "desc"}:
        raise HTTPException(status_code=400, detail="Invalid order. Use asc or desc")

    data = load_data()
    patients = [{"id": patient_id, **patient} for patient_id, patient in data.items()]
    reverse = sort_order == "desc"
    sorted_patients = sorted(patients, key=lambda p: p[sort_field], reverse=reverse)
    return sorted_patients
