import type { ReactNode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type {
  DragEndEvent,
  DragStartEvent,
  DndContextProps,
  UseDroppableArguments,
} from "@dnd-kit/core";
import type { UseSortableArguments } from "@dnd-kit/sortable";
import { KanbanBoard } from "../KanbanBoard";
import { KanbanCard } from "../KanbanCard";
import type { Task, TaskStage } from "../../../types";

// jsdom has no layout or pointer collision detection. Simulate the dnd-kit
// event boundary while testing our real board resolution and card controls.
const dnd = vi.hoisted(() => ({
  context: {} as DndContextProps,
  droppables: [] as UseDroppableArguments[],
  sortables: [] as UseSortableArguments[],
  onPointerDown: vi.fn(),
  onKeyDown: vi.fn(),
}));

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: (props: DndContextProps) => {
      dnd.context = props;
      return <div>{props.children}</div>;
    },
    DragOverlay: ({ children }: { children: ReactNode }) => (
      <div data-testid="drag-overlay">{children}</div>
    ),
    useDroppable: (args: UseDroppableArguments) => {
      dnd.droppables.push(args);
      return { setNodeRef: vi.fn(), isOver: false };
    },
  };
});

vi.mock("@dnd-kit/sortable", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/sortable")>();
  return {
    ...actual,
    useSortable: (args: UseSortableArguments) => {
      dnd.sortables.push(args);
      return {
        attributes: { role: "button", tabIndex: 0 },
        listeners: {
          onPointerDown: dnd.onPointerDown,
          onKeyDown: dnd.onKeyDown,
        },
        setNodeRef: vi.fn(),
        setActivatorNodeRef: vi.fn(),
        transform: null,
        transition: undefined,
        isDragging: false,
      };
    },
  };
});

const stages: TaskStage[] = [
  { id: "1", title: "To do", color: "#ddd" },
  { id: "2", title: "Done", color: "#0f0" },
];
const tasks: Task[] = [
  {
    id: "1",
    title: "First task",
    description: "",
    stage: stages[0],
    users: [],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "200",
    title: "Second task",
    description: "",
    stage: stages[1],
    users: [],
    createdAt: "",
    updatedAt: "",
  },
];

function renderBoard() {
  const onTaskMove = vi.fn();
  render(
    <KanbanBoard
      stages={stages}
      tasks={tasks}
      onTaskMove={onTaskMove}
      onTaskCreate={vi.fn()}
      onTaskEdit={vi.fn()}
      onTaskDelete={vi.fn()}
    />,
  );
  return onTaskMove;
}

function endDrag(over: DragEndEvent["over"], activeId = "task:1") {
  act(() =>
    dnd.context.onDragEnd?.({
      active: {
        id: activeId,
        data: { current: { type: "task", taskId: "1", stageId: "1" } },
        rect: { current: { initial: null, translated: null } },
      },
      over,
      delta: { x: 0, y: 0 },
      collisions: null,
      activatorEvent: new Event("pointerdown"),
    }),
  );
}

function target(
  id: string,
  stageId?: string,
): NonNullable<DragEndEvent["over"]> {
  return {
    id,
    data: { current: stageId ? { stageId } : {} },
    rect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
    disabled: false,
  };
}

describe("Kanban interactions", () => {
  beforeEach(() => {
    dnd.droppables = [];
    dnd.sortables = [];
    vi.clearAllMocks();
  });

  it("moves a task to the stage of the task it is dropped on", () => {
    const onTaskMove = renderBoard();
    endDrag(target("task:200", "2"));
    expect(onTaskMove).toHaveBeenCalledWith("1", "2");
  });

  it("resolves card metadata instead of treating a task ID as a stage ID", () => {
    const onTaskMove = renderBoard();
    endDrag(target("200", "2"), "1");
    expect(onTaskMove).toHaveBeenCalledWith("1", "2");
  });

  it("moves a task into an empty stage droppable", () => {
    const onTaskMove = renderBoard();
    endDrag(target("stage:2", "2"));
    expect(onTaskMove).toHaveBeenCalledWith("1", "2");
  });

  it("ignores drops outside the board, in the same stage or on unknown targets", () => {
    const onTaskMove = renderBoard();
    endDrag(null);
    endDrag(target("task:1", "1"));
    endDrag(target("stage:missing", "missing"));
    expect(onTaskMove).not.toHaveBeenCalled();
  });

  it("registers collision-free stage and task namespaces", () => {
    renderBoard();
    expect(dnd.droppables.map(({ id }) => id)).toEqual(["stage:1", "stage:2"]);
    expect(dnd.sortables.map(({ id }) => id)).toEqual(["task:1", "task:200"]);
  });

  it("configures keyboard drag in addition to pointer drag", () => {
    renderBoard();
    expect(dnd.context.sensors?.map(({ sensor }) => sensor.name)).toContain(
      "KeyboardSensor",
    );
  });

  it("has nonshrinking columns for horizontal scrolling on narrow screens", () => {
    renderBoard();
    expect(
      screen.getByRole("heading", { name: "To do" }).closest("section"),
    ).toHaveClass("shrink-0");
    expect(screen.getByRole("region", { name: "Task board" })).toHaveClass(
      "overflow-x-auto",
    );
  });

  it("provides a labelled drag handle and permanently visible action buttons", () => {
    render(<KanbanCard task={tasks[0]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Drag First task" }),
    ).toHaveAttribute("type", "button");
    expect(
      screen.getByRole("button", { name: "Edit First task" }),
    ).toBeVisible();
    const remove = screen.getByRole("button", { name: "Delete First task" });
    expect(remove).toBeVisible();
    expect(remove.parentElement).not.toHaveClass("opacity-0");
  });

  it("edits and deletes without activating drag listeners", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<KanbanCard task={tasks[0]} onEdit={onEdit} onDelete={onDelete} />);
    const edit = screen.getByRole("button", { name: "Edit First task" });
    const remove = screen.getByRole("button", { name: "Delete First task" });
    fireEvent.pointerDown(edit);
    fireEvent.click(edit);
    fireEvent.keyDown(remove, { key: "Enter" });
    fireEvent.click(remove);
    expect(onEdit).toHaveBeenCalledWith("1");
    expect(onDelete).toHaveBeenCalledWith("1");
    expect(dnd.onPointerDown).not.toHaveBeenCalled();
    expect(dnd.onKeyDown).not.toHaveBeenCalled();

    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Drag First task" }),
    );
    expect(dnd.onPointerDown).toHaveBeenCalledOnce();
  });

  it("does not register the visual drag overlay as a second sortable", () => {
    render(
      <KanbanCard
        task={tasks[0]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDragOverlay
      />,
    );
    expect(dnd.sortables).toHaveLength(0);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("clears the visual drag overlay when a drag is cancelled", () => {
    renderBoard();
    const event: DragStartEvent = {
      active: {
        id: "task:1",
        data: { current: { type: "task", taskId: "1" } },
        rect: { current: { initial: null, translated: null } },
      },
      activatorEvent: new Event("pointerdown"),
    };
    act(() => dnd.context.onDragStart?.(event));
    expect(screen.getByTestId("drag-overlay")).toHaveTextContent("First task");
    act(() => dnd.context.onDragCancel?.({} as DragEndEvent));
    expect(screen.getByTestId("drag-overlay")).toBeEmptyDOMElement();
  });
});
