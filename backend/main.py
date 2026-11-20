import os
import sqlite3
import datetime
import shutil
import base64
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "traps.db")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

app = FastAPI(
    title="AI Smart Trap Ingestion API",
    description="Receives real-time camera captures and weather telemetry from AI Smart Traps",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve images statically
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS traps (
                id TEXT PRIMARY KEY,
                device_sn TEXT,
                full_name TEXT,
                district TEXT,
                state TEXT,
                temp REAL,
                humidity REAL,
                pressure REAL,
                battery REAL,
                issue TEXT DEFAULT 'None',
                last_sync TEXT,
                image_url TEXT,
                moths INTEGER DEFAULT 0,
                status TEXT DEFAULT 'Active'
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS readings_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trap_id TEXT,
                temp REAL,
                humidity REAL,
                pressure REAL,
                battery REAL,
                image_url TEXT,
                timestamp TEXT,
                moths INTEGER DEFAULT 0
            )
        ''')
        conn.commit()

init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AI Smart Trap Ingestion API",
        "time": datetime.datetime.now().isoformat()
    }

@app.post("/api/upload")
async def upload_trap_data(
    request: Request,
    trap_id: Optional[str] = Form(None),
    device_sn: Optional[str] = Form(None),
    temp: Optional[float] = Form(None),
    temperature: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None),
    pressure: Optional[float] = Form(None),
    battery: Optional[float] = Form(None),
    issue: Optional[str] = Form("None"),
    moths: Optional[int] = Form(0),
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Flexible endpoint that accepts both multipart/form-data and JSON bodies
    to support diverse ESP32 / 4G Dongle firmware implementations.
    """
    now = datetime.datetime.now()
    timestamp_str = now.strftime("%d-%m-%Y %H:%M:%S")
    file_timestamp = now.strftime("%Y%m%d_%H%M%S")

    # Check if incoming request is JSON
    content_type = request.headers.get("content-type", "")
    image_rel_url = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            trap_id = body.get("trap_id") or body.get("trapId") or trap_id or "DEMO-TRAP-01"
            device_sn = body.get("device_sn") or body.get("deviceSn") or device_sn or "IMAI036DEMO001"
            temp = body.get("temp") or body.get("temperature") or temp or 24.5
            humidity = body.get("humidity") or humidity or 65.0
            pressure = body.get("pressure") or pressure or 1013.2
            battery = body.get("battery") or battery or 95.0
            issue = body.get("issue") or issue or "None"
            moths = body.get("moths") or moths or 0

            # Base64 image support in JSON
            base64_img = body.get("image") or body.get("photo") or body.get("file")
            if base64_img and isinstance(base64_img, str):
                if "," in base64_img:
                    base64_img = base64_img.split(",", 1)[1]
                filename = f"trap_{trap_id}_{file_timestamp}.jpg"
                filepath = os.path.join(UPLOADS_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(base64_img))
                image_rel_url = f"/uploads/{filename}"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    else:
        # Form / Multipart data
        trap_id = trap_id or device_sn or "DEMO-TRAP-01"
        device_sn = device_sn or trap_id or "IMAI036DEMO001"
        final_temp = temp if temp is not None else (temperature if temperature is not None else 24.5)
        temp = final_temp
        humidity = humidity if humidity is not None else 65.0
        pressure = pressure if pressure is not None else 1013.2
        battery = battery if battery is not None else 95.0

        # Handle uploaded file
        upload_obj = file or image
        if upload_obj and upload_obj.filename:
            clean_filename = f"trap_{trap_id}_{file_timestamp}.jpg"
            filepath = os.path.join(UPLOADS_DIR, clean_filename)
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(upload_obj.file, buffer)
            image_rel_url = f"/uploads/{clean_filename}"

    # Default image fallback if no file was uploaded
    if not image_rel_url:
        image_rel_url = "/trap-inspection-images/inspection-01.jpeg"

    # Save to SQLite Database
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO traps (id, device_sn, full_name, district, state, temp, humidity, pressure, battery, issue, last_sync, image_url, moths, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                temp=excluded.temp,
                humidity=excluded.humidity,
                pressure=excluded.pressure,
                battery=excluded.battery,
                issue=excluded.issue,
                last_sync=excluded.last_sync,
                image_url=excluded.image_url,
                moths=excluded.moths,
                status='Active'
        ''', (
            trap_id,
            device_sn,
            f"Field Trap - {trap_id}",
            "Hisar",
            "Haryana",
            temp,
            humidity,
            pressure,
            battery,
            issue,
            timestamp_str,
            image_rel_url,
            moths,
            "Active"
        ))

        cursor.execute('''
            INSERT INTO readings_history (trap_id, temp, humidity, pressure, battery, image_url, timestamp, moths)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (trap_id, temp, humidity, pressure, battery, image_rel_url, timestamp_str, moths))
        conn.commit()

    return {
        "status": "success",
        "message": "Data & image successfully recorded",
        "trap_id": trap_id,
        "temperature": temp,
        "humidity": humidity,
        "pressure": pressure,
        "battery": battery,
        "image_url": image_rel_url,
        "last_sync": timestamp_str
    }

@app.get("/api/traps")
def list_traps():
    """
    Returns all live traps recorded in the database.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM traps ORDER BY last_sync DESC")
        rows = cursor.fetchall()
        traps = [dict(row) for row in rows]
        return {"count": len(traps), "traps": traps}

@app.get("/api/traps/{trap_id}")
def get_trap_detail(trap_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM traps WHERE id = ?", (trap_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Trap not found")
        
        cursor.execute("SELECT * FROM readings_history WHERE trap_id = ? ORDER BY id DESC LIMIT 24", (trap_id,))
        history = [dict(h) for h in cursor.fetchall()]
        
        data = dict(row)
        data["history"] = history
        return data
