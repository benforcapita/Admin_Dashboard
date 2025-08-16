import React from 'react';
import { getInitials } from '../../utils/helpers';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const baseClasses = `inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ${sizeClasses[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${baseClasses} object-cover`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div className={baseClasses}>
      {getInitials(name)}
    </div>
  );
};