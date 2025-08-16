import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = true }) => {
  const baseClasses = `bg-white rounded-lg border border-gray-200 shadow-sm ${padding ? 'p-6' : ''} ${className}`;
  
  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;

export { Card };