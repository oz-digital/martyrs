import { Calendar, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Milestone {
  id: string;
  initiativeId: string;
  name: string;
  status: string;
  startDate: string;
  dueDate: string;
  progress: number;
  owner: User;
  taskCount: number;
}

interface MilestoneCardProps {
  milestone: Milestone;
}

export default function MilestoneCard({ milestone }: MilestoneCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/milestones/${milestone.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {milestone.name}
          </h3>
          <TaskStatusBadge status={milestone.status} />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">{milestone.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              {formatDate(milestone.startDate)} - {formatDate(milestone.dueDate)}
            </span>
          </div>
          <div className="flex items-center text-gray-500">
            <CheckSquare className="w-4 h-4 mr-1" />
            <span>{milestone.taskCount}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <img
            src={milestone.owner.avatar}
            alt={milestone.owner.name}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <span className="ml-2 text-sm text-gray-600">{milestone.owner.name}</span>
        </div>
      </div>
    </Link>
  );
}
