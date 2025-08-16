import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isBefore(date, new Date())) return 'Overdue';
  if (isBefore(date, addDays(new Date(), 7))) return 'This week';
  return format(date, 'MMM dd');
};

export const getDateColor = (dateString?: string): string => {
  if (!dateString) return 'gray';
  const date = new Date(dateString);
  if (isBefore(date, new Date())) return 'red';
  if (isBefore(date, addDays(new Date(), 3))) return 'orange';
  return 'green';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    NEW: 'blue',
    QUALIFIED: 'green',
    UNQUALIFIED: 'red',
    WON: 'emerald',
    LOST: 'gray',
    TODO: 'gray',
    'IN PROGRESS': 'blue',
    'IN REVIEW': 'yellow',
    DONE: 'green',
  };
  return colors[status] || 'gray';
};