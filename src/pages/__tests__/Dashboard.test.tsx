import { render, screen } from "@testing-library/react";
import { Dashboard } from "../Dashboard";
import { WorkspaceProvider } from "../../contexts/WorkspaceContext";
import type { ReactNode } from "react";

// Mock recharts to avoid issues in test environment
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Bar: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
}));

describe("Dashboard", () => {
  beforeEach(() => localStorage.clear());
  it("renders dashboard title", () => {
    render(
      <WorkspaceProvider>
        <Dashboard />
      </WorkspaceProvider>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome back! Here's what's happening today."),
    ).toBeInTheDocument();
  });

  it("renders stats cards", () => {
    render(
      <WorkspaceProvider>
        <Dashboard />
      </WorkspaceProvider>,
    );
    expect(screen.getByText("Total Companies")).toBeInTheDocument();
    expect(screen.getByText("Total Contacts")).toBeInTheDocument();
    expect(screen.getByText("Total Deals")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });

  it("renders charts section", () => {
    render(
      <WorkspaceProvider>
        <Dashboard />
      </WorkspaceProvider>,
    );
    expect(screen.getByText("Deals Overview")).toBeInTheDocument();
    expect(screen.getByText("Latest Activities")).toBeInTheDocument();
  });

  it("displays formatted currency values", () => {
    render(
      <WorkspaceProvider>
        <Dashboard />
      </WorkspaceProvider>,
    );
    expect(screen.getByText("$2,450,000")).toBeInTheDocument();
  });
});
