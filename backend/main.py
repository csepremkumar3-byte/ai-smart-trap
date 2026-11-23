import os
import sqlite3
import datetime
import shutil
import base64
import json
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "traps.db")
LOG_PATH = os.path.join(DATA_DIR, "incoming_raw.log")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

app = FastAPI(
    title="AI Smart Trap Ingestion API",
    description="Receives real-time camera captures and weather telemetry from AI Smart Traps",
    version="1.1.0"
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

def log_raw_request(source: str, query: str, headers: dict, body_preview: str):
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            t = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{t}] [{source}] Query: {query} | Headers: {json.dumps(headers)} | Body: {body_preview}\n")
    except Exception:
        pass

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AI Smart Trap Ingestion API",
        "endpoints": ["/api/upload", "/CICRAIIO.aspx", "/api/traps"],
        "time": datetime.datetime.now().isoformat()
    }

@app.api_route("/Mycamera.aspx", methods=["GET", "POST"])
@app.api_route("/CICRAIIO.aspx", methods=["GET", "POST"])
@app.api_route("/api/upload", methods=["GET", "POST"])
async def universal_trap_upload(request: Request):
    """
    Universal ingestion endpoint supporting:
    1. /CICRAIIO.aspx (Native ESP8266 weather telemetry: ?C&=ID&C1=TEMP&C2=HUM&C3=PRESS&C4=NOISE)
    2. /Mycamera.aspx (Native Raspberry Pi camera upload from imiot.py: multipart 'image')
    3. /api/upload (Modern REST API)
    """
    now = datetime.datetime.now()
    timestamp_str = now.strftime("%d-%m-%Y %H:%M:%S")
    file_timestamp = now.strftime("%Y%m%d_%H%M%S")

    # Extract all possible query parameters (including Indianmark native C, C1, C2, C3, C4)
    qp = dict(request.query_params)
    raw_query = str(request.url.query)

    trap_id = (
        qp.get("C")
        or qp.get("C&")
        or qp.get("")
        or qp.get("sn")
        or qp.get("trap_id")
        or qp.get("id")
        or qp.get("device_sn")
    )

    # Parse Indianmark ?C&=DEVICEID syntax directly from raw query
    if "C&=" in raw_query:
        try:
            val_after_c = raw_query.split("C&=", 1)[1].split("&", 1)[0]
            if val_after_c:
                trap_id = val_after_c
        except Exception:
            pass

    device_sn = qp.get("device_sn") or trap_id
    temp = qp.get("C1") or qp.get("temp") or qp.get("temperature") or qp.get("t")
    humidity = qp.get("C2") or qp.get("humidity") or qp.get("hum") or qp.get("h")
    pressure = qp.get("C3") or qp.get("pressure") or qp.get("press") or qp.get("p")
    battery = qp.get("C4") or qp.get("battery") or qp.get("bat") or qp.get("b")
    moths = qp.get("moths") or qp.get("count") or 0

    image_rel_url = None
    content_type = request.headers.get("content-type", "")

    # Parse Body
    if "application/json" in content_type:
        try:
            body = await request.json()
            trap_id = body.get("trap_id") or body.get("sn") or body.get("id") or trap_id or "DEMO-TRAP-01"
            device_sn = body.get("device_sn") or body.get("sn") or device_sn or trap_id or "IMAI036DEMO001"
            temp = body.get("temp") or body.get("temperature") or temp
            humidity = body.get("humidity") or body.get("hum") or humidity
            pressure = body.get("pressure") or body.get("press") or pressure
            battery = body.get("battery") or body.get("bat") or battery
            moths = body.get("moths") or body.get("count") or moths

            base64_img = body.get("image") or body.get("photo") or body.get("file") or body.get("img")
            if base64_img and isinstance(base64_img, str):
                if "," in base64_img:
                    base64_img = base64_img.split(",", 1)[1]
                filename = f"trap_{trap_id}_{file_timestamp}.jpg"
                filepath = os.path.join(UPLOADS_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(base64_img))
                image_rel_url = f"/uploads/{filename}"
            log_raw_request("JSON", str(qp), dict(request.headers), str(body)[:200])
        except Exception as e:
            pass
    elif "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        try:
            form = await request.form()
            trap_id = form.get("trap_id") or form.get("sn") or form.get("device_sn") or form.get("id") or trap_id or "DEMO-TRAP-01"
            device_sn = form.get("device_sn") or form.get("sn") or device_sn or trap_id or "IMAI036DEMO001"
            temp = form.get("temp") or form.get("temperature") or form.get("t") or temp
            humidity = form.get("humidity") or form.get("hum") or form.get("h") or humidity
            pressure = form.get("pressure") or form.get("press") or form.get("p") or pressure
            battery = form.get("battery") or form.get("bat") or form.get("b") or battery
            moths = form.get("moths") or form.get("count") or moths

            # Check for uploaded file
            for field_name in ["file", "image", "photo", "pic", "img", "upload"]:
                val = form.get(field_name)
                if val and hasattr(val, "filename") and val.filename:
                    orig_base = os.path.splitext(val.filename)[0]
                    if orig_base and ("CICR" in orig_base or "IM" in orig_base or "TRAP" in orig_base):
                        trap_id = orig_base
                        device_sn = orig_base
                    clean_filename = f"trap_{trap_id}_{file_timestamp}.jpg"
                    filepath = os.path.join(UPLOADS_DIR, clean_filename)
                    with open(filepath, "wb") as buffer:
                        shutil.copyfileobj(val.file, buffer)
                    image_rel_url = f"/uploads/{clean_filename}"
                    break
            log_raw_request("FORM", str(qp), dict(request.headers), str(form.keys())[:200])
        except Exception as e:
            pass
    else:
        # Check raw body (some cameras post raw JPEG directly in body)
        raw_bytes = await request.body()
        if raw_bytes and len(raw_bytes) > 100:
            if raw_bytes[:3] == b'\xff\xd8\xff' or raw_bytes[:4] == b'\x89PNG':
                trap_id = trap_id or "DEMO-TRAP-01"
                clean_filename = f"trap_{trap_id}_{file_timestamp}.jpg"
                filepath = os.path.join(UPLOADS_DIR, clean_filename)
                with open(filepath, "wb") as f:
                    f.write(raw_bytes)
                image_rel_url = f"/uploads/{clean_filename}"
            log_raw_request("RAW_BYTES", str(qp), dict(request.headers), f"Length: {len(raw_bytes)}")

    # Fallbacks and type conversions
    trap_id = str(trap_id or "DEMO-TRAP-01")
    device_sn = str(device_sn or trap_id)

    try:
        temp_val = float(temp) if temp is not None else 28.5
    except (ValueError, TypeError):
        temp_val = 28.5

    try:
        humidity_val = float(humidity) if humidity is not None else 65.0
    except (ValueError, TypeError):
        humidity_val = 65.0

    try:
        pressure_val = float(pressure) if pressure is not None else 1012.0
    except (ValueError, TypeError):
        pressure_val = 1012.0

    try:
        battery_val = float(battery) if battery is not None else 95.0
    except (ValueError, TypeError):
        battery_val = 95.0

    try:
        moths_val = int(moths) if moths is not None else 0
    except (ValueError, TypeError):
        moths_val = 0

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
                issue='None',
                last_sync=excluded.last_sync,
                image_url=CASE WHEN excluded.image_url LIKE '/uploads/%' THEN excluded.image_url ELSE COALESCE(traps.image_url, excluded.image_url) END,
                moths=excluded.moths,
                status='Active'
        ''', (
            trap_id,
            device_sn,
            f"Field Trap - {trap_id}",
            "Hisar",
            "Haryana",
            temp_val,
            humidity_val,
            pressure_val,
            battery_val,
            "None",
            timestamp_str,
            image_rel_url,
            moths_val,
            "Active"
        ))

        cursor.execute('''
            INSERT INTO readings_history (trap_id, temp, humidity, pressure, battery, image_url, timestamp, moths)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (trap_id, temp_val, humidity_val, pressure_val, battery_val, image_rel_url, timestamp_str, moths_val))
        conn.commit()

    # Returns response containing OK, SUCCESS, and 1 to satisfy any firmware check
    return Response(
        content='{"status":"OK","code":1,"response":"SUCCESS","trap_id":"' + trap_id + '"}',
        media_type="application/json",
        status_code=200
    )

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

@app.get("/api/logs")
def view_incoming_logs():
    """
    Diagnostic endpoint to view raw incoming requests from physical traps.
    """
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()[-50:]
        return {"recent_logs": lines}
    return {"recent_logs": []}
