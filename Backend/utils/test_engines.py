import pytest
import sys
import os

# Add parent directory to path to import engine
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine import AnomalyEngine, SuccessScoreEngine, SimulationEngine, SegmentationEngine
from mock_data import get_mock_students
from utils.math_helpers import min_max_normalize, exponential_decay

# ==========================================
# TEST 1: Anomaly Detection (CUSUM)
# ==========================================
def test_cusum_detects_sudden_drop():
    # Data with a sudden, unnatural drop
    data = [90, 91, 89, 90, 88, 50, 45, 40]
    result = AnomalyEngine.detect_change_point_cusum(data)
    assert result["detected"] is True
    assert result["severity"] in ["Medium", "High"]

def test_cusum_ignores_normal_variance():
    # Normal, stable data
    data = [85, 86, 84, 85, 87, 85, 86]
    result = AnomalyEngine.detect_change_point_cusum(data)
    assert result["detected"] is False

# ==========================================
# TEST 2: Success Score & Risk Flagging
# ==========================================
def test_success_score_calculation_bounds():
    students = get_mock_students()
    rahul = next(s for s in students if s["id"] == "S1047")
    result = SuccessScoreEngine.calculate(rahul)
    
    score = result["breakdown"]["total_success_score"]
    # Mathematically prove the score is strictly between 0 and 100
    assert 0.0 <= score <= 100.0
    assert result["risk_flag"] in ["Low", "Medium", "High"]

# ==========================================
# TEST 3: Simulation Engine (Exponential Decay)
# ==========================================
def test_simulation_never_exceeds_100_percent():
    # Even with massive interventions, success cannot exceed 100%
    result = SimulationEngine.run_counterfactual(
        base_risk=10.0, # 90% baseline success
        impacts=[50.0, 50.0, 50.0, 50.0], # Massive impact
        momentum=5.0
    )
    assert result["simulated_success"] <= 100.0
    assert result["simulated_success"] > 90.0

# ==========================================
# TEST 4: Segmentation Logic
# ==========================================
def test_segmentation_finds_hidden_gems():
    students = get_mock_students()
    segments = SegmentationEngine.segment_students(students)
    segment_names = [s["segment_name"] for s in segments]
    
    # Sneha (S1050) has High GPA but Low Placement -> Must be in Hidden Gems
    assert "Hidden Gems" in segment_names
    
    # Verify Sneha is actually in that segment
    hidden_gems = next(s for s in segments if s["segment_name"] == "Hidden Gems")
    assert "S1050" in hidden_gems["student_ids"]

# ==========================================
# TEST 5: Math Helpers
# ==========================================
def test_math_helpers():
    assert min_max_normalize(150.0) == 100.0
    assert min_max_normalize(-20.0) == 0.0
    
    # Test exponential decay saturation
    result = exponential_decay(base_success=80.0, total_efficacy=500.0)
    assert result <= 100.0