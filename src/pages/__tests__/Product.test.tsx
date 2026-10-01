import { render, screen, within, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";
import { WORKSPACE_KEY } from "../../data/workspace";

vi.mock("../../components/charts/DealChart", () => ({
  DealChart: () => <div>Revenue by company</div>,
}));
describe("local CRM end-to-end integration", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("authToken", "mock-token");
    window.history.replaceState({}, "", "/companies");
  });
  it("creates a company, shares it with contacts and persists it across navigation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      await user.click(
        await screen.findByRole("button", { name: "Add Company" }),
      );
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/Company Name/), "Browser Labs");
    });
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Sales Owner/), "1");
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/Total Revenue/), "1234.56");
    });
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Company Size/), "1-10");
    });
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Business Type/), "B2B");
    });
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Industry/), "Software");
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/Country/), "Israel");
    });
    await act(async () => {
      await user.type(
        screen.getByLabelText(/Website/),
        "https://browser.example",
      );
    });
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Create Company" }));
    });
    expect(await screen.findByText("Browser Labs")).toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByRole("link", { name: "Contacts" }));
    });
    await act(async () => {
      await user.click(
        await screen.findByRole("button", { name: "Add Contact" }),
      );
    });
    expect(
      within(screen.getByLabelText(/^Company/)).getByRole("option", {
        name: "Browser Labs",
      }),
    ).toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Cancel" }));
    });
    await act(async () => {
      await user.click(screen.getByRole("link", { name: "Companies" }));
    });
    expect(screen.getByText("Browser Labs")).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(WORKSPACE_KEY)!).companies.at(-1)
        .totalRevenue,
    ).toBe(1234.56);
  });
  it("has real global search results and task editing with persistence", async () => {
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      await user.type(
        await screen.findByRole("searchbox", { name: "Search workspace" }),
        "John",
      );
    });
    await act(async () => {
      await user.click(screen.getByRole("link", { name: /John Doe/ }));
    });
    expect(
      await screen.findByRole("heading", { name: "Contacts" }),
    ).toBeInTheDocument();
    await act(async () => {
      await user.click(screen.getByRole("link", { name: "Tasks" }));
    });
    await act(async () => {
      await user.click(
        await screen.findByRole("button", {
          name: "Edit Design new dashboard layout",
        }),
      );
    });
    await act(async () => {
      await user.selectOptions(screen.getByLabelText(/Stage/), "4");
    });
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Update Task" }));
    });
    expect(
      JSON.parse(localStorage.getItem(WORKSPACE_KEY)!).tasks[0].stage.id,
    ).toBe("4");
  });
  it("shows wrong demo credentials without clearing or unmounting the form", async () => {
    localStorage.clear();
    window.history.replaceState({}, "", "/login");
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      await user.type(
        screen.getByLabelText(/Email address/),
        "wrong@example.com",
      );
      await user.type(screen.getByLabelText(/^Password/), "wrong");
      await user.click(screen.getByRole("button", { name: "Sign in" }));
    });
    expect(
      await screen.findByRole("alert", {}, { timeout: 2500 }),
    ).toHaveTextContent("Invalid credentials");
    expect(screen.getByLabelText(/Email address/)).toHaveValue(
      "wrong@example.com",
    );
  });
  it("blocks whitespace company names without closing or creating records", async () => {
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      await user.click(
        await screen.findByRole("button", { name: "Add Company" }),
      );
    });
    fireEvent.change(screen.getByLabelText(/Company Name/), {
      target: { value: "   " },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Create Company" }).closest("form")!,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/required|name/i);
  });
});
