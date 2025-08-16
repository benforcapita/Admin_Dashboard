import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/forms/Input';
import { Select } from '../components/forms/Select';
import { Button } from '../components/ui/Button';
import { mockTasks, mockUsers, taskStages } from '../utils/mockData';
import { Task, User } from '../types';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    stageId: '',
    userIds: [] as string[],
  });

  const handleTaskMove = (taskId: string, newStageId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStage = taskStages.find(stage => stage.id === newStageId);
        return newStage ? { ...task, stage: newStage } : task;
      }
      return task;
    }));
  };

  const handleTaskCreate = (stageId?: string) => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      stageId: stageId || taskStages[0].id,
      userIds: [],
    });
    setIsModalOpen(true);
  };

  const handleTaskEdit = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        stageId: task.stage.id,
        userIds: task.users.map(user => user.id),
      });
      setIsModalOpen(true);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stage = taskStages.find(s => s.id === formData.stageId);
    const users = mockUsers.filter(user => formData.userIds.includes(user.id));
    
    if (!stage) return;

    if (editingTask) {
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              title: formData.title,
              description: formData.description,
              dueDate: formData.dueDate ? `${formData.dueDate}T10:00:00Z` : undefined,
              stage,
              users,
              updatedAt: new Date().toISOString(),
            }
          : task
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? `${formData.dueDate}T10:00:00Z` : undefined,
        stage,
        users,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your tasks with drag and drop</p>
        </div>
        <Button icon={Plus} onClick={() => handleTaskCreate()}>
          Add Task
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          stages={taskStages}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskCreate={handleTaskCreate}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            
            <Select
              label="Stage"
              name="stageId"
              value={formData.stageId}
              onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
              options={taskStages.map(stage => ({ value: stage.id, label: stage.title }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignees
            </label>
            <div className="space-y-2">
              {mockUsers.map(user => (
                <label key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.userIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          userIds: [...formData.userIds, user.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          userIds: formData.userIds.filter(id => id !== user.id)
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};