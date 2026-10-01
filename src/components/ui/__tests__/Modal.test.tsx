import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

describe("Modal accessibility", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("exposes a named modal dialog and labelled close control", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Edit company">
        <input aria-label="Company name" />
      </Modal>,
    );

    expect(
      screen.getByRole("dialog", { name: "Edit company" }),
    ).toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByRole("button", { name: "Close dialog" }),
    ).toHaveAttribute("type", "button");
  });

  it("dismisses with Escape and restores focus to its opener", async () => {
    const user = userEvent.setup();
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button onClick={() => setIsOpen(true)}>Add company</button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Create company"
          >
            <input aria-label="Company name" />
          </Modal>
        </>
      );
    }
    render(<Example />);
    const opener = screen.getByRole("button", { name: "Add company" });
    await act(async () => {
      await user.click(opener);
    });
    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement,
    );

    await act(async () => {
      await user.keyboard("{Escape}");
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("keeps Tab, Shift+Tab and programmatic focus inside the dialog", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Outside</button>
        <Modal isOpen onClose={vi.fn()} title="Edit task">
          <input aria-label="Task title" />
          <button>Save</button>
        </Modal>
      </>,
    );
    const close = screen.getByRole("button", { name: "Close dialog" });
    const save = screen.getByRole("button", { name: "Save" });
    save.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(save).toHaveFocus();

    screen.getByRole("button", { name: "Outside" }).focus();
    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it("locks background scrolling while open and restores the previous overflow on close", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="Edit task">
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Edit task">
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores scroll and focus when unmounted", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()} title="Edit task">
        Content
      </Modal>,
    );
    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it("constrains dialog height and allows scrolling on short viewports", () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Long form">
        Content
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveClass(
      "max-h-[calc(100dvh-2rem)]",
      "overflow-y-auto",
    );
  });

  it("does not dismiss when its content is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Edit task">
        <button>Save</button>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
