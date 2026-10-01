import { test, expect, type Page } from "@playwright/test";
const key = "admin-dashboard-workspace-v1";
async function login(page: Page, path = "/") {
  await page.goto(path);
  await expect(
    page.getByText("Demo sign-in only.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("michael@dundermifflin.com");
  await page.getByLabel("Password").fill("demo demo");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
}
async function createCompany(page: Page, name = "Browser Labs") {
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  await page.getByRole("button", { name: "Add Company" }).click();
  await page.getByLabel("Company Name").fill(name);
  await page.getByLabel("Sales Owner").selectOption("1");
  await page.getByLabel("Total Revenue").fill("1234.56");
  await page.getByLabel("Company Size").selectOption("1-10");
  await page.getByLabel("Business Type").selectOption("B2B");
  await page.getByLabel("Industry").selectOption("Software");
  await page.getByLabel("Country").fill("Israel");
  await page.getByLabel("Website").fill("https://browser.example");
  await page
    .getByRole("button", { name: "Create Company", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test("company/contact CRUD stays linked through navigation, reload and guarded deletes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (dialog) => dialog.accept());
  await login(page);
  await createCompany(page);
  await page.getByRole("link", { name: "Contacts", exact: true }).click();
  await page.getByRole("button", { name: "Add Contact" }).click();
  await page.getByLabel("Full Name").fill("Dana Browser");
  await page.getByLabel("Email", { exact: false }).fill("dana@browser.example");
  await page.getByLabel("Phone").fill("555-0101");
  await page.getByLabel("Job Title").fill("Founder");
  await page
    .getByLabel("Company", { exact: false })
    .selectOption({ label: "Browser Labs" });
  await page
    .getByRole("button", { name: "Create Contact", exact: true })
    .click();
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  await page.getByRole("button", { name: "Edit Browser Labs" }).click();
  await page.getByLabel("Company Name").fill("Browser Labs Updated");
  await page.getByRole("button", { name: "Update Company" }).click();
  await page.reload();
  await expect(
    page.getByText("Browser Labs Updated", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Browser Labs Updated" })
    .click();
  await expect(page.getByRole("alert")).toContainText("linked");
  await expect(
    page.getByText("Browser Labs Updated", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Contacts", exact: true }).click();
  await expect(
    page.getByText("Browser Labs Updated", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Dana Browser" }).click();
  await page.getByLabel("Job Title").fill("CEO");
  await page.getByRole("button", { name: "Update Contact" }).click();
  await page.reload();
  await expect(page.getByText("CEO", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Delete Dana Browser" }).click();
  await expect(page.getByText("Dana Browser", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete Browser Labs Updated" })
    .click();
  await page.reload();
  await expect(
    page.getByText("Browser Labs Updated", { exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("tasks create/edit/move/delete and actual pointer drops onto other cards persist", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await login(page);
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await page.getByRole("button", { name: "Add Task", exact: true }).click();
  await page.getByLabel("Task Title").fill("Browser QA task");
  await page.getByLabel("Description").fill("Persistent task description");
  await page.getByLabel("Due Date").fill("2026-10-02");
  await page.getByLabel("Jim Halpert").check();
  await page.getByRole("button", { name: "Create Task", exact: true }).click();
  await page.getByRole("button", { name: "Edit Browser QA task" }).click();
  await page.getByLabel("Stage").selectOption("4");
  await page.getByRole("button", { name: "Update Task" }).click();
  await page.reload();
  expect(
    await page.evaluate(
      (k) =>
        JSON.parse(localStorage.getItem(k)!).tasks.find(
          (t: { title: string }) => t.title === "Browser QA task",
        ).stage.id,
      key,
    ),
  ).toBe("4");
  const from = await page
    .getByRole("button", { name: "Drag Design new dashboard layout" })
    .boundingBox();
  const to = await page.locator('[data-task-id="2"]').boundingBox();
  expect(from).not.toBeNull();
  expect(to).not.toBeNull();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(from!.x + 10, from!.y + 15, { steps: 5 });
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
    steps: 20,
  });
  await page.mouse.up();
  await expect
    .poll(() =>
      page.evaluate(
        (k) =>
          JSON.parse(localStorage.getItem(k)!).tasks.find(
            (t: { id: string }) => t.id === "1",
          ).stage.id,
        key,
      ),
    )
    .toBe("2");
  await page.reload();
  await page.getByRole("button", { name: "Delete Browser QA task" }).click();
  await page.reload();
  await expect(page.getByText("Browser QA task", { exact: true })).toHaveCount(
    0,
  );
});
test("search works on the current route and dashboard counts reflect real additions", async ({
  page,
}) => {
  await login(page);
  await createCompany(page);
  await page
    .getByRole("searchbox", { name: "Search workspace" })
    .fill("TechFlow");
  await page.getByRole("link", { name: "TechFlow Solutions Company" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search companies" }),
  ).toHaveValue("TechFlow Solutions");
  await expect(page.getByText("Acme Corporation", { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByRole("searchbox", { name: "Search companies" })
    .fill("no-such-record");
  await expect(
    page.getByText("No companies found.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(
    page
      .getByText("Total Companies")
      .locator("..")
      .getByText("4", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Total Contacts")
      .locator("..")
      .getByText("2", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Total Revenue")
      .locator("..")
      .getByText("$2,451,235", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open workspace activity" }).click();
  await expect(page.getByRole("dialog")).toContainText("Browser Labs");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("JSON export/import is round-trip, cancellable and invalid import is non-destructive", async ({
  page,
}) => {
  await login(page);
  await createCompany(page);
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const download = await downloadPromise;
  const file = await download.path();
  const { readFile } = await import("node:fs/promises");
  const raw = await readFile(file!, "utf8");
  expect(JSON.parse(raw).companies.at(-1).name).toBe("Browser Labs");
  await page
    .getByLabel("Choose backup file")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from("{oops"),
    });
  await expect(page.getByRole("alert")).toContainText("Invalid backup");
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).companies.length,
      key,
    ),
  ).toBe(4);
  const empty = JSON.stringify({
    version: 1,
    companies: [],
    contacts: [],
    tasks: [],
    deals: [],
    activities: [],
  });
  await page
    .getByLabel("Choose backup file")
    .setInputFiles({
      name: "empty.json",
      mimeType: "application/json",
      buffer: Buffer.from(empty),
    });
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).companies.length,
      key,
    ),
  ).toBe(4);
  await page
    .getByLabel("Choose backup file")
    .setInputFiles({
      name: "empty.json",
      mimeType: "application/json",
      buffer: Buffer.from(empty),
    });
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await page.reload();
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).companies.length,
      key,
    ),
  ).toBe(0);
  const previousDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download previous workspace" })
    .click();
  const previous = await previousDownloadPromise;
  expect(
    JSON.parse(await readFile((await previous.path())!, "utf8")).companies
      .length,
  ).toBe(4);
  await page
    .getByLabel("Choose backup file")
    .setInputFiles({
      name: "round-trip.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  await expect(page.getByText("Browser Labs", { exact: true })).toBeVisible();
  expect(
    await page.evaluate((k) => localStorage.getItem(`${k}-before-import`), key),
  ).not.toBeNull();
});
test("damaged storage is preserved and recoverable without blank-screen failure", async ({
  page,
}) => {
  await page.addInitScript((k) => {
    localStorage.setItem("authToken", "mock-token");
    if (!localStorage.getItem(k)) localStorage.setItem(k, "{damaged");
  }, key);
  await page.goto("/companies");
  await expect(page.getByRole("alert")).toContainText("preserved");
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    "{damaged",
  );
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Start recovered workspace" }).click();
  await page.reload();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(
    await page.evaluate((k) => localStorage.getItem(`${k}-recovery`), key),
  ).toBe("{damaged");
});
test("mobile navigation, dialog focus and dismissal remain usable with screenshots", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.screenshot({
    path: "docs/qa/mobile-dashboard.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  await page.getByRole("button", { name: "Add Company" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.screenshot({
    path: "docs/qa/mobile-company-dialog.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add Company" })).toBeFocused();
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit Design new dashboard layout" })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Companies", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("desktop review screenshots and demo logout", async ({ page }) => {
  await login(page);
  for (const [name, path] of [
    ["Dashboard", "/"],
    ["Companies", "/companies"],
    ["Contacts", "/contacts"],
    ["Tasks", "/tasks"],
    ["Settings", "/settings"],
  ]) {
    await page.goto(path);
    await page.screenshot({
      path: `docs/qa/desktop-${name.toLowerCase()}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Open your local CRM" }),
  ).toBeVisible();
  await page.goto("/tasks");
  await expect(
    page.getByRole("heading", { name: "Open your local CRM" }),
  ).toBeVisible();
});

test("wrong demo credentials keep the form and show a usable error", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("wrong@example.com");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("Invalid credentials");
  await expect(page.getByLabel("Email address")).toHaveValue(
    "wrong@example.com",
  );
  await expect(page.getByLabel("Password")).toHaveValue("wrong");
});
