"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES = [
  "var(--role-accent)",
  "#4F8CFF",
  "#F59E0B",
  "#CBD5E1",
] as const;

const tooltipStyle = {
  background: "#0c0c0e",
  border: "1px solid #2A2A2A",
  borderRadius: 0,
  fontFamily: "ui-monospace, monospace",
  fontSize: 11,
  boxShadow: "0 0 40px color-mix(in srgb, var(--role-accent) 12%, transparent)",
};

type SeriesPoint = { date: string; value: number; secondary?: number };

export function TrendAreaChart({
  data,
  dataKey = "value",
  secondaryKey,
  height = 280,
}: {
  data: SeriesPoint[];
  dataKey?: string;
  secondaryKey?: string;
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="roleFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--role-accent)"
                stopOpacity={0.28}
              />
              <stop
                offset="100%"
                stopColor="var(--role-accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#2A2A2A"
            strokeDasharray="2 6"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#2A2A2A" }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="var(--role-accent)"
            fill="url(#roleFill)"
            strokeWidth={1.75}
            animationDuration={900}
          />
          {secondaryKey && (
            <Area
              type="monotone"
              dataKey={secondaryKey}
              stroke="#4F8CFF"
              fill="transparent"
              strokeWidth={1.25}
              strokeDasharray="4 4"
              animationDuration={900}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProviderDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={78}
            paddingAngle={3}
            stroke="#09090B"
            strokeWidth={2}
            animationDuration={800}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={SERIES[i % SERIES.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({
  data,
  dataKey = "value",
  nameKey = "name",
}: {
  data: Record<string, string | number>[];
  dataKey?: string;
  nameKey?: string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke="#2A2A2A"
            strokeDasharray="2 6"
            vertical={false}
          />
          <XAxis
            dataKey={nameKey}
            tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#111827" }} />
          <Bar
            dataKey={dataKey}
            fill="var(--role-accent)"
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
