import { Calendar, TrendingUp, AlertTriangle, Activity, Users, ExternalLink } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';

interface ProductSummaryProps {
  initiative: any;
  onAction: (action: string) => void;
}

export default function ProductSummary({ initiative, onAction }: ProductSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="h-64 overflow-hidden">
        <img
          src={initiative.cover}
          alt={initiative.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <TaskStatusBadge status={initiative.status} />
              <span className="text-sm text-gray-500 font-mono">{initiative.slug || initiative.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{initiative.title}</h1>
            <p className="text-gray-700 text-lg leading-relaxed">{initiative.description}</p>
          </div>
          {initiative.url && (
            <a
              href={initiative.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 ml-4"
            >
              <ExternalLink className="w-6 h-6" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200 mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Start Date
            </div>
            <div className="font-semibold text-gray-900">{formatDate(initiative.date)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Target Release
            </div>
            <div className="font-semibold text-gray-900">
              {initiative.targetReleaseDate ? formatDate(initiative.targetReleaseDate) : 'TBD'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Structure</div>
            <div className="font-semibold text-gray-900">{initiative.structure}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Team Size
            </div>
            <div className="font-semibold text-gray-900">
              {(initiative.team?.owners?.length || 0) +
               (initiative.team?.coreTeam?.length || 0) +
               (initiative.team?.contributors?.length || 0)}
            </div>
          </div>
        </div>

        {initiative.metrics && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <div className="text-xs text-gray-500">Task Progress</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{initiative.metrics.taskProgress}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <div className="text-xs text-gray-500">Risk Index</div>
                </div>
                <div className={`text-sm font-bold capitalize px-2 py-1 rounded ${getRiskColor(initiative.metrics.riskIndex)}`}>
                  {initiative.metrics.riskIndex}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-green-600" />
                  <div className="text-xs text-gray-500">Availability</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{initiative.metrics.availabilityIndex}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <div className="text-xs text-gray-500">SLA</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{initiative.metrics.sla}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-violet-600" />
                  <div className="text-xs text-gray-500">Active Users</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{initiative.metrics.activeUsers}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div className="text-xs text-gray-500">Performance</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{initiative.metrics.performance}</div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onAction('create-task')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Create Task
            </button>
            <button
              onClick={() => onAction('plan-release')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Plan Release
            </button>
            <button
              onClick={() => onAction('add-link')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Add Link
            </button>
            <button
              onClick={() => onAction('open-voting')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Open Voting
            </button>
            <button
              onClick={() => onAction('mark-risk')}
              className="bg-white hover:bg-gray-50 text-red-700 border border-red-300 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Mark Risk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
