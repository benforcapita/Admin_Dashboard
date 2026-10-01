import React from "react";
import { Building, Users, DollarSign, TrendingUp } from "lucide-react";
import { StatsCard } from "../components/charts/StatsCard";
import { DealChart } from "../components/charts/DealChart";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { summarize } from "../data/workspace";
import { formatCurrency, formatNumber, formatDate } from "../utils/helpers";

export const Dashboard: React.FC = () => {
  const { data } = useWorkspace();
  const currentStats = summarize(data);
  const stats = [
    {
      title: "Total Companies",
      value: formatNumber(currentStats.totalCompanies),
      icon: Building,
      color: "blue",
    },
    {
      title: "Total Contacts",
      value: formatNumber(currentStats.totalContacts),
      icon: Users,
      color: "green",
    },
    {
      title: "Total Deals",
      value: formatNumber(currentStats.totalDeals),
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(currentStats.totalRevenue),
      icon: DollarSign,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Counts and revenue reflect records in this browser. Deals are read-only
        sample records; no growth percentages are simulated.
      </p>
      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealChart />

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Latest Activities
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {data.activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar
                    src={activity.user.avatarUrl}
                    name={activity.user.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    {activity.type}
                  </Badge>
                </div>
              ))}
              {data.activities.length === 0 && (
                <p className="text-sm text-gray-500">
                  No workspace changes yet. Add or edit a record to begin.
                </p>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Deals Overview</h2>
        </Card.Header>
        <Card.Content>
          {data.deals.length === 0 ? (
            <p className="text-gray-500 text-sm">No deal records</p>
          ) : (
            <ul className="divide-y">
              {data.deals.map((deal) => (
                <li
                  key={deal.id}
                  className="py-3 flex flex-wrap gap-2 justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-500">
                      {deal.company.name} · {deal.stage}
                    </p>
                  </div>
                  <span className="text-sm">{formatCurrency(deal.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};
