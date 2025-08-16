import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { Task, TaskStage } from '../../types';
import { Button } from '../ui/Button';

interface KanbanColumnProps {
  stage: TaskStage;
  tasks: Task[];
  onTaskCreate: (stageId: string) => void;
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  tasks,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
}) => {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex flex-col w-80 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold text-gray-900">{stage.title}</h3>
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={() => onTaskCreate(stage.id)}
        >
          Add
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-0 overflow-y-auto"
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};