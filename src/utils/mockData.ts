import { Company, Task, Contact, Deal, Activity, DashboardStats, User, TaskStage } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Michael Scott',
    email: 'michael@dundermifflin.com',
    jobTitle: 'Regional Manager',
    avatarUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
  },
  {
    id: '2',
    name: 'Jim Halpert',
    email: 'jim@dundermifflin.com',
    jobTitle: 'Sales Representative',
    avatarUrl: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
  },
  {
    id: '3',
    name: 'Pam Beesly',
    email: 'pam@dundermifflin.com',
    jobTitle: 'Office Administrator',
    avatarUrl: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
  },
];

export const taskStages: TaskStage[] = [
  { id: '1', title: 'TODO', color: '#6B7280' },
  { id: '2', title: 'IN PROGRESS', color: '#3B82F6' },
  { id: '3', title: 'IN REVIEW', color: '#F59E0B' },
  { id: '4', title: 'DONE', color: '#10B981' },
];

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    avatarUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    salesOwner: mockUsers[0],
    totalRevenue: 500000,
    companySize: '51-200',
    businessType: 'B2B',
    industry: 'Technology',
    country: 'United States',
    website: 'https://acme.com',
    dealsAggregate: { sum: { value: 150000 } },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'TechFlow Solutions',
    avatarUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    salesOwner: mockUsers[1],
    totalRevenue: 750000,
    companySize: '201-500',
    businessType: 'B2B',
    industry: 'Software',
    country: 'Canada',
    website: 'https://techflow.com',
    dealsAggregate: { sum: { value: 220000 } },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
  },
  {
    id: '3',
    name: 'Global Dynamics',
    avatarUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    salesOwner: mockUsers[2],
    totalRevenue: 1200000,
    companySize: '501-1000',
    businessType: 'Enterprise',
    industry: 'Manufacturing',
    country: 'Germany',
    website: 'https://globaldynamics.com',
    dealsAggregate: { sum: { value: 380000 } },
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-22T13:20:00Z',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new dashboard interface',
    dueDate: '2024-02-15T10:00:00Z',
    stage: taskStages[0],
    users: [mockUsers[0], mockUsers[1]],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Add login/logout functionality with proper session management',
    dueDate: '2024-02-10T16:00:00Z',
    stage: taskStages[1],
    users: [mockUsers[1]],
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-21T10:30:00Z',
  },
  {
    id: '3',
    title: 'Code review for API endpoints',
    description: 'Review and test all REST API endpoints for the new features',
    dueDate: '2024-02-08T12:00:00Z',
    stage: taskStages[2],
    users: [mockUsers[2]],
    createdAt: '2024-01-15T16:30:00Z',
    updatedAt: '2024-01-22T11:15:00Z',
  },
  {
    id: '4',
    title: 'Deploy to production',
    description: 'Deploy the application to production environment',
    stage: taskStages[3],
    users: [mockUsers[0]],
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-23T15:00:00Z',
  },
];

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@acme.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'CEO',
    status: 'QUALIFIED',
    avatarUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    companyId: '1',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@techflow.com',
    phone: '+1 (555) 987-6543',
    jobTitle: 'CTO',
    status: 'WON',
    avatarUrl: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    companyId: '2',
  },
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    value: 150000,
    stage: 'Won',
    company: mockCompanies[0],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Cloud Migration Project',
    value: 220000,
    stage: 'In Progress',
    company: mockCompanies[1],
    createdAt: '2024-01-18T14:30:00Z',
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'CREATE',
    resource: 'company',
    user: mockUsers[0],
    date: '2024-01-25T10:30:00Z',
    details: 'Created new company "Acme Corporation"',
  },
  {
    id: '2',
    type: 'UPDATE',
    resource: 'deal',
    user: mockUsers[1],
    date: '2024-01-25T09:15:00Z',
    details: 'Updated deal "Enterprise Software License" status to Won',
  },
  {
    id: '3',
    type: 'CREATE',
    resource: 'task',
    user: mockUsers[2],
    date: '2024-01-25T08:45:00Z',
    details: 'Created new task "Design new dashboard layout"',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalCompanies: 125,
  totalContacts: 847,
  totalDeals: 342,
  totalRevenue: 2450000,
};

export const chartData = [
  { month: 'Jan', deals: 45, revenue: 245000 },
  { month: 'Feb', deals: 52, revenue: 289000 },
  { month: 'Mar', deals: 48, revenue: 267000 },
  { month: 'Apr', deals: 61, revenue: 334000 },
  { month: 'May', deals: 55, revenue: 298000 },
  { month: 'Jun', deals: 67, revenue: 378000 },
];