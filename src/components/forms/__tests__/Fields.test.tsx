import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "../Input";
import { Select } from "../Select";

describe("Form fields", () => {
  it("enforces required inputs with native validation", () => {
    render(
      <Input
        label="Company name"
        name="name"
        value=""
        onChange={vi.fn()}
        required
      />,
    );
    const input = screen.getByRole("textbox", { name: /Company name/ });
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
  });

  it("forwards numeric constraints to the native input", () => {
    // These native constraints are part of the field API used by revenue forms.
    const constraints = { min: 0, max: 100, step: 0.01 };
    render(
      <Input
        label="Revenue"
        name="revenue"
        type="number"
        value="-1"
        onChange={vi.fn()}
        {...constraints}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Revenue" });
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("step", "0.01");
    expect(input).toBeInvalid();
  });

  it("associates input errors with the field", () => {
    render(
      <Input
        label="Email"
        name="email"
        value="invalid"
        onChange={vi.fn()}
        error="Enter a valid email"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email");
  });

  it("keeps a required select blank until the user makes a selection", () => {
    render(
      <Select
        label="Owner"
        name="owner"
        value=""
        onChange={vi.fn()}
        options={[{ value: "1", label: "Alex" }]}
        required
      />,
    );
    const select = screen.getByRole("combobox", { name: /Owner/ });
    expect(select).toHaveValue("");
    expect(select).toBeRequired();
    expect(select).toBeInvalid();
    expect(screen.getByRole("option", { name: /Select/ })).toBeDisabled();
  });

  it("disables a required placeholder without disabling valid options", () => {
    render(
      <Select
        label="Owner"
        name="owner"
        value=""
        onChange={vi.fn()}
        options={[{ value: "1", label: "Alex" }]}
        placeholder="Choose an owner"
        required
      />,
    );
    expect(
      screen.getByRole("option", { name: "Choose an owner" }),
    ).toBeDisabled();
    expect(screen.getByRole("option", { name: "Alex" })).not.toBeDisabled();
  });

  it("allows an optional select to be cleared", () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Owner"
        name="owner"
        value="1"
        onChange={onChange}
        options={[{ value: "1", label: "Alex" }]}
        placeholder="No owner"
      />,
    );
    expect(screen.getByRole("option", { name: "No owner" })).not.toBeDisabled();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("associates select errors with the field", () => {
    render(
      <Select
        label="Owner"
        name="owner"
        value=""
        onChange={vi.fn()}
        options={[]}
        error="Choose an owner"
      />,
    );
    const select = screen.getByRole("combobox", { name: "Owner" });
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Choose an owner");
  });
});
