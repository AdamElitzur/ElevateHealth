"use client";

import { DailyLog } from "@/lib/types";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SugarIntakeChartProps {
  logs: DailyLog[];
}

export default function SugarIntakeChart({ logs }: SugarIntakeChartProps) {
  // Sort logs by date (ascending)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Prepare data for chart
  const chartData = sortedLogs.map((log) => ({
    date: log.date,
    sugar: log.sugar_intake_grams || 0,
  }));

  return (
    <div className="h-[300px]">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value) => [`${value}g`, "Sugar"]}
            />
            <Line
              type="monotone"
              dataKey="sugar"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No data available. Start logging your daily sugar intake.
        </div>
      )}
    </div>
  );
}
