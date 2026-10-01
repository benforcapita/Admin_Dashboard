import {
  createWorkspace,
  parseWorkspace,
  updateCollection,
  summarize,
  WORKSPACE_KEY,
  MAX_BACKUP_BYTES,
} from "../workspace";
import { mockCompanies } from "../../utils/mockData";

describe("validated local CRM workspace", () => {
  it("derives honest counts and revenue from the workspace", () => {
    expect(summarize(createWorkspace())).toEqual({
      totalCompanies: 3,
      totalContacts: 2,
      totalDeals: 2,
      totalRevenue: 2450000,
    });
    expect(WORKSPACE_KEY).toBe("admin-dashboard-workspace-v1");
  });
  it("round-trips a versioned backup including zero records", () => {
    const data = createWorkspace();
    expect(parseWorkspace(JSON.stringify(data))).toEqual(data);
    expect(
      parseWorkspace(
        JSON.stringify({
          version: 1,
          companies: [],
          contacts: [],
          tasks: [],
          deals: [],
          activities: [],
        }),
      ).companies,
    ).toEqual([]);
  });
  it.each(["{}", "{oops", '{"version":2}', "null"])(
    "rejects malformed or unsupported backups: %s",
    (raw) => {
      expect(() => parseWorkspace(raw)).toThrow();
    },
  );
  it("rejects broken relationships, duplicates, invalid money, status and dates", () => {
    const broken = createWorkspace();
    broken.contacts[0].companyId = "missing";
    expect(() => parseWorkspace(JSON.stringify(broken))).toThrow(/company/i);
    const dup = createWorkspace();
    dup.tasks.push(dup.tasks[0]);
    expect(() => parseWorkspace(JSON.stringify(dup))).toThrow(/duplicate/i);
    const negative = createWorkspace();
    negative.companies[0].totalRevenue = -1;
    expect(() => parseWorkspace(JSON.stringify(negative))).toThrow(/revenue/i);
    const invalid = createWorkspace();
    invalid.tasks[0].dueDate = "invalid";
    expect(() => parseWorkspace(JSON.stringify(invalid))).toThrow(/date/i);
    const wrong = createWorkspace();
    Object.assign(wrong.contacts[0], { status: "UNKNOWN" });
    expect(() => parseWorkspace(JSON.stringify(wrong))).toThrow(/status/i);
  });
  it("updates related company snapshots and records real activity", () => {
    const initial = createWorkspace();
    const changed = updateCollection(
      initial,
      "companies",
      initial.companies.map((c) =>
        c.id === "1" ? { ...c, name: "Changed name" } : c,
      ),
    );
    expect(changed.deals[0].company.name).toBe("Changed name");
    expect(changed.activities[0].details).toContain("Changed name");
    expect(initial.companies[0].name).toBe(mockCompanies[0].name);
  });
  it("round-trips maximum-length names without corrupting the activity log", () => {
    const initial = createWorkspace();
    const next = updateCollection(
      initial,
      "tasks",
      initial.tasks.map((t, i) =>
        i === 0 ? { ...t, title: "x".repeat(2000) } : t,
      ),
    );
    expect(() => parseWorkspace(JSON.stringify(next))).not.toThrow();
    expect(() =>
      updateCollection(
        next,
        "tasks",
        next.tasks.filter((t) => t.id !== "1"),
      ),
    ).not.toThrow();
  });
  it("blocks company deletion while contacts or deals still reference it", () => {
    const initial = createWorkspace();
    expect(() =>
      updateCollection(
        initial,
        "companies",
        initial.companies.filter((c) => c.id !== "1"),
      ),
    ).toThrow(/linked/i);
  });
  it("allows deletion of unlinked companies and trims human text", () => {
    const initial = createWorkspace();
    const next = updateCollection(
      initial,
      "companies",
      initial.companies.filter((c) => c.id !== "3"),
    );
    expect(next.companies).toHaveLength(2);
    expect(next.activities[0].type).toBe("DELETE");
    const trim = updateCollection(
      initial,
      "tasks",
      initial.tasks.map((t) => ({ ...t, title: `  ${t.title}  ` })),
    );
    expect(trim.tasks[0].title).toBe(initial.tasks[0].title);
  });
  it("rejects edits that would produce an unimportable oversized workspace", () => {
    const initial = createWorkspace();
    const rows = Array.from({ length: 600 }, (_, i) => ({
      ...initial.tasks[0],
      id: `bulk-${i}`,
      description: "x".repeat(10000),
    }));
    expect(() => updateCollection(initial, "tasks", rows)).toThrow(/5 MB/);
    expect(initial.tasks).toHaveLength(4);
    expect(MAX_BACKUP_BYTES).toBe(5 * 1024 * 1024);
  });
  it("rejects whitespace names and unsafe URLs", () => {
    const initial = createWorkspace();
    expect(() =>
      updateCollection(
        initial,
        "companies",
        initial.companies.map((c) => ({ ...c, name: "   " })),
      ),
    ).toThrow(/name/i);
    expect(() =>
      updateCollection(
        initial,
        "companies",
        initial.companies.map((c) => ({
          ...c,
          website: "javascript:alert(1)",
        })),
      ),
    ).toThrow(/website/i);
  });
});
