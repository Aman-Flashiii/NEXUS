import { z } from 'zod';

export const studentInputSchema = z.object({
  // Section 1: Basic Details
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  program: z.string().min(2, 'Program is required').max(100),

  // Section 2: Academic & Attendance Trends
  gpa_trend: z
    .string()
    .regex(/^[\d.,\s]+$/, 'Must contain only numbers and commas')
    .refine((val) => {
      const arr = val.split(',').map((v) => parseFloat(v.trim()));
      return arr.length > 0 && arr.every((n) => !isNaN(n) && n >= 0 && n <= 10.0);
    }, 'All GPA values must be between 0.0 and 10.0'),
  
  attendance_trend: z
    .string()
    .regex(/^[\d.,\s]+$/, 'Must contain only numbers and commas')
    .refine((val) => {
      const arr = val.split(',').map((v) => parseFloat(v.trim()));
      return arr.length > 0 && arr.every((n) => !isNaN(n) && n >= 0 && n <= 100);
    }, 'All attendance values must be between 0 and 100'),

  // Section 3: LMS & Engagement
  lms_login_freq: z.number().min(0).max(50, 'Max 50 logins/week'),
  assignment_completion: z.number().min(0).max(100),
  engagement_score: z.number().min(0).max(100),

  // Section 4: Placement Readiness
  aptitude_score: z.number().min(0).max(100),
  coding_score: z.number().min(0).max(100),
  mock_interview_score: z.number().min(0).max(100),

  // Section 5: Skills
  technical_skill_score: z.number().min(0).max(100),
  soft_skill_score: z.number().min(0).max(100),

  // Section 6: Feedback (0-100 scales)
  teaching_satisfaction: z.number().min(0).max(100),
  content_satisfaction: z.number().min(0).max(100),
  infrastructure_satisfaction: z.number().min(0).max(100),
  support_services_satisfaction: z.number().min(0).max(100),
  classroom_participation: z.number().min(0).max(100),
  attitude_discipline: z.number().min(0).max(100),
  improvement_effort: z.number().min(0).max(100),
  communication_teamwork: z.number().min(0).max(100),
});

export type StudentInputFormData = z.infer<typeof studentInputSchema>;

export function calculateAggregatedFeedback(data: StudentInputFormData): number {
  const feedbackFields = [
    data.teaching_satisfaction,
    data.content_satisfaction,
    data.infrastructure_satisfaction,
    data.support_services_satisfaction,
    data.classroom_participation,
    data.attitude_discipline,
    data.improvement_effort,
    data.communication_teamwork,
  ];
  
  const sum = feedbackFields.reduce((acc, val) => acc + val, 0);
  return Number((sum / feedbackFields.length).toFixed(1));
}
