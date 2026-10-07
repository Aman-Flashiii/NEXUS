import os
import json
import urllib.request
import urllib.error

_mock_students = [
    {
        "id": "S1047", "name": "Rahul Sharma", "program": "B.Tech CSE", 
        "current_risk": 82.0, "momentum": -18.5,
        "attendance_trend": [91, 90, 92, 89, 90, 74, 68, 64], 
        "gpa_trend": [7.2, 7.1, 7.0, 6.7, 6.3],
        "lms_login_freq": 2.5, "assignment_completion": 65.0, "engagement_score": 40.0,
        "aptitude_score": 75.0, "coding_score": 60.0, "mock_interview_score": 55.0,
        "technical_skill_score": 65.0, "soft_skill_score": 70.0, "feedback_score": 60.0,
        "skill_graph": {
            "Algebra": {"name": "Algebra", "mastery": 82, "prerequisites": []},
            "Functions": {"name": "Functions", "mastery": 71, "prerequisites": ["Algebra"]},
            "Calculus": {"name": "Calculus", "mastery": 45, "prerequisites": ["Functions"]}
        }
    },
    {
        "id": "S1048", "name": "Priya Patel", "program": "B.Tech CSE", 
        "current_risk": 45.0, "momentum": 5.2,
        "attendance_trend": [80, 82, 85, 84, 88, 89, 91, 92], 
        "gpa_trend": [6.5, 6.6, 6.8, 7.0, 7.2],
        "lms_login_freq": 8.0, "assignment_completion": 95.0, "engagement_score": 85.0,
        "aptitude_score": 92.0, "coding_score": 88.0, "mock_interview_score": 90.0,
        "technical_skill_score": 90.0, "soft_skill_score": 85.0, "feedback_score": 88.0,
        "skill_graph": {
            "Algebra": {"name": "Algebra", "mastery": 90, "prerequisites": []},
            "Calculus": {"name": "Calculus", "mastery": 85, "prerequisites": ["Algebra"]}
        }
    },
    {
        "id": "S1049", "name": "Amit Verma", "program": "B.Tech Mech", 
        "current_risk": 91.0, "momentum": -25.0,
        "attendance_trend": [60, 55, 50, 45, 40, 35, 30, 25], 
        "gpa_trend": [5.0, 4.8, 4.5, 4.2, 3.9],
        "lms_login_freq": 1.0, "assignment_completion": 30.0, "engagement_score": 20.0,
        "aptitude_score": 45.0, "coding_score": 40.0, "mock_interview_score": 35.0,
        "technical_skill_score": 40.0, "soft_skill_score": 50.0, "feedback_score": 45.0,
        "skill_graph": {
            "Thermodynamics": {"name": "Thermodynamics", "mastery": 40, "prerequisites": []}
        }
    },
    {
        "id": "S1050", "name": "Sneha Reddy", "program": "B.Tech CSE", 
        "current_risk": 60.0, "momentum": -5.0,
        "attendance_trend": [95, 94, 96, 95, 93, 92, 90, 89], 
        "gpa_trend": [8.5, 8.6, 8.8, 8.7, 8.9],
        "lms_login_freq": 9.0, "assignment_completion": 98.0, "engagement_score": 90.0,
        "aptitude_score": 55.0, "coding_score": 45.0, "mock_interview_score": 40.0,
        "technical_skill_score": 50.0, "soft_skill_score": 60.0, "feedback_score": 85.0,
        "skill_graph": {
            "Data_Structures": {"name": "Data Structures", "mastery": 88, "prerequisites": []},
            "Algorithms": {"name": "Algorithms", "mastery": 85, "prerequisites": ["Data_Structures"]}
        }
    }
]

def get_kv_students():
    kv_url = os.getenv("KV_REST_API_URL") or os.getenv("UPSTASH_REDIS_REST_URL")
    kv_token = os.getenv("KV_REST_API_TOKEN") or os.getenv("UPSTASH_REDIS_REST_TOKEN")
    
    if not kv_url or not kv_token:
        print("WARNING: Redis/KV missing. Falling back to in-memory data.")
        return list(_mock_students)
    
    try:
        req = urllib.request.Request(f"{kv_url}/get/students")
        req.add_header("Authorization", f"Bearer {kv_token}")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data and data.get("result"):
                result = data["result"]
                if isinstance(result, str):
                    parsed = json.loads(result)
                    # Handle previously double-encoded data
                    if isinstance(parsed, str):
                        parsed = json.loads(parsed)
                    return parsed
                return result
    except Exception as e:
        print("KV Get Error:", e)
    
    # If not found or error, initialize KV with our default mock students
    set_kv_students(_mock_students)
    return list(_mock_students)

def set_kv_students(students):
    kv_url = os.getenv("KV_REST_API_URL") or os.getenv("UPSTASH_REDIS_REST_URL")
    kv_token = os.getenv("KV_REST_API_TOKEN") or os.getenv("UPSTASH_REDIS_REST_TOKEN")
    
    if not kv_url or not kv_token:
        # Fallback updates the in-memory array
        global _mock_students
        _mock_students = list(students)
        return
    
    try:
        req = urllib.request.Request(f"{kv_url}/set/students", method="POST")
        req.add_header("Authorization", f"Bearer {kv_token}")
        req.add_header("Content-Type", "application/json")
        payload = json.dumps(students).encode('utf-8')
        urllib.request.urlopen(req, data=payload)
    except Exception as e:
        print("KV Set Error:", e)

def get_mock_students():
    return get_kv_students()

def add_mock_student(student_data):
    students = get_kv_students()
    students.append(student_data)
    set_kv_students(students)
    return student_data

def delete_mock_student(student_id):
    students = get_kv_students()
    students = [s for s in students if s["id"] != student_id]
    set_kv_students(students)
    return True

def get_mock_interventions():
    return [
        {"id": "I1", "name": "Peer Coding Tutoring", "cost": 2000, "staff_required": "tutor", "impact_score": 28.0, "category": "academic"},
        {"id": "I2", "name": "Mock Interview Bootcamp", "cost": 1500, "staff_required": "mentor", "impact_score": 35.0, "category": "placement"},
        {"id": "I3", "name": "Attendance Counseling", "cost": 500, "staff_required": "mentor", "impact_score": 15.0, "category": "behavioral"},
        {"id": "I4", "name": "Soft Skills Workshop", "cost": 1000, "staff_required": "counselor", "impact_score": 20.0, "category": "placement"},
        {"id": "I5", "name": "Financial Aid Workshop", "cost": 0, "staff_required": "counselor", "impact_score": 12.0, "category": "financial"}
    ]
