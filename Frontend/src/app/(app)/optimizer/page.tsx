'use client';

import { useState } from 'react';
import {
  DollarSign,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

import { runOptimization } from '@/lib/api';
import type { OptimizationResponse } from '@/lib/types';
import { formatNumber, formatCurrency, cn } from '@/lib/utils';
import {
  CardShell,
  CardHeader,
  MetricCard,
  LoadingSpinner,
} from '@/components/ui/shared';
import { InView } from '@/components/core/in-view';
import { TransitionPanel } from '@/components/core/transition-panel';
import { BorderTrail } from '@/components/core/border-trail';

export default function OptimizerPage() {
  const [budget, setBudget] = useState(10000);
  const [maxMentors, setMaxMentors] = useState(5);
  const [maxTutors, setMaxTutors] = useState(5);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0 = form, 1 = processing, 2 = results

  const handleOptimize = async () => {
    setLoading(true);
    setStep(1);
    try {
      const res = await runOptimization({
        budget,
        max_mentors: maxMentors,
        max_tutors: maxTutors,
      });
      setResult(res);
      // Brief delay to show the processing state
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Optimization failed:', err);
      setStep(0);
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setResult(null);
  };

  return (
    <div>
      <InView>
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
            Resource Optimizer
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Constraint-based allocation engine for intervention budgets and staffing.
            Powered by integer linear programming (PuLP/HiGHS).
          </p>
        </div>
      </InView>

      <InView transition={{ duration: 0.25, delay: 0.04 }}>
        <TransitionPanel activeIndex={step} direction={1}>
          {/* Step 0: Configuration Form */}
          <CardShell>
            <CardHeader
              title="Optimization Parameters"
              subtitle="Define budget constraints and staff capacity for the allocation solver"
            />
            <div className="p-5 space-y-5">
              {/* Budget */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  Total Budget (INR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    min={0}
                    step={500}
                    className="w-full max-w-xs rounded-md border border-neutral-800/80 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-700 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-neutral-600">
                  Maximum amount available for all student interventions.
                </p>
              </div>

              {/* Staff */}
              <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Max Mentors
                  </label>
                  <input
                    type="number"
                    value={maxMentors}
                    onChange={(e) => setMaxMentors(Number(e.target.value))}
                    min={0}
                    max={50}
                    className="w-full rounded-md border border-neutral-800/80 bg-neutral-900/60 px-3 py-2.5 text-sm text-neutral-200 focus:border-neutral-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Max Tutors
                  </label>
                  <input
                    type="number"
                    value={maxTutors}
                    onChange={(e) => setMaxTutors(Number(e.target.value))}
                    min={0}
                    max={50}
                    className="w-full rounded-md border border-neutral-800/80 bg-neutral-900/60 px-3 py-2.5 text-sm text-neutral-200 focus:border-neutral-700 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleOptimize}
                className="mt-2 flex items-center gap-2 rounded-md bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
              >
                Run Optimization
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardShell>

          {/* Step 1: Processing */}
          <BorderTrail
            active={loading}
            color="rgba(161,161,170,0.4)"
            duration={3}
            className="rounded-lg"
          >
            <CardShell>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
                <p className="text-sm font-medium text-neutral-300">
                  Running optimization solver...
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Solving allocation constraints with PuLP/HiGHS engine.
                </p>
              </div>
            </CardShell>
          </BorderTrail>

          {/* Step 2: Results */}
          <div>
            {result && (
              <div className="space-y-4">
                {/* Summary KPIs */}
                <div className="grid gap-3 sm:grid-cols-4">
                  <MetricCard
                    label="Status"
                    value={result.status}
                    subtext={
                      result.status === 'Optimal'
                        ? 'Feasible solution found'
                        : 'No feasible solution'
                    }
                  />
                  <MetricCard
                    label="Total Allocations"
                    value={result.total_allocations}
                    subtext="Student-intervention pairs"
                  />
                  <MetricCard
                    label="Total Cost"
                    value={formatCurrency(result.total_cost)}
                    subtext={`of ${formatCurrency(budget)} budget`}
                  />
                  <MetricCard
                    label="Expected Impact"
                    value={formatNumber(result.expected_impact)}
                    subtext="Cumulative impact score"
                  />
                </div>

                {/* Allocations Table */}
                <CardShell>
                  <CardHeader
                    title="Allocation Breakdown"
                    subtitle="Optimized student-intervention assignments ranked by priority"
                    action={
                      <button
                        onClick={reset}
                        className="text-[11px] font-medium text-neutral-500 hover:text-neutral-300"
                      >
                        Reconfigure
                      </button>
                    }
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-neutral-800/80">
                          <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            Student
                          </th>
                          <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            Intervention
                          </th>
                          <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            Cost
                          </th>
                          <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                            Priority Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/40">
                        {result.allocations.map((a, i) => (
                          <tr
                            key={`${a.student_id}-${a.intervention_name}-${i}`}
                            className="transition-colors hover:bg-neutral-800/15"
                          >
                            <td className="px-5 py-3">
                              <p className="text-sm text-neutral-200">
                                {a.student_name}
                              </p>
                              <p className="font-mono text-[11px] text-neutral-600">
                                {a.student_id}
                              </p>
                            </td>
                            <td className="px-5 py-3 text-sm text-neutral-400">
                              {a.intervention_name}
                            </td>
                            <td className="px-5 py-3 font-mono text-sm text-neutral-300">
                              {formatCurrency(a.cost)}
                            </td>
                            <td className="px-5 py-3 font-mono text-sm text-neutral-300">
                              {formatNumber(a.priority_score)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.allocations.length === 0 && (
                    <div className="py-12 text-center text-sm text-neutral-600">
                      No allocations could be made within the given constraints.
                    </div>
                  )}
                </CardShell>
              </div>
            )}
          </div>
        </TransitionPanel>
      </InView>
    </div>
  );
}
