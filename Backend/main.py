from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# --- 🆕 Centralized Configuration & Professional Logging ---
from config import settings
from utils.logger import app_logger

# --- Models ---
from models import (
    SimulationRequest,
    SimulationResponse,
    OptimizationRequest,
    OptimizationResponse,
    ChangePointResult,
    RootCauseFactor,
    AIReportResponse,
    SuccessScoreResponse,
    SegmentationResponse,
    ExplainableScoreResponse,
)

# --- Engines ---
from engine import (
    AnomalyEngine,
    KnowledgeGraphEngine,
    SimulationEngine,
    RootCauseEngine,
    OptimizationEngine,
    SuccessScoreEngine,
    SegmentationEngine,
    ExplainableScoreEngine,
    llm_engine,
)

from mock_data import get_mock_students, get_mock_interventions, add_mock_student, delete_mock_student
from models import Student

# --- App Initialization (Using config.py) ---
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="AI-Powered Student Analytics and Success Platform (KPMG Hackathon)",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    app_logger.info("Health check requested.")
    return {
        "status": "healthy",
        "version": settings.API_VERSION,
        "engines": [
            "CUSUM",
            "PuLP",
            "NetworkX",
            "Counterfactual",
            "DeepSeek-V4.1-Flash",
            "Success Score",
            "Student Segmentation",
            "Explainable AI",
        ],
    }


@app.get("/api/students")
def get_students():
    app_logger.info("Fetching student cohort data.")
    try:
        return get_mock_students()
    except Exception as e:
        app_logger.error(f"Failed to load students: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load students: {str(e)}")


@app.post("/api/students", response_model=Student)
def create_student(student: Student):
    app_logger.info(f"Adding new student: {student.id}")
    try:
        student_dict = student.model_dump()
        
        # Calculate momentum dynamically based on historical trend
        if len(student_dict["gpa_trend"]) > 1 and len(student_dict["attendance_trend"]) > 1:
            gpa_diff = student_dict["gpa_trend"][-1] - student_dict["gpa_trend"][0]
            att_diff = student_dict["attendance_trend"][-1] - student_dict["attendance_trend"][0]
            student_dict["momentum"] = round((gpa_diff * 10.0) + (att_diff * 0.5), 1)
        else:
            student_dict["momentum"] = 0.0

        # 🤖 AI Engine calculates the risk score automatically
        score_data = SuccessScoreEngine.calculate(student_dict)
        student_dict["current_risk"] = round(100.0 - score_data["breakdown"]["total_success_score"], 1)
        
        return add_mock_student(student_dict)
    except Exception as e:
        app_logger.error(f"Failed to add student: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add student: {str(e)}")


@app.delete("/api/students/{student_id}")
def delete_student(student_id: str):
    app_logger.info(f"Deleting student: {student_id}")
    try:
        delete_mock_student(student_id)
        return {"status": "success", "message": f"Student {student_id} deleted."}
    except Exception as e:
        app_logger.error(f"Failed to delete student: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete student: {str(e)}")


@app.get("/api/interventions")
def get_interventions():
    app_logger.info("Fetching intervention catalog.")
    try:
        return get_mock_interventions()
    except Exception as e:
        app_logger.error(f"Failed to load interventions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load interventions: {str(e)}")


# ==========================================
# KPMG SPECIFIC ENDPOINTS
# ==========================================
@app.get("/api/success-score/{student_id}", response_model=SuccessScoreResponse)
def get_success_score(student_id: str):
    students = get_mock_students()
    student = next((s for s in students if s["id"] == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    try:
        app_logger.info(f"Calculating Success Score for {student_id}.")
        score_data = SuccessScoreEngine.calculate(student)
        return {"student_id": student_id, "student_name": student["name"], **score_data}
    except Exception as e:
        app_logger.error(f"Success score calculation failed for {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Success score calculation failed: {str(e)}")


@app.get("/api/explainable-score/{student_id}", response_model=ExplainableScoreResponse)
def get_explainable_score(student_id: str):
    students = get_mock_students()
    student = next((s for s in students if s["id"] == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    try:
        app_logger.info(f"Generating Explainable Score for {student_id}.")
        score_data = SuccessScoreEngine.calculate(student)
        explanation = ExplainableScoreEngine.explain(student, score_data)
        return {"student_id": student_id, **explanation}
    except Exception as e:
        app_logger.error(f"Explainable score analysis failed for {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Explainable score analysis failed: {str(e)}")


@app.get("/api/segmentation", response_model=SegmentationResponse)
def get_segmentation():
    students = get_mock_students()
    try:
        app_logger.info("Running Z-Score Student Segmentation.")
        segments = SegmentationEngine.segment_students(students)
        return {"segments": segments}
    except Exception as e:
        app_logger.error(f"Student segmentation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Student segmentation failed: {str(e)}")


# ==========================================
# ANALYTICS & AI ENDPOINTS
# ==========================================
@app.get("/api/change-point/{student_id}", response_model=ChangePointResult)
def check_change_point(student_id: str):
    students = get_mock_students()
    student = next((s for s in students if s["id"] == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    try:
        app_logger.info(f"Running CUSUM change-point detection for {student_id}.")
        return AnomalyEngine.detect_change_point_cusum(student["attendance_trend"])
    except Exception as e:
        app_logger.error(f"Change-point analysis failed for {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Change-point analysis failed: {str(e)}")


@app.get("/api/root-cause/{student_id}", response_model=List[RootCauseFactor])
def get_root_cause(student_id: str):
    students = get_mock_students()
    student = next((s for s in students if s["id"] == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    try:
        app_logger.info(f"Running Root-Cause analysis for {student_id}.")
        return RootCauseEngine.analyze(student)
    except Exception as e:
        app_logger.error(f"Root-cause analysis failed for {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Root-cause analysis failed: {str(e)}")


@app.get("/api/knowledge-graph/{student_id}")
def get_knowledge_graph(student_id: str):
    students = get_mock_students()
    student = next((s for s in students if s["id"] == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    try:
        app_logger.info(f"Analyzing Knowledge Graph bottlenecks for {student_id}.")
        bottlenecks = KnowledgeGraphEngine.find_bottlenecks(student["skill_graph"])
        return {
            "student_id": student_id,
            "bottlenecks": bottlenecks,
            "full_graph": student["skill_graph"],
        }
    except Exception as e:
        app_logger.error(f"Knowledge graph analysis failed for {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Knowledge graph analysis failed: {str(e)}")


@app.post("/api/simulate", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    students = get_mock_students()
    interventions = get_mock_interventions()

    student = next((s for s in students if s["id"] == req.student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{req.student_id}' not found")

    try:
        app_logger.info(f"Running Intervention Twin simulation for {req.student_id}.")
        selected_impacts = [
            intervention["impact_score"]
            for intervention in interventions
            if intervention["id"] in req.selected_intervention_ids
        ]
        return SimulationEngine.run_counterfactual(
            student["current_risk"], selected_impacts, student["momentum"]
        )
    except Exception as e:
        app_logger.error(f"Simulation failed for {req.student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@app.post("/api/optimize", response_model=OptimizationResponse)
def run_optimization(req: OptimizationRequest):
    students = get_mock_students()
    interventions = get_mock_interventions()

    try:
        app_logger.info(f"Running PuLP Resource Optimization (Budget: {req.budget}).")
        return OptimizationEngine.solve(
            students, interventions, req.budget, req.max_mentors, req.max_tutors
        )
    except Exception as e:
        app_logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@app.get("/api/ai-report/{student_id}", response_model=AIReportResponse)
def generate_ai_report(student_id: str):
    students = get_mock_students()
    interventions = get_mock_interventions()

    student = next((s for s in students if s["id"] == student_id), None)

    if student is None:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

    try:
        app_logger.info(f"Generating DeepSeek AI Counselor Report for {student_id}.")
        root_causes = RootCauseEngine.analyze(student)

        sorted_interventions = sorted(interventions, key=lambda x: x["impact_score"], reverse=True)
        top_interventions = [intervention["name"] for intervention in sorted_interventions[:2]]

        report = llm_engine.generate_counselor_report(student, root_causes, top_interventions)

        return {
            "student_id": student_id,
            "student_name": student["name"],
            "ai_generated_report": report,
        }
    except Exception as e:
        app_logger.error(f"AI report generation failed for {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI report generation failed: {str(e)}")


# ==========================================
# RUN SERVER (Using config.py + logger)
# ==========================================
# RUN SERVER (using config.py + logger)
# ====================================
if __name__ == "__main__":
    import uvicorn

    app_logger.info("=" * 60)
    app_logger.info(f"{settings.APP_NAME} v{settings.API_VERSION} (KPMG Build)")
    app_logger.info("=" * 60)
    app_logger.info(f"API:    http://{settings.HOST}:{settings.PORT}")
    app_logger.info(f"Docs:   http://{settings.HOST}:{settings.PORT}/docs")
    app_logger.info(f"Health: http://{settings.HOST}:{settings.PORT}/health")
    app_logger.info("=" * 60)

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )