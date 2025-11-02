import {PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend} from "recharts";
import {formatCurrency} from "@/utils/formatters";

interface AssetAllocationChartProps {
  data: Array<{name: string; value: number; percentage: number}>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AssetAllocationChart({data}: AssetAllocationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(1)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
