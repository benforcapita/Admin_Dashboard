export interface User {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  avatarUrl?: string;
  salesOwner: User;
  totalRevenue: number;
  companySize: string;
  businessType: string;
  industry: string;
  country: string;
  website: string;
  dealsAggregate: {
    sum: {
      value: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  stage: TaskStage;
  users: User[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskStage {
  id: string;
  title: string;
  color: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: 'NEW' | 'QUALIFIED' | 'UNQUALIFIED' | 'WON' | 'LOST';
  avatarUrl?: string;
  companyId: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  company: Company;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  user: User;
  date: string;
  details: string;
}

export interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
}