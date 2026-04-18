import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function HealthScoreCircle({ score = 75, size = 160 }) {
  const getColor = (s) => {
    if (s >= 70) return "#059669";
    if (s >= 40) return "#D97706";
    return "#DC2626";
  };

  const color = getColor(score);
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="78%" outerRadius="96%"
          startAngle={90} endAngle={-270}
          data={data}
          barSize={10}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: "#F1F3F5" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color }}>{score}</span>
        <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Health Score</span>
      </div>
    </div>
  );
}
