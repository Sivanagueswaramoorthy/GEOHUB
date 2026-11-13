import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

test_cases = [
    ('SA01', 'admin123'),
    ('SA01', 'GeoHub2026!'),
    ('sa01', 'admin123'),
    ('superadmin', 'admin123'),
    ('FAC01', 'admin123'),
    ('fac01', 'admin123'),
    ('faculty', 'admin123'),
    ('21GEO001', 'admin123'),
    ('coordinator', 'admin123'),
    ('president', 'admin123'),
    ('21GEO010', 'admin123'),
    ('management', 'admin123'),
    ('22GEO018', 'admin123'),
    ('documentation', 'admin123'),
    ('22GEO019', 'admin123'),
    ('treasurer', 'admin123'),
    ('22GEO014', 'admin123'),
    ('promotion', 'admin123'),
    ('23GEO042', 'admin123'),
    ('volunteer', 'admin123'),
    ('23GEO088', 'admin123'),
    ('student', 'admin123'),
]

all_passed = True
for roll, pwd in test_cases:
    res = client.post('/api/auth/login', json={'identifier': roll, 'password': pwd})
    if res.status_code == 200:
        data = res.json()
        role = data["user"]["role"]
        name = data["user"]["name"]
        print(f"{roll:15} | {pwd:12} -> OK (role: {role:12}, name: {name})")
    else:
        print(f"{roll:15} | {pwd:12} -> FAIL ({res.status_code}: {res.text})")
        all_passed = False

if all_passed:
    print("\nALL 22 LOGIN COMBINATIONS PASSED PERFECTLY!")
