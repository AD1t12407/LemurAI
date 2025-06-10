import React, { useState } from 'react';
import { AlertTriangle, Calendar, User, Save, X, Edit3 } from 'lucide-react';
import { ActionItem } from '../types';
import { cn } from '../utils/cn';
import { useDataStore } from '../stores/dataStore';
import { OverlayEditModal, EditFormWrapper, FormSection, FormActions, InputGroup } from './OverlayEditModal';
import { Button } from './Button';
import { Input } from './Input';
import { useToastStore } from '../stores/toastStore';

interface ActionItemCardProps {
  item: ActionItem;
  className?: string;
  onClick?: () => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({
  item,
  className,
  onClick
}) => {
  const { content, assignee, dueDate, status, priority } = item;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: content,
    assignee: assignee || '',
    dueDate: dueDate || '',
    priority: priority,
    status: status,
  });
  const { updateActionItem, deleteActionItem, toggleActionItemStatus } = useDataStore();
  const { success, error } = useToastStore();

  const priorityColors = {
    low: 'text-emerald-600 dark:text-emerald-400',
    medium: 'text-amber-600 dark:text-amber-400',
    high: 'text-red-600 dark:text-red-400',
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleActionItemStatus(item.id);
  };

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
        ...item,
        content: formData.content.trim(),
        assignee: formData.assignee.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
        status: formData.status,
      };

      updateActionItem(item.id, updatedItem);
      success('Task Updated', 'Action item has been updated successfully.');
      setIsEditModalOpen(false);
    } catch (err) {
      error('Save Failed', 'Failed to save the action item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      deleteActionItem(item.id);
      success('Task Deleted', 'Action item has been deleted successfully.');
      setIsEditModalOpen(false);
    } catch (err) {
      error('Delete Failed', 'Failed to delete the action item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityBadgeColors = {
    low: 'badge badge-success',
    medium: 'badge badge-warning',
    high: 'badge badge-error',
  };

  return (
    <div
      className={cn(
        'card group relative flex h-full min-h-[200px] flex-col justify-between hover-lift animate-fade-in',
        'transition-all duration-300 ease-out cursor-pointer',
        status === 'completed' && 'opacity-75 hover:opacity-90',
        className
      )}
      onClick={handleCardClick}
      title="Click to edit action item"
    >
      {/* Edit Icon - appears on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
          <Edit3 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      {/* Header with Status Toggle */}
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-3">
          <label className="checkbox-container mt-1 flex-shrink-0">
            <input
              type="checkbox"
              checked={status === 'completed'}
              onChange={handleStatusToggle}
            />
            <span className="checkbox-mark"></span>
          </label>

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium leading-tight',
                status === 'completed' ? 'line-through' : ''
              )}
              style={{
                color: status === 'completed' ? 'var(--text-tertiary)' : 'var(--text-primary)'
              }}
            >
              {content}
            </p>

            {/* Priority Badge */}
            <div className="mt-2">
              <span className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm',
                priorityBadgeColors[priority]
              )}>
                {priority === 'high' && <AlertTriangle className="h-3 w-3" />}
                {priority ? (priority.charAt(0).toUpperCase() + priority.slice(1)) : 'Unknown'} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {assignee && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{assignee}</span>
            </div>
          )}

          {dueDate && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Overlay Edit Modal - Portal renders outside component tree */}
      <OverlayEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Action Item"
        size="md"
      >
          <EditFormWrapper onSubmit={handleSubmit}>
            <FormSection>
              <InputGroup label="Task Description" required>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter task description..."
                  rows={3}
                  className="input w-full resize-none"
                  required
                />
              </InputGroup>

              <InputGroup label="Assignee">
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Enter assignee name"
                  leftIcon={<User className="h-4 w-4" />}
                />
              </InputGroup>

              <InputGroup label="Due Date">
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  leftIcon={<Calendar className="h-4 w-4" />}
                />
              </InputGroup>
            </FormSection>

            <FormSection title="Priority & Status">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputGroup label="Priority">
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </InputGroup>

                <InputGroup label="Status">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </InputGroup>
              </div>
            </FormSection>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                leftIcon={<X className="h-4 w-4" />}
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </FormActions>
          </EditFormWrapper>
        </OverlayEditModal>
    </div>
  );
};