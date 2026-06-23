"""
360-degree test suite for the Healthcare Triage API.
Run the backend first (uvicorn main:app --port 8000), then: python test_app.py
"""
import sys
import time
import uuid
import httpx

BASE = "http://localhost:8000"
client = httpx.Client(base_url=BASE, timeout=120.0)

passed = 0
failed = 0


def check(name: str, condition: bool, detail: str = ""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {name}")
    else:
        failed += 1
        print(f"  [FAIL] {name}  {detail}")


# Unique email per run so register always works
EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"
PASSWORD = "SecurePass123"
token = None
session_id = None

print("\n=== 1. Health & root ===")
r = client.get("/api/health")
check("GET /api/health -> 200", r.status_code == 200, str(r.status_code))
check("health body has status=healthy", r.json().get("status") == "healthy")

r = client.get("/")
check("GET / -> 200", r.status_code == 200, str(r.status_code))

print("\n=== 2. Auth: register ===")
r = client.post("/api/auth/register", json={"name": "Test User", "email": EMAIL, "password": PASSWORD})
check("register new user -> 200", r.status_code == 200, str(r.status_code) + " " + r.text[:200])
if r.status_code == 200:
    body = r.json()
    token = body.get("token")
    check("register returns token", bool(token))
    check("register returns user.email", body.get("user", {}).get("email") == EMAIL)

r = client.post("/api/auth/register", json={"name": "Dupe", "email": EMAIL, "password": PASSWORD})
check("duplicate register -> 400", r.status_code == 400, str(r.status_code))

print("\n=== 3. Auth: login ===")
r = client.post("/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
check("login correct creds -> 200", r.status_code == 200, str(r.status_code) + " " + r.text[:200])
if r.status_code == 200:
    token = r.json().get("token")

r = client.post("/api/auth/login", json={"email": EMAIL, "password": "wrongpassword"})
check("login wrong password -> 401", r.status_code == 401, str(r.status_code))

r = client.post("/api/auth/login", json={"email": "nobody@nowhere.com", "password": "x"})
check("login nonexistent user -> 401", r.status_code == 401, str(r.status_code))

print("\n=== 4. Triage validation ===")
r = client.post("/api/triage", json={"symptoms": "short", "existing_conditions": [], "medications": []})
check("triage too-short symptoms -> 400", r.status_code == 400, str(r.status_code))

print("\n=== 5. Triage (real 4-agent run, ~15s) ===")
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}
t0 = time.time()
r = client.post(
    "/api/triage",
    json={
        "symptoms": "I have had a severe headache for 3 days, my vision is blurry and I feel nauseous",
        "age": 32,
        "gender": "female",
        "existing_conditions": ["hypertension"],
        "medications": ["amlodipine"],
    },
    headers=auth_headers,
)
elapsed = time.time() - t0
check("triage valid -> 200", r.status_code == 200, str(r.status_code) + " " + r.text[:300])
if r.status_code == 200:
    d = r.json()
    session_id = d.get("session_id")
    print(f"     (took {elapsed:.1f}s)")
    check("has session_id", bool(session_id))
    check("urgency_level present", d.get("urgency_level") in ["Emergency", "Urgent", "Semi-urgent", "Non-urgent"], str(d.get("urgency_level")))
    check("urgency_color present", d.get("urgency_color") in ["red", "orange", "yellow", "green"], str(d.get("urgency_color")))
    check("conditions is non-empty list", isinstance(d.get("conditions"), list) and len(d["conditions"]) > 0)
    check("specialist present", bool(d.get("specialist")), str(d.get("specialist")))
    check("report_markdown non-empty", bool(d.get("report_markdown")))
    check("self_care is list", isinstance(d.get("self_care"), list))
    check("red_flags is list", isinstance(d.get("red_flags"), list))
    check("emergency_advice present", bool(d.get("emergency_advice")))
    print(f"     -> urgency={d.get('urgency_level')}, specialist={d.get('specialist')}, conditions={len(d.get('conditions', []))}")

print("\n=== 6. History ===")
r = client.get("/api/history", headers=auth_headers)
check("history with token -> 200", r.status_code == 200, str(r.status_code))
if r.status_code == 200:
    check("history is a list", isinstance(r.json(), list))
    check("history contains the session we just created",
          any(s.get("session_id") == session_id for s in r.json()))

r = client.get("/api/history")
check("history without token -> 401", r.status_code == 401, str(r.status_code))

print("\n=== 7. Appointments ===")
r = client.post(
    "/api/appointments",
    json={
        "session_id": session_id,
        "specialist_type": "Neurologist",
        "appointment_date": "2026-07-01",
        "appointment_time": "10:30:00",
        "patient_name": "Test User",
        "contact_email": EMAIL,
    },
    headers=auth_headers,
)
check("book appointment -> 200", r.status_code == 200, str(r.status_code) + " " + r.text[:200])
booking_id = None
if r.status_code == 200:
    booking_id = r.json().get("booking_id")
    check("booking returns booking_id", bool(booking_id))
    check("booking status pending", r.json().get("status") == "pending")

r = client.get("/api/appointments", headers=auth_headers)
check("list appointments with token -> 200", r.status_code == 200, str(r.status_code))
if r.status_code == 200:
    check("appointment list contains our booking",
          any(a.get("booking_id") == booking_id for a in r.json()))

r = client.get("/api/appointments")
check("list appointments without token -> 401", r.status_code == 401, str(r.status_code))

print("\n=== 8. Anonymous triage (no token) ===")
r = client.post(
    "/api/triage",
    json={"symptoms": "I have a mild sore throat and runny nose for two days", "existing_conditions": [], "medications": []},
)
check("anonymous triage -> 200", r.status_code == 200, str(r.status_code) + " " + r.text[:200])

print("\n" + "=" * 40)
print(f"  RESULTS: {passed} passed, {failed} failed")
print("=" * 40)
sys.exit(1 if failed else 0)
