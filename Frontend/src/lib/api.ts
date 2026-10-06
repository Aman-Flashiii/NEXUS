// ---------------------------------------------------------------
// API client service mapping to FastAPI endpoints (main.py)
// All endpoints match the backend contract exactly.
// ---------------------------------------------------------------

import type {
  Student,
  Intervention,
  ChangePointResult,
  RootCauseFactor,
  KnowledgeGraphResponse,
  SimulationRequest,
  SimulationResponse,
  OptimizationRequest,
  OptimizationResponse,
  AIReportResponse,
  SuccessScoreResponse,
  SegmentationResponse,
  ExplainableScoreResponse,
  HealthResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchJSON<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// ---- Students ----
export async function getStudents(): Promise<Student[]> {
  return fetchJSON<Student[]>('/api/students');
}

export async function createStudent(student: Student): Promise<Student> {
  return fetchJSON<Student>('/api/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
}

export async function deleteStudent(studentId: string): Promise<{ status: string }> {
  return fetchJSON<{ status: string }>(`/api/students/${encodeURIComponent(studentId)}`, {
    method: 'DELETE',
  });
}

// ---- Interventions ----
export async function getInterventions(): Promise<Intervention[]> {
  return fetchJSON<Intervention[]>('/api/interventions');
}

// ---- Success Score (KPMG) ----
export async function getSuccessScore(
  studentId: string
): Promise<SuccessScoreResponse> {
  return fetchJSON<SuccessScoreResponse>(
    `/api/success-score/${encodeURIComponent(studentId)}`
  );
}

// ---- Explainable Score (KPMG) ----
export async function getExplainableScore(
  studentId: string
): Promise<ExplainableScoreResponse> {
  return fetchJSON<ExplainableScoreResponse>(
    `/api/explainable-score/${encodeURIComponent(studentId)}`
  );
}

// ---- Segmentation (KPMG) ----
export async function getSegmentation(): Promise<SegmentationResponse> {
  return fetchJSON<SegmentationResponse>('/api/segmentation');
}

// ---- Change Point Detection ----
export async function getChangePoint(
  studentId: string
): Promise<ChangePointResult> {
  return fetchJSON<ChangePointResult>(
    `/api/change-point/${encodeURIComponent(studentId)}`
  );
}

// ---- Root Cause Analysis ----
export async function getRootCause(
  studentId: string
): Promise<RootCauseFactor[]> {
  return fetchJSON<RootCauseFactor[]>(
    `/api/root-cause/${encodeURIComponent(studentId)}`
  );
}

// ---- Knowledge Graph ----
export async function getKnowledgeGraph(
  studentId: string
): Promise<KnowledgeGraphResponse> {
  return fetchJSON<KnowledgeGraphResponse>(
    `/api/knowledge-graph/${encodeURIComponent(studentId)}`
  );
}

// ---- Simulation (Digital Twin) ----
export async function runSimulation(
  request: SimulationRequest
): Promise<SimulationResponse> {
  return fetchJSON<SimulationResponse>('/api/simulate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ---- Resource Optimization ----
export async function runOptimization(
  request: OptimizationRequest
): Promise<OptimizationResponse> {
  return fetchJSON<OptimizationResponse>('/api/optimize', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ---- AI Report ----
export async function getAIReport(
  studentId: string
): Promise<AIReportResponse> {
  return fetchJSON<AIReportResponse>(
    `/api/ai-report/${encodeURIComponent(studentId)}`
  );
}

// ---- Health Check ----
export async function getHealthStatus(): Promise<HealthResponse> {
  return fetchJSON<HealthResponse>('/health');
}
