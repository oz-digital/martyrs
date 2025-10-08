import { Link } from 'react-router-dom';
import { Target, CheckSquare, Layers, ExternalLink } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';

interface LinkedEntityCardProps {
  entityType: 'initiative' | 'milestone' | 'task';
  entityData: {
    id: string;
    name?: string;
    title?: string;
    status: string;
  };
}

const entityConfig = {
  initiative: {
    icon: Target,
    label: 'Initiative',
    path: (id: string) => `/initiatives/${id}`,
  },
  milestone: {
    icon: Layers,
    label: 'Milestone',
    path: (id: string) => `/milestones/${id}`,
  },
  task: {
    icon: CheckSquare,
    label: 'Task',
    path: (id: string) => `/tasks/${id}`,
  },
};

export default function LinkedEntityCard({ entityType, entityData }: LinkedEntityCardProps) {
  const config = entityConfig[entityType];
  const Icon = config.icon;
  const displayName = entityData.title || entityData.name || 'Untitled';

  return (
    <Link
      to={config.path(entityData.id)}
      className="block bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-white rounded-lg p-2 group-hover:bg-blue-100 transition-colors">
            <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-1">{config.label}</div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 truncate">{displayName}</h4>
            <TaskStatusBadge status={entityData.status} />
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
      </div>
    </Link>
  );
}
