from pydantic import BaseModel
from typing import List, Optional, Dict

# --- Core Data Models ---
class SkillNode(BaseModel):
    name: str
    mastery: float
    prerequisites: List[str] = []

class Student(BaseModel):
    id: str
    name: str
    program: str
    # Academic & Attendance
    current_risk: float
    momentum: float
    attendance_trend: List[float]
    gpa_trend: List[float]
    # LMS & Engagement
    lms_login_freq: float # logins per week
    assignment_completion: float # percentage
    engagement_score: float # 0-100 (clubs, hackathons)
    # Placement & Skills
    aptitude_score: float # 0-100
    coding_score: float # 0-100
    mock_interview_score: float # 0-100
    technical_skill_score: float # 0-100
    soft_skill_score: float # 0-100
    # Feedback
    feedback_score: float # 0-100 (student satisfaction)
    skill_graph: Dict[str, SkillNode] = {}

class Intervention(BaseModel):
    id: str
    name: str
    cost: float
    staff_required: str
    impact_score: float
    category: str

# --- Analytics Models ---
class ChangePointResult(BaseModel):
    detected: bool
    method: str
    severity: Optional[str] = None
    message: str

class RootCauseFactor(BaseModel):
    factor: str
    contribution: float
    trend: str

# --- KPMG SPECIFIC MODELS ---
class SuccessScoreBreakdown(BaseModel):
    academic: float
    attendance: float
    lms_engagement: float
    extracurricular_engagement: float
    placement_readiness: float
    skills: float
    feedback: float
    total_success_score: float

class SuccessScoreResponse(BaseModel):
    student_id: str
    student_name: str
    breakdown: SuccessScoreBreakdown
    risk_flag: str # "Low", "Medium", "High"

class StudentSegment(BaseModel):
    segment_name: str
    description: str
    student_ids: List[str]
    recommended_action: str

class SegmentationResponse(BaseModel):
    segments: List[StudentSegment]

class ExplainableScoreResponse(BaseModel):
    student_id: str
    total_success_score: float
    risk_flag: str
    top_positive_drivers: List[str]
    top_negative_drivers: List[str]

# --- Simulation & Optimization Models ---
class SimulationRequest(BaseModel):
    student_id: str
    selected_intervention_ids: List[str]

class SimulationResponse(BaseModel):
    baseline_success: float
    simulated_success: float
    delta_impact: float
    confidence_interval: List[float]
    reasoning: str

class OptimizationRequest(BaseModel):
    budget: float
    max_mentors: int
    max_tutors: int

class AllocationItem(BaseModel):
    student_id: str
    student_name: str
    intervention_name: str
    cost: float
    priority_score: float

class OptimizationResponse(BaseModel):
    status: str
    total_allocations: int
    total_cost: float
    expected_impact: float
    allocations: List[AllocationItem]

class AIReportResponse(BaseModel):
    student_id: str
    student_name: str
    ai_generated_report: str