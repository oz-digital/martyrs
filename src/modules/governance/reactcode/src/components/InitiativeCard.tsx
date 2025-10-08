import { Calendar, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';

interface Initiative {
  id: string;
  name: string;
  title: string;
  description: string;
  status: string;
  cover: string;
  createdAt: string;
  milestoneCount: number;
}

interface InitiativeCardProps {
  initiative: Initiative;
}

export default function InitiativeCard({ initiative }: InitiativeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/initiatives/${initiative.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="h-48 overflow-hidden">
          <img
            src={initiative.cover}
            alt={initiative.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <TaskStatusBadge status={initiative.status} />
            <div className="flex items-center text-gray-500 text-sm">
              <Layers className="w-4 h-4 mr-1" />
              <span>{initiative.milestoneCount}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {initiative.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{initiative.description}</p>
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(initiative.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
