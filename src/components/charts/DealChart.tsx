import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/Card";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { formatCurrency } from "../../utils/helpers";
export function DealChart() {
  const { data } = useWorkspace();
  const chart = data.companies.map((c) => ({
    name: c.name,
    revenue: c.totalRevenue,
  }));
  return (
    <Card>
      <Card.Header>
        <h2 className="text-lg font-semibold text-gray-900">
          Revenue by company
        </h2>
      </Card.Header>
      <Card.Content>
        {chart.length > 0 ? (
          <>
            <div aria-hidden="true">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chart} margin={{ left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <details className="text-sm mt-3">
              <summary className="cursor-pointer text-gray-600">
                View revenue values
              </summary>
              <ul className="mt-2 space-y-1">
                {chart.map((c) => (
                  <li key={c.name} className="flex justify-between gap-3">
                    <span className="break-words">{c.name}</span>
                    <span>{formatCurrency(c.revenue)}</span>
                  </li>
                ))}
              </ul>
            </details>
          </>
        ) : (
          <p className="text-sm text-gray-500 py-6">
            Add a company to see its revenue here
          </p>
        )}
      </Card.Content>
    </Card>
  );
}
