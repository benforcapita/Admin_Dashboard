import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { chartData } from '../../utils/mockData';

export const DealChart: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">Deals Overview</h3>
      </Card.Header>
      <Card.Content>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value?.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Deals'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="deals" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Content>
    </Card>
  );
};