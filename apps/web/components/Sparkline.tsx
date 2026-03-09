'use client';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export default function Sparkline({ 
  data, 
  width = 120, 
  height = 32, 
  color = '#6366f1',
  className = ''
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-xs text-[#6b6b80]">No data</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Normalize data points to SVG coordinates
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  // Create area fill path
  const areaPath = `M0,${height} L${points.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return i === 0 ? `${x},${y}` : ` L${x},${y}`;
  }).join('')} L${width},${height} Z`;

  const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Area fill */}
        <path
          d={`M0,${height} ${data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * (height - 4) - 2;
            return `L${x},${y}`;
          }).join(' ')} L${width},${height} Z`}
          fill={`${color}20`}
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
            r="3"
            fill={color}
          />
        )}
      </svg>
      <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[10px] text-[#6b6b80]">
        <span>{min}ms</span>
        <span>avg {avg}ms</span>
        <span>{max}ms</span>
      </div>
    </div>
  );
}
