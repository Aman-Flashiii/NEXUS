'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

import {
  getStudents,
  getInterventions,
  getSuccessScore,
  getExplainableScore,
  getChangePoint,
  getRootCause,
  runSimulation,
} from '@/lib/api';
import type {
  Student,
  Intervention,
  SuccessScoreResponse,
  ExplainableScoreResponse,
  ChangePointResult,
  RootCauseFactor,
  SimulationResponse,
} from '@/lib/types';
import { getRiskLevel, getRiskColor, formatNumber, cn } from '@/lib/utils';
import {
  MetricCard,
  CardShell,
  CardHeader,
  StatusBadge,
  LoadingSpinner,
} from '@/components/ui/shared';
import { InView } from '@/components/core/in-view';
import { TransitionPanel } from '@/components/core/transition-panel';

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [successScore, setSuccessScore] = useState<SuccessScoreResponse | null>(null);
  const [explainable, setExplainable] = useState<ExplainableScoreResponse | null>(null);
  const [changePoint, setChangePoint] = useState<ChangePointResult | null>(null);
  const [rootCauses, setRootCauses] = useState<RootCauseFactor[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation state
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0 = form, 1 = results

  useEffect(() => {
    async function load() {
      try {
        const [allStudents, allInterventions, score, explain, cp, rc] =
          await Promise.all([
            getStudents(),
            getInterventions(),
            getSuccessScore(studentId),
            getExplainableScore(studentId),
            getChangePoint(studentId),
            getRootCause(studentId),
          ]);

        const found = allStudents.find((s) => s.id === studentId);
        setStudent(found || null);
        setInterventions(allInterventions);
        setSuccessScore(score);
        setExplainable(explain);
        setChangePoint(cp);
        setRootCauses(rc);
      } catch (err) {
        console.error('Failed to load student:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  const handleSimulate = async () => {
    if (selectedInterventions.length === 0) return;
    setSimLoading(true);
    try {
      const result = await runSimulation({
        student_id: studentId,
        selected_intervention_ids: selectedInterventions,
      });
      setSimResult(result);
      setSimStep(1);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const toggleIntervention = (id: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (!student) {
    return (
      <div className="py-20 text-center text-neutral-500">
        Student not found.{' '}
        <Link href="/students" className="underline hover:text-neutral-300">
          Back to roster
        </Link>
      </div>
    );
  }

  const riskLevel = getRiskLevel(student.current_risk);
  const riskColors = getRiskColor(riskLevel);

  // Radar chart data from success score breakdown
  const radarData = successScore
    ? [
        { metric: 'Academic', value: successScore.breakdown.academic },
        { metric: 'Attendance', value: successScore.breakdown.attendance },
        { metric: 'LMS', value: successScore.breakdown.lms_engagement },
        {
          metric: 'Engagement',
          value: successScore.breakdown.extracurricular_engagement,
        },
        {
          metric: 'Placement',
          value: successScore.breakdown.placement_readiness,
        },
        { metric: 'Skills', value: successScore.breakdown.skills },
        { metric: 'Feedback', value: successScore.breakdown.feedback },
      ]
    : [];

  // Attendance trend chart
  const attendanceData = student.attendance_trend.map((val, i) => ({
    week: `W${i + 1}`,
    attendance: val,
  }));

  // GPA trend chart
  const gpaData = student.gpa_trend.map((val, i) => ({
    semester: `S${i + 1}`,
    gpa: val,
  }));

  return (
    <div>
      {/* Back + Header */}
      <InView>
        <Link
          href="/students"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Roster
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
              {student.name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
              <span className="font-mono text-xs">{student.id}</span>
              <span>{student.program}</span>
            </div>
          </div>
          <StatusBadge level={riskLevel} size="md" />
        </div>
      </InView>

      {/* Overview KPIs */}
      <InView transition={{ duration: 0.25, delay: 0.04 }}>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard
            label="Risk Score"
            value={`${formatNumber(student.current_risk)}%`}
            trend={student.current_risk > 60 ? 'down' : 'up'}
            trendValue={riskLevel}
          />
          <MetricCard
            label="Success Score"
            value={
              successScore
                ? formatNumber(successScore.breakdown.total_success_score)
                : 'N/A'
            }
            subtext="Composite weighted index"
          />
          <MetricCard
            label="Momentum"
            value={`${student.momentum > 0 ? '+' : ''}${formatNumber(student.momentum)}`}
            trend={student.momentum > 0 ? 'up' : 'down'}
            trendValue={student.momentum > 0 ? 'Improving' : 'Declining'}
          />
          <MetricCard
            label="Latest GPA"
            value={formatNumber(student.gpa_trend[student.gpa_trend.length - 1])}
          />
          <MetricCard
            label="Attendance (Latest)"
            value={`${formatNumber(
              student.attendance_trend[student.attendance_trend.length - 1],
              0
            )}%`}
          />
        </div>
      </InView>

      {/* Radar + Trends */}
      <InView transition={{ duration: 0.25, delay: 0.08 }}>
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Radar */}
          <CardShell>
            <CardHeader
              title="Success Score Breakdown"
              subtitle="Multi-dimensional performance profile"
            />
            <div className="px-4 py-4">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: '#52525b', fontSize: 9 }}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#a1a1aa"
                    fill="#a1a1aa"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          {/* GPA Trend */}
          <CardShell>
            <CardHeader title="GPA Trajectory" subtitle="Semester progression" />
            <div className="px-4 py-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={gpaData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="semester"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="#a1a1aa"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#a1a1aa' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          {/* Attendance Trend */}
          <CardShell>
            <CardHeader
              title="Attendance Trend"
              subtitle="Weekly attendance percentage"
            />
            <div className="px-4 py-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#71717a"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#71717a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardShell>
        </div>
      </InView>

      {/* Explainable Score + Change Point + Root Causes */}
      <InView transition={{ duration: 0.25, delay: 0.12 }}>
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Explainable Score */}
          <CardShell>
            <CardHeader
              title="Score Explanation"
              subtitle="Key factors driving the success score"
            />
            <div className="p-5 space-y-4">
              {explainable && (
                <>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Positive Drivers
                    </p>
                    <ul className="space-y-1">
                      {explainable.top_positive_drivers.map((d, i) => (
                        <li
                          key={i}
                          className="text-[12px] leading-relaxed text-neutral-400"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-rose-400">
                      <XCircle className="h-3 w-3" />
                      Negative Drivers
                    </p>
                    <ul className="space-y-1">
                      {explainable.top_negative_drivers.map((d, i) => (
                        <li
                          key={i}
                          className="text-[12px] leading-relaxed text-neutral-400"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </CardShell>

          {/* Change Point Detection */}
          <CardShell>
            <CardHeader
              title="Change Point Detection"
              subtitle="CUSUM anomaly analysis on attendance"
            />
            <div className="p-5">
              {changePoint && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {changePoint.detected ? (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        changePoint.detected
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      )}
                    >
                      {changePoint.detected
                        ? 'Anomaly Detected'
                        : 'No Anomaly'}
                    </span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-neutral-400">
                    {changePoint.message}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                        Method
                      </p>
                      <p className="font-mono text-xs text-neutral-300">
                        {changePoint.method}
                      </p>
                    </div>
                    {changePoint.severity && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                          Severity
                        </p>
                        <StatusBadge
                          level={
                            changePoint.severity === 'High' ? 'High' : 'Medium'
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardShell>

          {/* Root Cause Analysis */}
          <CardShell>
            <CardHeader
              title="Root Cause Analysis"
              subtitle="Contributing factors ranked by impact"
            />
            <div className="p-5">
              {rootCauses.length === 0 ? (
                <p className="text-sm text-neutral-600">
                  No significant risk factors identified.
                </p>
              ) : (
                <div className="space-y-3">
                  {rootCauses.map((rc, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-300">{rc.factor}</p>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            rc.trend === 'declining'
                              ? 'text-rose-400'
                              : 'text-neutral-500'
                          )}
                        >
                          {rc.trend}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-neutral-500"
                            style={{
                              width: `${Math.min(rc.contribution, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-neutral-500">
                          {formatNumber(rc.contribution)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardShell>
        </div>
      </InView>

      {/* Intervention Simulator */}
      <InView transition={{ duration: 0.25, delay: 0.16 }}>
        <CardShell className="mb-6">
          <CardHeader
            title="Intervention Simulator"
            subtitle="Digital twin counterfactual analysis: select interventions and simulate projected outcomes"
            action={
              simStep === 1 ? (
                <button
                  onClick={() => {
                    setSimStep(0);
                    setSimResult(null);
                  }}
                  className="text-[11px] font-medium text-neutral-500 hover:text-neutral-300"
                >
                  Reset
                </button>
              ) : null
            }
          />
          <div className="p-5">
            <TransitionPanel
              activeIndex={simStep}
              direction={simStep === 0 ? 1 : -1}
            >
              {/* Step 0: Intervention Selection */}
              <div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {interventions.map((iv) => {
                    const selected = selectedInterventions.includes(iv.id);
                    return (
                      <button
                        key={iv.id}
                        onClick={() => toggleIntervention(iv.id)}
                        className={cn(
                          'rounded-lg border p-3.5 text-left transition-all',
                          selected
                            ? 'border-neutral-600 bg-neutral-800/40'
                            : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-neutral-200">
                            {iv.name}
                          </p>
                          <div
                            className={cn(
                              'h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5',
                              selected
                                ? 'border-neutral-400 bg-neutral-700'
                                : 'border-neutral-700'
                            )}
                          >
                            {selected && (
                              <CheckCircle className="h-3 w-3 text-neutral-200" />
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500">
                          <span>Impact: {iv.impact_score}</span>
                          <span>Cost: ₹{iv.cost.toLocaleString()}</span>
                          <span className="capitalize">{iv.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleSimulate}
                    disabled={
                      selectedInterventions.length === 0 || simLoading
                    }
                    className={cn(
                      'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      selectedInterventions.length > 0
                        ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                        : 'cursor-not-allowed bg-neutral-800 text-neutral-600'
                    )}
                  >
                    {simLoading ? 'Running Simulation...' : 'Run Simulation'}
                  </button>
                  <span className="text-xs text-neutral-600">
                    {selectedInterventions.length} intervention(s) selected
                  </span>
                </div>
              </div>

              {/* Step 1: Results */}
              <div>
                {simResult && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                          Baseline Success
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-neutral-300">
                          {formatNumber(simResult.baseline_success)}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-500/70">
                          Simulated Success
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-emerald-400">
                          {formatNumber(simResult.simulated_success)}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                          Delta Impact
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-emerald-400">
                          +{formatNumber(simResult.delta_impact)}%
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                        Confidence Interval
                      </p>
                      <p className="mt-1 font-mono text-sm text-neutral-400">
                        [{formatNumber(simResult.confidence_interval[0])}%,{' '}
                        {formatNumber(simResult.confidence_interval[1])}%]
                      </p>
                    </div>
                    <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/30 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                        Reasoning
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-neutral-400">
                        {simResult.reasoning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TransitionPanel>
          </div>
        </CardShell>
      </InView>
    </div>
  );
}
