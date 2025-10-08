import { Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: User | null;
  dueDate: string;
  priority: string;
  tags: string[];
  votingId: string | null;
}

interface TaskCardProps {
  task: Task;
  draggable?: boolean;
}

const priorityColors: Record<string, string> = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
};

export default function TaskCard({ task, draggable = false }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/tasks/${task.id}`} className="block">
      <div
        className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border-l-4 ${
          priorityColors[task.priority]
        } cursor-pointer`}
        draggable={draggable}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 flex-1 pr-2">{task.title}</h4>
          {task.votingId && (
            <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}
        </div>

        <div className="mb-3">
          <TaskStatusBadge status={task.status} />
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
          {task.assignee && (
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="w-6 h-6 rounded-full border-2 border-white"
              title={task.assignee.name}
            />
          )}
        </div>
      </div>
    </Link>
  );
}
