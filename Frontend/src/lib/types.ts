// ---------------------------------------------------------------
// Type definitions derived from FastAPI Pydantic models (models.py)
// ---------------------------------------------------------------

// --- Core Data Models ---
export interface SkillNode {
  name: string;
  mastery: number;
  prerequisites: string[];
}

export interface Student {
  id: string;
  name: string;
  program: string;
  current_risk: number;
  momentum: number;
  attendance_trend: number[];
  gpa_trend: number[];
  lms_login_freq: number;
  assignment_completion: number;
  engagement_score: number;
  aptitude_score: number;
  coding_score: number;
  mock_interview_score: number;
  technical_skill_score: number;
  soft_skill_score: number;
  feedback_score: number;
  skill_graph: Record<string, SkillNode>;
}

export interface Intervention {
  id: string;
  name: string;
  cost: number;
  staff_required: string;
  impact_score: number;
  category: string;
}

// --- Analytics Models ---
export interface ChangePointResult {
  detected: boolean;
  method: string;
  severity?: string | null;
  message: string;
}

export interface RootCauseFactor {
  factor: string;
  contribution: number;
  trend: string;
}

// --- Success Score Models ---
export interface SuccessScoreBreakdown {
  academic: number;
  attendance: number;
  lms_engagement: number;
  extracurricular_engagement: number;
  placement_readiness: number;
  skills: number;
  feedback: number;
  total_success_score: number;
}

export interface SuccessScoreResponse {
  student_id: string;
  student_name: string;
  breakdown: SuccessScoreBreakdown;
  risk_flag: 'Low' | 'Medium' | 'High';
}

export interface StudentSegment {
  segment_name: string;
  description: string;
  student_ids: string[];
  recommended_action: string;
}

export interface SegmentationResponse {
  segments: StudentSegment[];
}

export interface ExplainableScoreResponse {
  student_id: string;
  total_success_score: number;
  risk_flag: 'Low' | 'Medium' | 'High';
  top_positive_drivers: string[];
  top_negative_drivers: string[];
}

// --- Simulation & Optimization Models ---
export interface SimulationRequest {
  student_id: string;
  selected_intervention_ids: string[];
}

export interface SimulationResponse {
  baseline_success: number;
  simulated_success: number;
  delta_impact: number;
  confidence_interval: [number, number];
  reasoning: string;
}

export interface OptimizationRequest {
  budget: number;
  max_mentors: number;
  max_tutors: number;
}

export interface AllocationItem {
  student_id: string;
  student_name: string;
  intervention_name: string;
  cost: number;
  priority_score: number;
}

export interface OptimizationResponse {
  status: string;
  total_allocations: number;
  total_cost: number;
  expected_impact: number;
  allocations: AllocationItem[];
}

export interface AIReportResponse {
  student_id: string;
  student_name: string;
  ai_generated_report: string;
}

// --- Knowledge Graph ---
export interface KnowledgeGraphResponse {
  student_id: string;
  bottlenecks: Array<{
    skill: string;
    mastery: number;
    blocking: string[];
  }>;
  full_graph: Record<string, SkillNode>;
}

// --- Health Check ---
export interface HealthResponse {
  status: string;
  engines: string[];
}
