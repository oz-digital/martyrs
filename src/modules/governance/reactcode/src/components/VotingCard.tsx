import { Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';

interface Voting {
  id: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
}

interface VotingCardProps {
  voting: Voting;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  create_task: { label: 'Create Task', color: 'bg-blue-100 text-blue-700' },
  approve_task: { label: 'Approve Task', color: 'bg-green-100 text-green-700' },
  general: { label: 'General', color: 'bg-purple-100 text-purple-700' },
};

export default function VotingCard({ voting }: VotingCardProps) {
  const typeInfo = typeConfig[voting.type] || typeConfig.general;
  const percentageYes = voting.totalVotes > 0 ? (voting.yesVotes / voting.totalVotes) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link to={`/votings/${voting.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <TaskStatusBadge status={voting.status} />
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {voting.title}
        </h3>

        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${percentageYes}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{voting.yesVotes} Yes</span>
            <span>{voting.noVotes} No</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(voting.createdAt)}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>{voting.totalVotes}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
