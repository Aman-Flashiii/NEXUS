import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle2, AlertCircle, BarChart3, Activity, BookOpen, Target, MessageSquare } from 'lucide-react';
import { AnimatedBackground, AnimatedBackgroundItem } from '@/components/core/animated-background';
import { BorderTrail } from '@/components/core/border-trail';
import { TransitionPanel } from '@/components/core/transition-panel';
import { Sparkline } from '@/components/ui/sparkline';
import { studentInputSchema, StudentInputFormData, calculateAggregatedFeedback } from '@/lib/validations/student-form';
import type { Student } from '@/lib/types';
import { createStudent } from '@/lib/api';
import { cn, getRiskLevel, getRiskColor } from '@/lib/utils';

const SECTIONS = ['Basic Info', 'Trends', 'Engagement', 'Skills', 'Feedback'] as const;

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: (student: Student) => void;
}

export function AddStudentModal({ onClose, onSuccess }: AddStudentModalProps) {
  const [activeSection, setActiveSection] = useState<typeof SECTIONS[number]>('Basic Info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<Student | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentInputFormData>({
    resolver: zodResolver(studentInputSchema),
    defaultValues: {
      name: '',
      program: '',
      gpa_trend: '7.0, 7.5, 7.8',
      attendance_trend: '80, 85, 90',
      lms_login_freq: 5,
      assignment_completion: 80,
      engagement_score: 50,
      aptitude_score: 70,
      coding_score: 70,
      mock_interview_score: 70,
      technical_skill_score: 70,
      soft_skill_score: 70,
      teaching_satisfaction: 80,
      content_satisfaction: 80,
      infrastructure_satisfaction: 80,
      support_services_satisfaction: 80,
      classroom_participation: 80,
      attitude_discipline: 80,
      improvement_effort: 80,
      communication_teamwork: 80,
    },
  });

  const watchGpa = watch('gpa_trend');
  const watchAtt = watch('attendance_trend');

  const gpaArray = watchGpa?.split(',').map((v) => parseFloat(v.trim())).filter((n) => !isNaN(n)) || [];
  const attArray = watchAtt?.split(',').map((v) => parseFloat(v.trim())).filter((n) => !isNaN(n)) || [];

  const onSubmit = async (data: StudentInputFormData) => {
    setIsSubmitting(true);
    try {
      const gpaTrend = data.gpa_trend.split(',').map((v) => parseFloat(v.trim()) || 0);
      const attTrend = data.attendance_trend.split(',').map((v) => parseFloat(v.trim()) || 0);

      const fullStudent: Student = {
        id: `S${Math.floor(Math.random() * 9000) + 1000}`, // Temp ID, backend handles actual if configured
        name: data.name,
        program: data.program,
        current_risk: 0, // AI computed
        momentum: 0, // AI computed
        attendance_trend: attTrend,
        gpa_trend: gpaTrend,
        lms_login_freq: data.lms_login_freq,
        assignment_completion: data.assignment_completion,
        engagement_score: data.engagement_score,
        aptitude_score: data.aptitude_score,
        coding_score: data.coding_score,
        mock_interview_score: data.mock_interview_score,
        technical_skill_score: data.technical_skill_score,
        soft_skill_score: data.soft_skill_score,
        feedback_score: calculateAggregatedFeedback(data),
        skill_graph: {},
      };

      const saved = await createStudent(fullStudent);
      setSuccessData(saved);
      // Wait 3 seconds to show the transition panel risk evaluation before closing
      setTimeout(() => {
        onSuccess(saved);
        onClose();
      }, 3500);
    } catch (err) {
      console.error('Failed to add student:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Student Digital Twin Initialization
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Enter historical and current metrics to auto-derive predictive risk analytics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <TransitionPanel
            activeIndex={successData ? 1 : 0}
          >
            {/* Form State */}
            <div>
              {/* Tabs */}
              <div className="mb-8">
                <AnimatedBackground
                  activeValue={activeSection}
                  className="flex items-center rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-1 w-full overflow-x-auto"
                  backgroundClassName="bg-neutral-800/80"
                >
                  {SECTIONS.map((f) => (
                    <AnimatedBackgroundItem key={f} value={f}>
                      <button
                        type="button"
                        onClick={() => setActiveSection(f)}
                        className={cn(
                          'rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                          activeSection === f ? 'text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'
                        )}
                      >
                        {f}
                      </button>
                    </AnimatedBackgroundItem>
                  ))}
                </AnimatedBackground>
              </div>

              <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <TransitionPanel
                  activeIndex={SECTIONS.indexOf(activeSection)}
                >
                  {/* Basic Info */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-300">Full Name</label>
                      <input
                        {...register('name')}
                        className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3.5 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                        placeholder="e.g. Karan Mehta"
                      />
                      {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-300">Program</label>
                      <input
                        {...register('program')}
                        className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3.5 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                        placeholder="e.g. B.Tech CSE"
                      />
                      {errors.program && <p className="mt-1 text-xs text-rose-400">{errors.program.message}</p>}
                    </div>
                  </div>

                  {/* Trends */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-neutral-300">
                          Semester-wise GPA Trend <span className="text-neutral-500 font-normal ml-1">(comma-separated)</span>
                        </label>
                        <Sparkline data={gpaArray} color={gpaArray.length > 1 && gpaArray[gpaArray.length - 1] < gpaArray[0] ? '#fb7185' : '#34d399'} />
                      </div>
                      <input
                        {...register('gpa_trend')}
                        className="w-full font-mono rounded-md border border-neutral-800 bg-neutral-900/50 px-3.5 py-2 text-sm text-neutral-200 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                        placeholder="7.0, 7.1, 6.8, 6.5"
                      />
                      {errors.gpa_trend && <p className="mt-1 text-xs text-rose-400">{errors.gpa_trend.message}</p>}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-neutral-300">
                          Weekly Attendance % (Last 8 weeks) <span className="text-neutral-500 font-normal ml-1">(comma-separated)</span>
                        </label>
                        <Sparkline data={attArray} color={attArray.length > 1 && attArray[attArray.length - 1] < attArray[0] ? '#fb7185' : '#34d399'} />
                      </div>
                      <input
                        {...register('attendance_trend')}
                        className="w-full font-mono rounded-md border border-neutral-800 bg-neutral-900/50 px-3.5 py-2 text-sm text-neutral-200 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                        placeholder="90, 89, 88, 85, 82"
                      />
                      {errors.attendance_trend && <p className="mt-1 text-xs text-rose-400">{errors.attendance_trend.message}</p>}
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="grid gap-5 md:grid-cols-3">
                    <FieldGroup label="LMS Logins/Week" id="lms_login_freq" register={register} errors={errors} type="number" />
                    <FieldGroup label="Assignment Completion %" id="assignment_completion" register={register} errors={errors} type="number" />
                    <FieldGroup label="Engagement Score" id="engagement_score" register={register} errors={errors} type="number" />
                  </div>

                  {/* Skills */}
                  <div className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-3">
                      <FieldGroup label="Aptitude Test Score" id="aptitude_score" register={register} errors={errors} type="number" />
                      <FieldGroup label="Coding Test Score" id="coding_score" register={register} errors={errors} type="number" />
                      <FieldGroup label="Mock Interview Score" id="mock_interview_score" register={register} errors={errors} type="number" />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <FieldGroup label="Technical Skill Score" id="technical_skill_score" register={register} errors={errors} type="number" />
                      <FieldGroup label="Soft Skill Score" id="soft_skill_score" register={register} errors={errors} type="number" />
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <FieldGroup label="Teaching" id="teaching_satisfaction" register={register} errors={errors} type="number" />
                    <FieldGroup label="Content" id="content_satisfaction" register={register} errors={errors} type="number" />
                    <FieldGroup label="Infrastructure" id="infrastructure_satisfaction" register={register} errors={errors} type="number" />
                    <FieldGroup label="Support Services" id="support_services_satisfaction" register={register} errors={errors} type="number" />
                    <FieldGroup label="Class Participation" id="classroom_participation" register={register} errors={errors} type="number" />
                    <FieldGroup label="Attitude & Discipline" id="attitude_discipline" register={register} errors={errors} type="number" />
                    <FieldGroup label="Improvement/Effort" id="improvement_effort" register={register} errors={errors} type="number" />
                    <FieldGroup label="Teamwork" id="communication_teamwork" register={register} errors={errors} type="number" />
                  </div>
                </TransitionPanel>
              </form>
            </div>

            {/* Success / Calculation State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {successData && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="relative">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500 relative z-10" />
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-neutral-100">Digital Twin Initialized</h3>
                    <p className="text-neutral-400">AI prediction engine has processed the historical vectors.</p>
                  </div>

                  <div className="mt-4 p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 w-full max-w-sm flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Computed Risk Score</p>
                      <p className="text-3xl font-mono font-medium text-neutral-200">{successData.current_risk.toFixed(1)}%</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5",
                      getRiskColor(getRiskLevel(successData.current_risk))
                    )}>
                      {getRiskLevel(successData.current_risk) === 'High' ? <AlertCircle className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                      {getRiskLevel(successData.current_risk)} Risk
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TransitionPanel>
        </div>

        {/* Footer Actions */}
        {!successData && (
          <div className="border-t border-neutral-800/80 p-6 shrink-0 bg-neutral-950 flex items-center justify-between rounded-b-xl">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const idx = SECTIONS.indexOf(activeSection);
                  if (idx > 0) setActiveSection(SECTIONS[idx - 1]);
                }}
                disabled={activeSection === SECTIONS[0]}
                className="px-4 py-2 rounded-md border border-neutral-800 text-sm font-medium text-neutral-300 disabled:opacity-50 hover:bg-neutral-900 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = SECTIONS.indexOf(activeSection);
                  if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1]);
                }}
                disabled={activeSection === SECTIONS[SECTIONS.length - 1]}
                className="px-4 py-2 rounded-md border border-neutral-800 text-sm font-medium text-neutral-300 disabled:opacity-50 hover:bg-neutral-900 transition-colors"
              >
                Next
              </button>
            </div>

            <div className="relative inline-flex group">
              <BorderTrail active={isSubmitting} className="rounded-md">
                <button
                  type="submit"
                  form="student-form"
                  disabled={isSubmitting}
                  className="relative px-5 py-2 rounded-md bg-neutral-100 text-neutral-950 text-sm font-medium hover:bg-neutral-300 transition-colors disabled:opacity-80 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="h-4 w-4 animate-pulse" />
                      Synthesizing...
                    </>
                  ) : (
                    'Generate Analytics & Prediction'
                  )}
                </button>
              </BorderTrail>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for simple number inputs
function FieldGroup({ label, id, register, errors, type = 'text' }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-400">{label}</label>
      <input
        type={type}
        step={type === 'number' ? 'any' : undefined}
        {...register(id, { valueAsNumber: type === 'number' })}
        className={cn(
          "w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1",
          errors[id] ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20" : "border-neutral-800 focus:border-neutral-700 focus:ring-neutral-700",
          type === 'number' && "font-mono"
        )}
      />
      {errors[id] && <p className="mt-1 text-[10px] text-rose-400">{errors[id].message}</p>}
    </div>
  );
}
