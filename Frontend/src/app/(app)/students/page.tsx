'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronRight,
  ArrowUpDown,
  Plus,
  Trash2,
} from 'lucide-react';

import { getStudents, createStudent, deleteStudent } from '@/lib/api';
import type { Student } from '@/lib/types';
import { getRiskLevel, getRiskColor, formatNumber, cn } from '@/lib/utils';
import { CardShell, CardHeader, StatusBadge, LoadingSpinner } from '@/components/ui/shared';
import { InView } from '@/components/core/in-view';
import { AnimatedBackground, AnimatedBackgroundItem } from '@/components/core/animated-background';
import { AddStudentModal } from '@/components/features/AddStudentModal';

const riskFilters = ['All', 'High', 'Medium', 'Low'] as const;
type RiskFilter = (typeof riskFilters)[number];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');
  const [programFilter, setProgramFilter] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const programs = ['All', 'B.Tech CSE', 'B.Tech Mech', 'B.Tech ECE', ...Array.from(new Set(students.map((s) => s.program)))];



  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk =
      riskFilter === 'All' || getRiskLevel(s.current_risk) === riskFilter;
    const matchesProgram =
      programFilter === 'All' || s.program === programFilter;
    return matchesSearch && matchesRisk && matchesProgram;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <InView>
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
            Student Roster
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Complete directory of enrolled students with risk assessment and academic indicators.
          </p>
        </div>
      </InView>

      {/* Filters */}
      <InView transition={{ duration: 0.25, delay: 0.04 }}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-neutral-800/80 bg-neutral-900/60 py-2 pl-9 pr-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-700 focus:outline-none"
            />
          </div>

          {/* Risk Filter Tabs */}
          <AnimatedBackground
            activeValue={riskFilter}
            className="flex items-center rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-0.5"
            backgroundClassName="bg-neutral-800/80"
          >
            {riskFilters.map((f) => (
              <AnimatedBackgroundItem key={f} value={f}>
                <button
                  onClick={() => setRiskFilter(f)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    riskFilter === f
                      ? 'text-neutral-100'
                      : 'text-neutral-500 hover:text-neutral-300'
                  )}
                >
                  {f === 'All' ? 'All Levels' : `${f} Risk`}
                </button>
              </AnimatedBackgroundItem>
            ))}
          </AnimatedBackground>

          {/* Program Filter */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-md border border-neutral-800/80 bg-neutral-900/60 px-3 py-2 text-xs font-medium text-neutral-300 focus:border-neutral-700 focus:outline-none"
          >
            {programs.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Programs' : p}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Student
          </button>
        </div>
      </InView>

      {/* Table */}
      <InView transition={{ duration: 0.25, delay: 0.08 }}>
        <CardShell>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800/80">
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Student
                  </th>
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Program
                  </th>
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Risk Score
                  </th>
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    GPA (Latest)
                  </th>
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Attendance
                  </th>
                  <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Momentum
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {filtered.map((s) => {
                  const level = getRiskLevel(s.current_risk);
                  const latestGPA = s.gpa_trend[s.gpa_trend.length - 1];
                  const latestAtt =
                    s.attendance_trend[s.attendance_trend.length - 1];
                  return (
                    <tr
                      key={s.id}
                      className="group transition-colors hover:bg-neutral-800/15"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-neutral-200">
                            {s.name}
                          </p>
                          <p className="font-mono text-[11px] text-neutral-600">
                            {s.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-neutral-400">
                        {s.program}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm text-neutral-200">
                          {formatNumber(s.current_risk)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge level={level} />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm text-neutral-300">
                        {formatNumber(latestGPA)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm text-neutral-300">
                        {formatNumber(latestAtt, 0)}%
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'font-mono text-sm',
                            s.momentum > 0
                              ? 'text-emerald-400'
                              : s.momentum < -10
                                ? 'text-rose-400'
                                : 'text-amber-400'
                          )}
                        >
                          {s.momentum > 0 ? '+' : ''}
                          {formatNumber(s.momentum)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/students/${s.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-800/60 hover:text-neutral-300"
                            title="View Details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-600">
              No students match the current filters.
            </div>
          )}
        </CardShell>
      </InView>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <AddStudentModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(newStud) => setStudents((prev) => [...prev, newStud])}
        />
      )}
    </div>
  );
}
