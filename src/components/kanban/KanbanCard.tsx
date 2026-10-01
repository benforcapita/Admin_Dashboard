import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Edit, GripVertical, Trash2 } from "lucide-react";
import { Task } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { getRelativeDate, getDateColor } from "../../utils/helpers";

interface KanbanCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDragOverlay?: boolean;
}

interface CardContentProps extends KanbanCardProps {
  nodeRef?: (node: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
  isDragging?: boolean;
  dragHandle?: React.ReactNode;
}

const SortableKanbanCard: React.FC<KanbanCardProps> = (props) => {
  const { task } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task:${task.id}`,
    data: { type: "task", taskId: task.id, stageId: task.stage.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <KanbanCardContent
      {...props}
      nodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      dragHandle={
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${task.title}`}
          className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-grab active:cursor-grabbing touch-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      }
    />
  );
};

const KanbanCardContent: React.FC<CardContentProps> = ({
  task,
  onEdit,
  onDelete,
  isDragOverlay = false,
  nodeRef,
  style,
  isDragging = false,
  dragHandle,
}) => {
  const dateColor = getDateColor(task.dueDate);
  const badgeVariant =
    dateColor === "red"
      ? "danger"
      : dateColor === "orange"
        ? "warning"
        : "default";

  return (
    <div
      ref={nodeRef}
      style={style}
      aria-hidden={isDragOverlay ? true : undefined}
      data-task-id={task.id}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
        isDragging || isDragOverlay ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 leading-tight flex-1 min-w-0 break-words pr-2">
          {task.title}
        </h4>
        {!isDragOverlay && (
          <div className="flex shrink-0 gap-1">
            {dragHandle}
            <button
              type="button"
              aria-label={`Edit ${task.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task.id);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Edit size={12} />
            </button>
            <button
              type="button"
              aria-label={`Delete ${task.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
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
                className={`border-2 border-white ${index > 0 ? "ml-[-8px]" : ""}`}
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

export const KanbanCard: React.FC<KanbanCardProps> = (props) =>
  props.isDragOverlay ? (
    <KanbanCardContent {...props} />
  ) : (
    <SortableKanbanCard {...props} />
  );
