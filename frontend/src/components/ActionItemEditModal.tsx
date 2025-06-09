import React, { useState, useEffect } from 'react';
import { Calendar, User, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ActionItem } from '../types';
import { useToastStore } from '../stores/toastStore';
import { cn } from '../utils/cn';

interface ActionItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItem: ActionItem | null;
  onSave: (updatedItem: ActionItem) => void;
  onDelete?: (itemId: string) => void;
}

export const ActionItemEditModal: React.FC<ActionItemEditModalProps> = ({
  isOpen,
  onClose,
  actionItem,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    content: '',
    assignee: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'completed',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToastStore();

  useEffect(() => {
    if (actionItem) {
      setFormData({
        content: actionItem.content,
        assignee: actionItem.assignee || '',
        dueDate: actionItem.dueDate || '',
        priority: actionItem.priority,
        status: actionItem.status,
      });
    } else {
      // Reset form for new item
      setFormData({
        content: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
      });
    }
  }, [actionItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      error('Validation Error', 'Please enter a task description.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedItem: ActionItem = {
        id: actionItem?.id || Date.now().toString(),
        content: formData.content.trim(),
        assignee: formData.assignee.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
        status: formData.status,
        meetingId: actionItem?.meetingId || '',
      };

      onSave(updatedItem);
      success(
        actionItem ? 'Task Updated' : 'Task Created',
        actionItem ? 'Action item has been updated successfully.' : 'New action item has been created.'
      );
      onClose();
    } catch (err) {
      error('Save Failed', 'Failed to save the action item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!actionItem || !onDelete) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onDelete(actionItem.id);
      success('Task Deleted', 'Action item has been deleted successfully.');
      onClose();
    } catch (err) {
      error('Delete Failed', 'Failed to delete the action item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900/30' },
    { value: 'medium', label: 'Medium Priority', color: 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/30' },
    { value: 'high', label: 'High Priority', color: 'text-error-600 bg-error-100 dark:text-error-400 dark:bg-error-900/30' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={actionItem ? 'Edit Action Item' : 'Create Action Item'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Description */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Task Description *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter task description..."
            rows={3}
            className="input w-full resize-none"
            required
          />
        </div>

        {/* Assignee */}
        <div>
          <Input
            label="Assignee"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Enter assignee name"
            leftIcon={<User className="h-4 w-4" />}
          />
        </div>

        {/* Due Date */}
        <div>
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-3">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: option.value as any })}
                className={cn(
                  'p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200',
                  formData.priority === option.value
                    ? `${option.color} border-current`
                    : 'border-dark-200 text-dark-600 hover:border-dark-300 dark:border-dark-700 dark:text-dark-400 dark:hover:border-dark-600'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {option.value === 'high' && <AlertTriangle className="h-4 w-4" />}
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'pending' })}
              className={cn(
                'p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                formData.status === 'pending'
                  ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-dark-200 text-dark-600 hover:border-dark-300 dark:border-dark-700 dark:text-dark-400 dark:hover:border-dark-600'
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              Pending
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'completed' })}
              className={cn(
                'p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                formData.status === 'completed'
                  ? 'border-success-300 bg-success-50 text-success-700 dark:border-success-600 dark:bg-success-900/30 dark:text-success-300'
                  : 'border-dark-200 text-dark-600 hover:border-dark-300 dark:border-dark-700 dark:text-dark-400 dark:hover:border-dark-600'
              )}
            >
              <CheckCircle className="h-4 w-4" />
              Completed
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between pt-4 border-t border-dark-200 dark:border-dark-700">
          <div>
            {actionItem && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                leftIcon={<X className="h-4 w-4" />}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              {isLoading ? 'Saving...' : actionItem ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
