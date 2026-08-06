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

const COLORS = ["#00E5A8", "#4F8CFF", "#F59E0B", "#CBD5E1"];

type SeriesPoint = { date: string; value: number; secondary?: number };

export function TrendAreaChart({
  data,
  dataKey = "value",
  secondaryKey,
}: {
  data: SeriesPoint[];
  dataKey?: string;
  secondaryKey?: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E5A8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#00E5A8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#CBD5E1", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#CBD5E1", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #2A2A2A",
              borderRadius: 0,
              fontFamily: "monospace",
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#00E5A8"
            fill="url(#mintFill)"
            strokeWidth={1.5}
          />
          {secondaryKey && (
            <Area
              type="monotone"
              dataKey={secondaryKey}
              stroke="#4F8CFF"
              fill="transparent"
              strokeWidth={1.5}
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
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            stroke="#09090B"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #2A2A2A",
              borderRadius: 0,
              fontFamily: "monospace",
              fontSize: 11,
            }}
          />
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
        <BarChart data={data}>
          <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
          <XAxis
            dataKey={nameKey}
            tick={{ fill: "#CBD5E1", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#CBD5E1", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#2A2A2A" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #2A2A2A",
              borderRadius: 0,
              fontFamily: "monospace",
              fontSize: 11,
            }}
          />
          <Bar dataKey={dataKey} fill="#00E5A8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
