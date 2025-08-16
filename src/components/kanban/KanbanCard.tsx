import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Task } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { getRelativeDate, getDateColor } from '../../utils/helpers';

interface KanbanCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDragOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onEdit,
  onDelete,
  isDragOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dateColor = getDateColor(task.dueDate);
  const badgeVariant = dateColor === 'red' ? 'danger' : dateColor === 'orange' ? 'warning' : 'default';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group ${
        isDragging || isDragOverlay ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 leading-tight flex-1 pr-2">
          {task.title}
        </h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task.id);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <Badge variant={badgeVariant} size="sm">
              <Calendar size={10} className="mr-1" />
              {getRelativeDate(task.dueDate)}
            </Badge>
          )}
        </div>

        {task.users.length > 0 && (
          <div className="flex -space-x-1">
            {task.users.slice(0, 3).map((user, index) => (
              <Avatar
                key={user.id}
                src={user.avatarUrl}
                name={user.name}
                size="sm"
                className={`border-2 border-white ${index > 0 ? 'ml-[-8px]' : ''}`}
              />
            ))}
            {task.users.length > 3 && (
              <div className="w-8 h-8 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ml-[-8px]">
                +{task.users.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};