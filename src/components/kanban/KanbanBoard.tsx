import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Task, TaskStage } from '../../types';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

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
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStageId = over.id as string;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.stage.id !== newStageId) {
      onTaskMove(taskId, newStageId);
    }
  };

  const getTasksForStage = (stageId: string) => {
    return tasks.filter(task => task.stage.id === stageId);
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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