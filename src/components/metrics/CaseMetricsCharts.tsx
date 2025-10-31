"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { translateViolenceType, translateCaseStatus, translateCasePriority } from "@/lib/translations";
import { CaseStatus, ViolenceType, CasePriority } from "@prisma/client";

interface CaseMetricsChartsProps {
  casesByStatus?: Array<{ status: string; count: number }>;
  casesByViolenceType?: Array<{ type: string; count: number }>;
  casesByPriority?: Array<{ priority: string; count: number }>;
  casesBySchool?: Array<{ schoolName: string; count: number }>;
  casesOverTime?: Array<{ date: string; count: number }>;
}

const COLORS = {
  status: {
    OPEN: "#ef4444",
    IN_PROGRESS: "#f59e0b",
    UNDER_REVIEW: "#3b82f6",
    RESOLVED: "#10b981",
    CLOSED: "#6b7280",
    ARCHIVED: "#475569",
  },
  priority: {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#f97316",
    URGENT: "#ef4444",
  },
  violence: [
    "#ef4444",
    "#f97316",
    "#8b5cf6",
    "#ec4899",
    "#3b82f6",
    "#eab308",
    "#f59e0b",
    "#6b7280",
  ],
};

export function CaseMetricsCharts({
  casesByStatus,
  casesByViolenceType,
  casesByPriority,
  casesBySchool,
  casesOverTime,
}: CaseMetricsChartsProps) {
  // Transform data for charts
  const statusChartData = casesByStatus?.map((item) => ({
    name: translateCaseStatus(item.status as CaseStatus),
    value: item.count,
    status: item.status,
  })) || [];

  const violenceChartData = casesByViolenceType?.map((item) => ({
    name: translateViolenceType(item.type as ViolenceType),
    value: item.count,
    type: item.type,
  })) || [];

  const priorityChartData = casesByPriority?.map((item) => ({
    name: translateCasePriority(item.priority as CasePriority),
    value: item.count,
    priority: item.priority,
  })) || [];

  const schoolChartData = casesBySchool?.slice(0, 10).map((item) => ({
    name: item.schoolName.length > 20 ? item.schoolName.substring(0, 20) + "..." : item.schoolName,
    value: item.count,
    fullName: item.schoolName,
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cases by Status - Bar Chart */}
      {statusChartData.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Casos por Estado</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS.status[entry.status as keyof typeof COLORS.status] || "#6b7280"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cases by Violence Type - Pie Chart */}
      {violenceChartData.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Casos por Tipo de Violencia</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={violenceChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {violenceChartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS.violence[index % COLORS.violence.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cases by Priority - Bar Chart */}
      {priorityChartData.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Casos por Prioridad</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {priorityChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS.priority[entry.priority as keyof typeof COLORS.priority] || "#6b7280"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cases by School - Bar Chart */}
      {schoolChartData.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Casos por Colegio (Top 10)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schoolChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string, props: any) => [
                  value,
                  props.payload.fullName || name,
                ]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cases Over Time - Line Chart */}
      {casesOverTime && casesOverTime.length > 0 && (
        <div className="space-y-4 lg:col-span-2">
          <h4 className="text-sm font-semibold">Evolución de Casos en el Tiempo</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={casesOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Casos"
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

