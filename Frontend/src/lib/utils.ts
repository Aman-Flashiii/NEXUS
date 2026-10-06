import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function getRiskLevel(risk: number): 'High' | 'Medium' | 'Low' {
  if (risk >= 70) return 'High';
  if (risk >= 40) return 'Medium';
  return 'Low';
}

export function getRiskColor(level: 'High' | 'Medium' | 'Low' | string) {
  switch (level) {
    case 'High':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
      };
    case 'Medium':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'Low':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    default:
      return {
        bg: 'bg-neutral-500/10',
        text: 'text-neutral-400',
        border: 'border-neutral-500/20',
        dot: 'bg-neutral-400',
      };
  }
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}
