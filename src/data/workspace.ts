import type {
  Company,
  Contact,
  Task,
  Deal,
  Activity,
  DashboardStats,
  User,
} from "../types";
import {
  mockCompanies,
  mockContacts,
  mockTasks,
  mockDeals,
  mockUsers,
  taskStages,
} from "../utils/mockData";

export interface Workspace {
  version: 1;
  companies: Company[];
  contacts: Contact[];
  tasks: Task[];
  deals: Deal[];
  activities: Activity[];
}
export const WORKSPACE_KEY = "admin-dashboard-workspace-v1";
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
type Collection = "companies" | "contacts" | "tasks";

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`Invalid ${label}.`);
  return value as Record<string, unknown>;
}
function text(
  value: unknown,
  label: string,
  optional = false,
  max = 2000,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!optional && !value.trim())
  )
    throw new Error(`Invalid ${label}.`);
  return value.trim();
}
function date(value: unknown, label: string): string {
  const result = text(value, label);
  if (!Number.isFinite(Date.parse(result)))
    throw new Error(`Invalid ${label}.`);
  return result;
}
function money(value: unknown, label: string): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1e12
  )
    throw new Error(`Invalid ${label}; use a non-negative amount.`);
  return value;
}
function url(
  value: unknown,
  label: string,
  optional = false,
): string | undefined {
  if (optional && value === undefined) return undefined;
  const result = text(value, label, optional);
  if (!result && optional) return undefined;
  try {
    if (!["https:", "http:"].includes(new URL(result).protocol))
      throw new Error();
  } catch {
    throw new Error(`Invalid ${label}; use an http or https URL.`);
  }
  return result;
}
function user(value: unknown): User {
  const id = text(object(value, "user").id, "user ID");
  const match = mockUsers.find((u) => u.id === id);
  if (!match) throw new Error("Invalid sales owner or assignee.");
  return { ...match, avatarUrl: undefined };
}
function records<T>(
  value: unknown,
  label: string,
  parse: (value: unknown) => T,
): T[] {
  if (!Array.isArray(value) || value.length > 10000)
    throw new Error(`Invalid ${label} list.`);
  return value.map(parse);
}
function unique(rows: { id: string }[], label: string) {
  if (new Set(rows.map((row) => row.id)).size !== rows.length)
    throw new Error(`Duplicate ${label} IDs.`);
}
function validate(value: unknown): Workspace {
  const root = object(value, "workspace");
  if (root.version !== 1)
    throw new Error("Unsupported backup version. Expected version 1.");
  const companies = records(root.companies, "companies", (value) => {
    const c = object(value, "company");
    return {
      id: text(c.id, "company ID"),
      name: text(c.name, "company name"),
      avatarUrl: url(c.avatarUrl, "avatar", true),
      salesOwner: user(c.salesOwner),
      totalRevenue: money(c.totalRevenue, "revenue"),
      companySize: text(c.companySize, "company size"),
      businessType: text(c.businessType, "business type"),
      industry: text(c.industry, "industry"),
      country: text(c.country, "country"),
      website: url(c.website, "website")!,
      dealsAggregate: { sum: { value: 0 } },
      createdAt: date(c.createdAt, "created date"),
      updatedAt: date(c.updatedAt, "updated date"),
    } satisfies Company;
  });
  unique(companies, "company");
  const contacts = records(root.contacts, "contacts", (value) => {
    const c = object(value, "contact");
    const companyId = text(c.companyId, "contact company");
    if (!companies.some((company) => company.id === companyId))
      throw new Error("Contact references an unavailable company.");
    const email = text(c.email, "email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("Invalid email.");
    if (
      !["NEW", "QUALIFIED", "UNQUALIFIED", "WON", "LOST"].includes(
        String(c.status),
      )
    )
      throw new Error("Invalid contact status.");
    return {
      id: text(c.id, "contact ID"),
      name: text(c.name, "contact name"),
      email,
      phone: text(c.phone, "phone"),
      jobTitle: text(c.jobTitle, "job title"),
      status: c.status as Contact["status"],
      companyId,
      avatarUrl: url(c.avatarUrl, "avatar", true),
    } satisfies Contact;
  });
  unique(contacts, "contact");
  const tasks = records(root.tasks, "tasks", (value) => {
    const t = object(value, "task");
    const stageId = text(object(t.stage, "task stage").id, "stage ID");
    const stage = taskStages.find((s) => s.id === stageId);
    if (!stage) throw new Error("Invalid task stage.");
    const users = records(t.users, "assignees", user);
    unique(users, "assignee");
    return {
      id: text(t.id, "task ID"),
      title: text(t.title, "task title"),
      description: text(t.description, "description", true, 10000),
      dueDate:
        t.dueDate === undefined ? undefined : date(t.dueDate, "due date"),
      stage: { ...stage },
      users,
      createdAt: date(t.createdAt, "created date"),
      updatedAt: date(t.updatedAt, "updated date"),
    } satisfies Task;
  });
  unique(tasks, "task");
  const deals = records(root.deals, "deals", (value) => {
    const d = object(value, "deal");
    const companyId = text(
      object(d.company, "deal company").id,
      "deal company ID",
    );
    const company = companies.find((c) => c.id === companyId);
    if (!company) throw new Error("Deal references an unavailable company.");
    return {
      id: text(d.id, "deal ID"),
      title: text(d.title, "deal title"),
      value: money(d.value, "deal value"),
      stage: text(d.stage, "deal stage"),
      company,
      createdAt: date(d.createdAt, "deal date"),
    } satisfies Deal;
  });
  unique(deals, "deal");
  if (!Array.isArray(root.activities) || root.activities.length > 200)
    throw new Error(
      "Invalid activity history: at most 200 recent entries are supported.",
    );
  const activities = records(root.activities, "activities", (value) => {
    const a = object(value, "activity");
    if (!["CREATE", "UPDATE", "DELETE"].includes(String(a.type)))
      throw new Error("Invalid activity type.");
    return {
      id: text(a.id, "activity ID"),
      type: a.type as Activity["type"],
      resource: text(a.resource, "resource"),
      user: user(a.user),
      date: date(a.date, "activity date"),
      details: text(a.details, "activity details", false, 4096),
    } satisfies Activity;
  }).slice(0, 200);
  unique(activities, "activity");
  for (const company of companies)
    company.dealsAggregate.sum.value = deals
      .filter(
        (d) =>
          d.company.id === company.id && !["Won", "Lost"].includes(d.stage),
      )
      .reduce((sum, d) => sum + d.value, 0);
  return { version: 1, companies, contacts, tasks, deals, activities };
}
export function createWorkspace(): Workspace {
  // Seed records are examples, not claimed live business metrics. No external avatar requests.
  return validate({
    version: 1,
    companies: mockCompanies.map((c) => ({ ...c, avatarUrl: undefined })),
    contacts: mockContacts.map((c) => ({ ...c, avatarUrl: undefined })),
    tasks: mockTasks,
    deals: mockDeals,
    activities: [],
  });
}
function assertBackupSize(raw: string) {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES)
    throw new Error(
      "Backup exceeds the 5 MB limit. Export and split your records before adding more.",
    );
}
export function parseWorkspace(raw: string): Workspace {
  assertBackupSize(raw);
  try {
    const data = validate(JSON.parse(raw));
    assertBackupSize(JSON.stringify(data));
    return data;
  } catch (error) {
    throw new Error(
      `Invalid backup: ${error instanceof Error ? error.message : "unreadable data"}`,
    );
  }
}
export function updateCollection<K extends Collection>(
  data: Workspace,
  key: K,
  next: Workspace[K],
): Workspace {
  if (key === "companies") {
    const ids = new Set((next as Company[]).map((c) => c.id));
    if (
      data.contacts.some((c) => !ids.has(c.companyId)) ||
      data.deals.some((d) => !ids.has(d.company.id))
    )
      throw new Error(
        "This company has linked contacts or deals. Remove or reassign them before deletion.",
      );
  }
  const updated = validate({ ...data, [key]: next });
  const oldById = new Map(data[key].map((row) => [row.id, row]));
  const nextById = new Map(updated[key].map((row) => [row.id, row]));
  const changes: Activity[] = [];
  const activity = (type: Activity["type"], row: Company | Contact | Task) => ({
    id: crypto.randomUUID(),
    type,
    resource: key.slice(0, -1),
    user: user(mockUsers[0]),
    date: new Date().toISOString(),
    details: `${type === "CREATE" ? "Created" : type === "DELETE" ? "Deleted" : "Updated"} ${key === "companies" ? "company" : key.slice(0, -1)} “${"name" in row ? row.name : row.title}”`,
  });
  for (const row of updated[key]) {
    const old = oldById.get(row.id);
    if (!old) changes.push(activity("CREATE", row));
    else if (JSON.stringify(old) !== JSON.stringify(row))
      changes.push(activity("UPDATE", row));
  }
  for (const row of data[key])
    if (!nextById.has(row.id)) changes.push(activity("DELETE", row));
  return parseWorkspace(
    JSON.stringify({
      ...updated,
      activities: [...changes, ...updated.activities].slice(0, 200),
    }),
  );
}
export function summarize(data: Workspace): DashboardStats {
  return {
    totalCompanies: data.companies.length,
    totalContacts: data.contacts.length,
    totalDeals: data.deals.length,
    totalRevenue: data.companies.reduce((sum, c) => sum + c.totalRevenue, 0),
  };
}
