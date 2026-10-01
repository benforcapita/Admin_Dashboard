import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";

const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? "Loading" : "Not Loading"}</div>
      <div data-testid="user">{user ? user.name : "No User"}</div>
      <button onClick={() => login("michael@dundermifflin.com", "demo demo")}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides auth context", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No User");
  });

  it("logs in user with correct credentials", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Michael Scott");
    });
  });

  it("logs out user", async () => {
    localStorage.setItem("authToken", "mock-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Michael Scott");
    });

    fireEvent.click(screen.getByText("Logout"));

    expect(screen.getByTestId("user")).toHaveTextContent("No User");
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});
describe("local demo gate resilience", () => {
  beforeEach(() => localStorage.clear());
  it("does not accept an unrelated storage token", () => {
    localStorage.setItem("authToken", "anything");
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId("user")).toHaveTextContent("No User");
  });
  it("still permits the demo when browser storage is unavailable", async () => {
    const getter = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const setter = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    try {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      fireEvent.click(screen.getByText("Login"));
      await waitFor(
        () =>
          expect(screen.getByTestId("user")).toHaveTextContent("Michael Scott"),
        { timeout: 2000 },
      );
    } finally {
      getter.mockRestore();
      setter.mockRestore();
    }
  });
});
