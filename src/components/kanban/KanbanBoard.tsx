import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Task, TaskStage } from "../../types";

interface KanbanBoardProps {
  stages: TaskStage[];
  tasks: Task[];
  onTaskMove: (taskId: string, newStageId: string) => void;
  onTaskCreate: (stageId?: string) => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  tasks,
  onTaskMove,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(
      (t) =>
        t.id === event.active.data.current?.taskId ||
        `task:${t.id}` === event.active.id,
    );
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const task = tasks.find(
      (t) =>
        t.id === active.data.current?.taskId || `task:${t.id}` === active.id,
    );
    const targetTask = tasks.find((t) => `task:${t.id}` === over.id);
    const newStageId =
      over.data.current?.stageId ??
      targetTask?.stage.id ??
      stages.find((stage) => `stage:${stage.id}` === over.id)?.id;

    if (
      task &&
      stages.some((stage) => stage.id === newStageId) &&
      task.stage.id !== newStageId
    ) {
      onTaskMove(task.id, newStageId);
    }
  };

  const getTasksForStage = (stageId: string) => {
    return tasks.filter((task) => task.stage.id === stageId);
  };

  return (
    <div
      role="region"
      aria-label="Task board"
      tabIndex={0}
      className="flex gap-6 h-full overflow-x-auto pb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        {stages.map((stage) => {
          const stageTasks = getTasksForStage(stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              tasks={stageTasks}
              onTaskCreate={onTaskCreate}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
            />
          );
        })}

        <DragOverlay>
          {activeTask ? (
            <KanbanCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
