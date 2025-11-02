import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import {formatCurrency} from "@/utils/formatters";

interface PerformanceChartProps {
  data: Array<{month: string; value: number}>;
}

export default function PerformanceChart({data}: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Portfolio Value" />
      </LineChart>
    </ResponsiveContainer>
  );
}
