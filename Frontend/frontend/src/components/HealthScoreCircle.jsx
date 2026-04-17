import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function HealthScoreCircle({ score = 75, size = 180 }) {
  const getColor = (s) => {
    if (s >= 70) return "#10B981";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const color = getColor(score);
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="75%" outerRadius="95%"
          startAngle={90} endAngle={-270}
          data={data}
          barSize={12}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: "rgba(42, 42, 64, 0.5)" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-[var(--color-text-muted)]">Health Score</span>
      </div>
    </div>
  );
}
