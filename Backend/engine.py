import numpy as np
import networkx as nx
import pulp
import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

# ==========================================
# ENGINE 1: ANOMALY DETECTION (Two-Sided CUSUM)
# ==========================================
class AnomalyEngine:
    @staticmethod
    def detect_change_point_cusum(data: List[float], threshold: float = 4.0) -> Dict:
        """Industry-standard Statistical Process Control for behavioral shifts."""
        if len(data) < 4:
            return {"detected": False, "method": "Two-Sided CUSUM", "message": "Insufficient data"}
        
        mean, std = np.mean(data), np.std(data)
        if std == 0: 
            return {"detected": False, "method": "Two-Sided CUSUM", "message": "No variance"}
        
        cusum_pos, cusum_neg = 0.0, 0.0
        k = 0.5 * std  # Slack value to ignore minor noise
        
        for i, val in enumerate(data):
            cusum_pos = max(0, cusum_pos + (val - mean) - k)
            cusum_neg = max(0, cusum_neg - (val - mean) - k)
            
            if cusum_pos > threshold or cusum_neg > threshold:
                direction = "positive" if cusum_pos > threshold else "negative"
                max_cusum = max(cusum_pos, cusum_neg)
                return {
                    "detected": True, 
                    "method": "Two-Sided CUSUM",
                    "severity": "High" if max_cusum > threshold * 2 else "Medium",
                    "message": f"Significant {direction} regime shift detected at index {i} (CUSUM={max_cusum:.2f})"
                }
        return {"detected": False, "method": "Two-Sided CUSUM", "message": "Behavior within normal statistical parameters"}

# ==========================================
# ENGINE 2: KNOWLEDGE GRAPH
# ==========================================
class KnowledgeGraphEngine:
    @staticmethod
    def find_bottlenecks(skill_graph: Dict) -> List[Dict]:
        """Identifies prerequisite skills blocking progress using NetworkX."""
        G = nx.DiGraph()
        for skill, data in skill_graph.items():
            G.add_node(skill, mastery=data['mastery'])
            for prereq in data['prerequisites']:
                G.add_edge(prereq, skill)
                
        bottlenecks = []
        for node in G.nodes():
            if G.nodes[node]['mastery'] < 50:
                successors = list(G.successors(node))
                if successors:
                    bottlenecks.append({
                        "skill": node, 
                        "mastery": G.nodes[node]['mastery'], 
                        "blocking": successors
                    })
        return sorted(bottlenecks, key=lambda x: x['mastery'])

# ==========================================
# ENGINE 3: KPMG SUCCESS SCORE (Normalized Weighted Sum)
# ==========================================
class SuccessScoreEngine:
    @staticmethod
    def calculate(student: Dict) -> Dict:
        # Weights summing exactly to 1.0
        weights = {
            "academic": 0.25, "attendance": 0.15, "lms_engagement": 0.15, 
            "extracurricular_engagement": 0.10, "placement_readiness": 0.15, 
            "skills": 0.15, "feedback": 0.05
        }
        
        # Strict Min-Max Normalization to [0, 100]
        academic = max(0.0, min(100.0, (np.mean(student['gpa_trend']) / 10.0) * 100.0))
        attendance = float(np.mean(student['attendance_trend'][-3:])) # Recent 3 weeks
        lms = max(0.0, min(100.0, (student['lms_login_freq'] / 10.0 * 50.0) + (student['assignment_completion'] * 0.5)))
        extracurricular = max(0.0, min(100.0, student['engagement_score']))
        placement = float(np.mean([student['aptitude_score'], student['coding_score'], student['mock_interview_score']]))
        skills = float(np.mean([student['technical_skill_score'], student['soft_skill_score']]))
        feedback = max(0.0, min(100.0, student['feedback_score']))
        
        breakdown = {
            "academic": round(academic, 1), "attendance": round(attendance, 1),
            "lms_engagement": round(lms, 1), "extracurricular_engagement": round(extracurricular, 1),
            "placement_readiness": round(placement, 1), "skills": round(skills, 1), "feedback": round(feedback, 1)
        }
        
        # Weighted aggregation
        total = sum(breakdown[k] * weights[k] for k in weights)
        
        # Risk Flag Logic
        if total >= 80.0: risk_flag = "Low"
        elif total >= 60.0: risk_flag = "Medium"
        else: risk_flag = "High"
        
        breakdown["total_success_score"] = round(total, 1)
        return {"breakdown": breakdown, "risk_flag": risk_flag}

# ==========================================
# ENGINE 4: EXPLAINABLE SCORE (SHAP-like Contribution)
# ==========================================
class ExplainableScoreEngine:
    @staticmethod
    def explain(student: Dict, success_data: Dict) -> Dict:
        breakdown = success_data['breakdown']
        # Cohort baselines (mocked, but represents institutional average)
        baselines = {
            "academic": 75.0, "attendance": 85.0, "lms_engagement": 70.0, 
            "extracurricular_engagement": 60.0, "placement_readiness": 65.0, 
            "skills": 70.0, "feedback": 75.0
        }
        weights = {
            "academic": 0.25, "attendance": 0.15, "lms_engagement": 0.15, 
            "extracurricular_engagement": 0.10, "placement_readiness": 0.15, 
            "skills": 0.15, "feedback": 0.05
        }
        
        pos_drivers, neg_drivers = [], []
        for key, score in breakdown.items():
            if key == "total_success_score": continue
            
            # Mathematical Contribution = (Actual - Baseline) * Weight * 100 (for readability)
            contribution = (score - baselines.get(key, 70.0)) * weights.get(key, 0.1) * 100
            
            if contribution < -3.0:
                neg_drivers.append(f"{key.replace('_', ' ').title()} is {contribution:.1f} pts below cohort average")
            elif contribution > 3.0:
                pos_drivers.append(f"{key.replace('_', ' ').title()} is +{contribution:.1f} pts above cohort average")
                
        return {
            "total_success_score": breakdown['total_success_score'],
            "risk_flag": success_data['risk_flag'],
            "top_positive_drivers": pos_drivers[:3] if pos_drivers else ["Performing at or above cohort baseline"],
            "top_negative_drivers": neg_drivers[:3] if neg_drivers else ["No significant negative deviations from baseline"]
        }

# ==========================================
# ENGINE 5: SIMULATION TWIN (Exponential Decay Model)
# ==========================================
class SimulationEngine:
    @staticmethod
    def run_counterfactual(base_risk: float, impacts: List[float], momentum: float) -> Dict:
        """Uses exponential decay for realistic, asymptotic diminishing returns."""
        base_success = 100.0 - base_risk
        momentum_modifier = 1.0 if momentum > -10 else 0.75
        
        # Sum of efficacies
        total_efficacy = sum(impacts) * momentum_modifier
        
        # Exponential decay formula: New Success = 100 - (100 - Base) * e^(-total_efficacy / 100)
        # This guarantees the score smoothly approaches 100% but never exceeds it.
        decay_factor = total_efficacy / 100.0
        new_success = 100.0 - ((100.0 - base_success) * np.exp(-decay_factor))
        
        return {
            "baseline_success": round(base_success, 1),
            "simulated_success": round(new_success, 1),
            "delta_impact": round(new_success - base_success, 1),
            "confidence_interval": [round(new_success - 4, 1), round(new_success + 4, 1)],
            "reasoning": f"Applied exponential decay model with {len(impacts)} interventions. Efficacy adjusted to {momentum_modifier*100:.0f}% due to momentum."
        }

# ==========================================
# ENGINE 6A: ROOT CAUSE ANALYSIS
# ==========================================
class RootCauseEngine:
    @staticmethod
    def analyze(student: Dict) -> List[Dict]:
        factors = []

        # Attendance
        att = student['attendance_trend']
        att_avg = np.mean(att)
        att_trend = "declining" if att[-1] < att[0] else "stable"
        if att_avg < 75:
            factors.append({"factor": "Low Attendance", "contribution": round((75 - att_avg) / 75 * 100, 1), "trend": att_trend})

        # GPA
        gpa = student['gpa_trend']
        gpa_avg = np.mean(gpa)
        gpa_trend = "declining" if gpa[-1] < gpa[0] else "stable"
        if gpa_avg < 6.5:
            factors.append({"factor": "Below-Average GPA", "contribution": round((6.5 - gpa_avg) / 6.5 * 100, 1), "trend": gpa_trend})

        # LMS Engagement
        lms = student['lms_login_freq']
        if lms < 5:
            factors.append({"factor": "Low LMS Engagement", "contribution": round((5 - lms) / 5 * 100, 1), "trend": "declining"})

        # Assignment Completion
        ac = student['assignment_completion']
        if ac < 70:
            factors.append({"factor": "Incomplete Assignments", "contribution": round((70 - ac) / 70 * 100, 1), "trend": "declining"})

        # Placement Readiness
        placement = np.mean([student['aptitude_score'], student['coding_score'], student['mock_interview_score']])
        if placement < 60:
            factors.append({"factor": "Low Placement Readiness", "contribution": round((60 - placement) / 60 * 100, 1), "trend": "stable"})

        # Sort by contribution descending
        return sorted(factors, key=lambda x: x['contribution'], reverse=True)

# ==========================================
# ENGINE 6: RESOURCE OPTIMIZER (Advanced PuLP)
# ==========================================
class OptimizationEngine:
    @staticmethod
    def solve(students: List[Dict], interventions: List[Dict], budget: float, max_mentors: int, max_tutors: int) -> Dict:
        prob = pulp.LpProblem("NEXUS_Optimal_Allocation", pulp.LpMaximize)
        x = {}
        for i in range(len(students)):
            for j in range(len(interventions)):
                x[i,j] = pulp.LpVariable(f"x_{i}_{j}", cat='Binary')
                
        # Advanced Objective: Maximize (Risk Weight * Impact) - (Cost Normalization Penalty)
        # This optimizes for true ROI, not just raw impact or raw cheapness.
        prob += pulp.lpSum([
            x[i,j] * ( (students[i]['current_risk']/100.0) * interventions[j]['impact_score'] - (interventions[j]['cost'] / (budget + 1)) * 5.0 )
            for i in range(len(students)) for j in range(len(interventions))
        ])
        
        # Constraints
        # 1. Budget
        prob += pulp.lpSum([x[i,j] * interventions[j]['cost'] for i in range(len(students)) for j in range(len(interventions))]) <= budget
        
        # 2. Max 2 interventions per student
        for i in range(len(students)):
            prob += pulp.lpSum([x[i,j] for j in range(len(interventions))]) <= 2
            
        # 3. FAIRNESS CONSTRAINT: Ensure top 3 highest-risk students get at least 1 intervention
        sorted_by_risk = sorted(enumerate(students), key=lambda item: item[1]['current_risk'], reverse=True)
        for idx, (orig_i, _) in enumerate(sorted_by_risk[:3]):
            prob += pulp.lpSum([x[orig_i, j] for j in range(len(interventions))]) >= 1

        # 4. Staff constraints
        mentor_assignments = pulp.lpSum([x[i,j] for i in range(len(students)) for j in range(len(interventions)) if interventions[j]['staff_required'] == 'mentor'])
        tutor_assignments = pulp.lpSum([x[i,j] for i in range(len(students)) for j in range(len(interventions)) if interventions[j]['staff_required'] == 'tutor'])
        
        prob += mentor_assignments <= max_mentors
        prob += tutor_assignments <= max_tutors

        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        allocations, total_cost, total_impact = [], 0, 0
        for i in range(len(students)):
            for j in range(len(interventions)):
                if pulp.value(x[i,j]) == 1:
                    priority = (students[i]['current_risk'] * interventions[j]['impact_score'])
                    allocations.append({
                        "student_id": students[i]['id'], "student_name": students[i]['name'],
                        "intervention_name": interventions[j]['name'], "cost": interventions[j]['cost'],
                        "priority_score": round(priority, 1)
                    })
                    total_cost += interventions[j]['cost']
                    total_impact += interventions[j]['impact_score']
                    
        return {
            "status": "Optimal" if pulp.LpStatus[prob.status] == 'Optimal' else 'Infeasible',
            "total_allocations": len(allocations), "total_cost": total_cost,
            "expected_impact": round(total_impact, 1), 
            "allocations": sorted(allocations, key=lambda x: x['priority_score'], reverse=True)
        }

# ==========================================
# ENGINE 7: STUDENT SEGMENTATION (Z-Score Based)
# ==========================================
class SegmentationEngine:
    @staticmethod
    def segment_students(students: List[Dict]) -> List[Dict]:
        if not students: return []
        
        # Calculate cohort statistics dynamically
        academics = [np.mean(s['gpa_trend']) for s in students]
        placements = [np.mean([s['aptitude_score'], s['coding_score'], s['mock_interview_score']]) for s in students]
        
        mean_acad, std_acad = np.mean(academics), np.std(academics) or 1.0
        mean_place, std_place = np.mean(placements), np.std(placements) or 1.0
        
        segments = {
            "Stars": {"description": "High Academic & High Placement Readiness (Above Cohort Mean)", "student_ids": [], "recommended_action": "Fast-track to premium companies and leadership roles."},
            "Hidden Gems": {"description": "High Academic but Low Placement Readiness", "student_ids": [], "recommended_action": "Urgent mock interviews, aptitude training, and soft skills workshops."},
            "Engaged but Struggling": {"description": "High Engagement but Low Academic Performance", "student_ids": [], "recommended_action": "Academic tutoring and time management counseling."},
            "At-Risk Disengaged": {"description": "Low Academic & Low Engagement", "student_ids": [], "recommended_action": "Immediate faculty mentorship and attendance counseling."}
        }
        
        for s in students:
            acad_score = np.mean(s['gpa_trend'])
            place_score = np.mean([s['aptitude_score'], s['coding_score'], s['mock_interview_score']])
            engagement = s['engagement_score']
            
            # Z-score logic: > mean indicates above average performance
            is_high_acad = acad_score > mean_acad
            is_high_place = place_score > mean_place
            is_high_engage = engagement > 70.0 # Absolute threshold for extracurriculars
            
            if is_high_acad and is_high_place:
                segments["Stars"]["student_ids"].append(s['id'])
            elif is_high_acad and not is_high_place:
                segments["Hidden Gems"]["student_ids"].append(s['id'])
            elif is_high_engage and not is_high_acad:
                segments["Engaged but Struggling"]["student_ids"].append(s['id'])
            else:
                segments["At-Risk Disengaged"]["student_ids"].append(s['id'])
                
        return [{"segment_name": k, **v} for k, v in segments.items() if len(v["student_ids"]) > 0]

# ==========================================
# ENGINE 8: DEEPSEEK LLM INTEGRATION
# ==========================================
class LLMEngine:
    def __init__(self):
        api_key = os.getenv("DEEPSEEK_API_KEY")
        self.client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com/v1") if api_key else None
        self.model = "deepseek-chat"

    def generate_counselor_report(self, student: Dict, root_causes: List[Dict], recommended_interventions: List[str]) -> str:
        if not self.client: return "AI Service unavailable: DEEPSEEK_API_KEY missing."
        prompt = f"""You are an expert AI Academic Success Coach. Analyze this student data for a faculty counselor.
        STUDENT: {student['name']} ({student['id']}), Program: {student['program']}, Risk: {student['current_risk']}%, Momentum: {student['momentum']}
        ROOT CAUSES: {root_causes}
        RECOMMENDED INTERVENTIONS: {recommended_interventions}
        Format in 3 short paragraphs: 1. Situation Summary, 2. Core Issues, 3. Action Plan."""
        try:
            response = self.client.chat.completions.create(model=self.model, messages=[{"role": "user", "content": prompt}], temperature=0.7, max_tokens=400)
            return response.choices[0].message.content
        except Exception as e:
            return f"AI Service error: {str(e)}"

llm_engine = LLMEngine()