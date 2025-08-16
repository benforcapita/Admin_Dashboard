import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  trend: 'up' | 'down';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last month
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses] || 'bg-gray-500'}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Card>
  );
};