import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700',
  outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  type = 'button',
}) => {
  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={16} />}
        </>
      )}
    </button>
  );
};