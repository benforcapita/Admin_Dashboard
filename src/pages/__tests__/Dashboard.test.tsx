import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

// Mock recharts to avoid issues in test environment
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="container">{children}</div>,
}));

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText("Welcome back! Here's what's happening today.")).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Companies')).toBeInTheDocument();
    expect(screen.getByText('Total Contacts')).toBeInTheDocument();
    expect(screen.getByText('Total Deals')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('renders charts section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Deals Overview')).toBeInTheDocument();
    expect(screen.getByText('Latest Activities')).toBeInTheDocument();
  });

  it('displays formatted currency values', () => {
    render(<Dashboard />);
    expect(screen.getByText('$2,450,000')).toBeInTheDocument();
  });
});