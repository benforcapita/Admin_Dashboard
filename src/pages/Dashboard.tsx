import React from 'react';
import { Building, Users, DollarSign, TrendingUp } from 'lucide-react';
import { StatsCard } from '../components/charts/StatsCard';
import { DealChart } from '../components/charts/DealChart';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { mockActivities, mockDashboardStats } from '../utils/mockData';
import { formatCurrency, formatNumber, formatDate } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Companies',
      value: formatNumber(mockDashboardStats.totalCompanies),
      change: '+12%',
      icon: Building,
      color: 'blue',
      trend: 'up' as const,
    },
    {
      title: 'Total Contacts',
      value: formatNumber(mockDashboardStats.totalContacts),
      change: '+8%',
      icon: Users,
      color: 'green',
      trend: 'up' as const,
    },
    {
      title: 'Total Deals',
      value: formatNumber(mockDashboardStats.totalDeals),
      change: '+23%',
      icon: TrendingUp,
      color: 'purple',
      trend: 'up' as const,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(mockDashboardStats.totalRevenue),
      change: '+15%',
      icon: DollarSign,
      color: 'orange',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealChart />
        
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Latest Activities</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {mockActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar 
                    src={activity.user.avatarUrl} 
                    name={activity.user.name} 
                    size="sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user.name}</span>{' '}
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
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};