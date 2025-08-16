import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
          </button>
          
          {user && (
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.name} size="md" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.jobTitle}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};