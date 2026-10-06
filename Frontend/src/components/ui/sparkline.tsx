import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = '#10b981', // Emerald 500
  width = 120,
  height = 30,
  strokeWidth = 2,
  className = '',
}: SparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Prevent division by zero

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - strokeWidth) - (strokeWidth / 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height, strokeWidth]);

  if (!points) {
    return (
      <div
        className={`flex items-center justify-center text-[10px] text-neutral-600 font-mono ${className}`}
        style={{ width, height }}
      >
        Needs data
      </div>
    );
  }

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
