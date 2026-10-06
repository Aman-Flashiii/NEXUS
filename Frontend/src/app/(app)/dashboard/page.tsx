'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import { getStudents, getSegmentation } from '@/lib/api';
import type { Student, StudentSegment } from '@/lib/types';
import { getRiskLevel, getRiskColor, formatNumber } from '@/lib/utils';
import { MetricCard, CardShell, CardHeader, StatusBadge, LoadingSpinner } from '@/components/ui/shared';
import { InView } from '@/components/core/in-view';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [segments, setSegments] = useState<StudentSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, seg] = await Promise.all([getStudents(), getSegmentation()]);
        setStudents(s);
        setSegments(seg.segments);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  // KPI computations
  const totalStudents = students.length;
  const highRisk = students.filter((s) => getRiskLevel(s.current_risk) === 'High').length;
  const mediumRisk = students.filter((s) => getRiskLevel(s.current_risk) === 'Medium').length;
  const lowRisk = students.filter((s) => getRiskLevel(s.current_risk) === 'Low').length;
  const avgRisk = students.reduce((sum, s) => sum + s.current_risk, 0) / totalStudents;
  const avgGPA =
    students.reduce(
      (sum, s) => sum + s.gpa_trend[s.gpa_trend.length - 1],
      0
    ) / totalStudents;
  const avgAttendance =
    students.reduce(
      (sum, s) =>
        sum + s.attendance_trend[s.attendance_trend.length - 1],
      0
    ) / totalStudents;

  // Chart: GPA trend data (all students, last 5 semesters)
  const maxLen = Math.max(...students.map((s) => s.gpa_trend.length));
  const gpaTrendData = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, number | string> = { semester: `Sem ${i + 1}` };
    students.forEach((s) => {
      if (i < s.gpa_trend.length) {
        point[s.name] = s.gpa_trend[i];
      }
    });
    return point;
  });

  // Chart: Risk distribution bar
  const riskDistribution = [
    { label: 'High Risk', count: highRisk, color: '#f43f5e' },
    { label: 'Medium Risk', count: mediumRisk, color: '#f59e0b' },
    { label: 'Low Risk', count: lowRisk, color: '#10b981' },
  ];

  // Priority students: sorted by risk descending
  const priorityStudents = [...students]
    .sort((a, b) => b.current_risk - a.current_risk)
    .slice(0, 5);

  const lineColors = ['#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

  return (
    <div>
      {/* Page Header */}
      <InView>
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
            Institutional Decision Support
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Student risk analytics and performance monitoring across all programs.
          </p>
        </div>
      </InView>

      {/* KPI Grid */}
      <InView transition={{ duration: 0.25, delay: 0.04 }}>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Total Students"
            value={totalStudents}
            subtext="Enrolled across all programs"
          />
          <MetricCard
            label="Average Risk Score"
            value={`${formatNumber(avgRisk)}%`}
            trend={avgRisk > 60 ? 'down' : 'up'}
            trendValue={avgRisk > 60 ? 'Elevated' : 'Stable'}
            subtext="Cohort-wide risk index"
          />
          <MetricCard
            label="Latest Avg GPA"
            value={formatNumber(avgGPA)}
            trend={avgGPA > 6.5 ? 'up' : 'down'}
            trendValue={avgGPA > 6.5 ? 'On Track' : 'Below Target'}
            subtext="Most recent semester"
          />
          <MetricCard
            label="Avg Attendance"
            value={`${formatNumber(avgAttendance, 0)}%`}
            trend={avgAttendance > 75 ? 'up' : 'down'}
            trendValue={avgAttendance > 75 ? 'Healthy' : 'Declining'}
            subtext="Latest recorded week"
          />
        </div>
      </InView>

      {/* Risk Summary Pills */}
      <InView transition={{ duration: 0.25, delay: 0.08 }}>
        <div className="mb-6 flex gap-3">
          {riskDistribution.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-2 rounded-lg border border-neutral-800/80 bg-neutral-900/60 px-4 py-2.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-xs text-neutral-400">{r.label}</span>
              <span className="font-semibold text-neutral-100">{r.count}</span>
            </div>
          ))}
        </div>
      </InView>

      {/* Main Analytics: 2/3 Chart + 1/3 Priority Table */}
      <InView transition={{ duration: 0.25, delay: 0.12 }}>
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* GPA Trend Chart */}
          <CardShell className="lg:col-span-2">
            <CardHeader
              title="GPA Trend Analysis"
              subtitle="Semester-over-semester GPA trajectories for all tracked students"
            />
            <div className="px-5 py-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={gpaTrendData}>
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
                    width={30}
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
                  {students.map((s, i) => (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.name}
                      stroke={lineColors[i % lineColors.length]}
                      strokeWidth={1.5}
                      dot={{ r: 2.5, fill: lineColors[i % lineColors.length] }}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          {/* Priority Risk Table */}
          <CardShell>
            <CardHeader
              title="Priority Watchlist"
              subtitle="Highest-risk students requiring intervention"
              action={
                <Link
                  href="/students"
                  className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              }
            />
            <div className="divide-y divide-neutral-800/60">
              {priorityStudents.map((s) => {
                const level = getRiskLevel(s.current_risk);
                return (
                  <Link
                    key={s.id}
                    href={`/students/${s.id}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-neutral-800/20"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-200">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        <span className="font-mono">{s.id}</span>
                        {' · '}
                        {s.program}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs text-neutral-400">
                        {formatNumber(s.current_risk)}%
                      </span>
                      <StatusBadge level={level} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardShell>
        </div>
      </InView>

      {/* Segments */}
      <InView transition={{ duration: 0.25, delay: 0.16 }}>
        <CardShell className="mb-6">
          <CardHeader
            title="Student Segmentation"
            subtitle="Behavioral clustering based on academic and placement indicators"
          />
          <div className="grid gap-px divide-neutral-800/60 sm:grid-cols-2 lg:grid-cols-4">
            {segments.map((seg) => (
              <div
                key={seg.segment_name}
                className="border-r border-b border-neutral-800/40 p-5 last:border-r-0"
              >
                <p className="text-sm font-semibold text-neutral-200">
                  {seg.segment_name}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {seg.description}
                </p>
                <p className="mt-3 text-lg font-semibold text-neutral-100">
                  {seg.student_ids.length}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                  students
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                  {seg.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </CardShell>
      </InView>

      {/* Risk Distribution Bar Chart */}
      <InView transition={{ duration: 0.25, delay: 0.2 }}>
        <CardShell>
          <CardHeader
            title="Risk Distribution"
            subtitle="Breakdown of students by risk classification"
          />
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskDistribution} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  width={20}
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardShell>
      </InView>
    </div>
  );
}
