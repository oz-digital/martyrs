import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import TaskStatusBadge from '../components/TaskStatusBadge';
import VoteForm from '../components/VoteForm';
import VotingResults from '../components/VotingResults';
import LinkedEntityCard from '../components/LinkedEntityCard';
import { mockVotings, mockTasks, mockInitiatives, mockMilestones } from '../data/mockData';

const typeConfig: Record<string, { label: string; color: string }> = {
  create_task: { label: 'Create Task', color: 'bg-blue-100 text-blue-700' },
  approve_task: { label: 'Approve Task', color: 'bg-green-100 text-green-700' },
  general: { label: 'General', color: 'bg-purple-100 text-purple-700' },
};

export default function VotingDetailPage() {
  const { id } = useParams();
  const [hasVoted, setHasVoted] = useState(false);

  const voting = mockVotings.find((v) => v.id === id);

  if (!voting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting not found</h2>
          <Link to="/votings" className="text-blue-600 hover:text-blue-700">
            Back to votings
          </Link>
        </div>
      </div>
    );
  }

  const typeInfo = typeConfig[voting.type] || typeConfig.general;
  const isActive = voting.status === 'pending';

  const percentageYes = voting.totalVotes > 0 ? (voting.yesVotes / voting.totalVotes) * 100 : 0;
  const percentageNo = voting.totalVotes > 0 ? (voting.noVotes / voting.totalVotes) * 100 : 0;

  const results = {
    totalVotes: voting.totalVotes,
    yesVotes: voting.yesVotes,
    noVotes: voting.noVotes,
    abstainVotes: voting.abstainVotes,
    percentageYes,
    percentageNo,
    threshold: voting.threshold,
  };

  const handleVoteSubmit = (vote: 'yes' | 'no' | 'abstain', comment: string) => {
    console.log('Vote submitted:', { vote, comment });
    setHasVoted(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  let linkedEntity = null;
  if (voting.linkedEntityType === 'task' && voting.linkedEntityId) {
    const task = mockTasks.find((t) => t.id === voting.linkedEntityId);
    if (task) {
      linkedEntity = (
        <LinkedEntityCard
          entityType="task"
          entityData={{
            id: task.id,
            title: task.title,
            status: task.status,
          }}
        />
      );
    }
  } else if (voting.linkedEntityType === 'initiative' && voting.linkedEntityId) {
    const initiative = mockInitiatives.find((i) => i.id === voting.linkedEntityId);
    if (initiative) {
      linkedEntity = (
        <LinkedEntityCard
          entityType="initiative"
          entityData={{
            id: initiative.id,
            title: initiative.title,
            status: initiative.status,
          }}
        />
      );
    }
  } else if (voting.linkedEntityType === 'milestone' && voting.linkedEntityId) {
    const milestone = mockMilestones.find((m) => m.id === voting.linkedEntityId);
    if (milestone) {
      linkedEntity = (
        <LinkedEntityCard
          entityType="milestone"
          entityData={{
            id: milestone.id,
            name: milestone.name,
            status: milestone.status,
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/votings"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to votings
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <TaskStatusBadge status={voting.status} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{voting.title}</h1>
                <p className="text-gray-700 text-lg leading-relaxed">{voting.description}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Created</div>
                    <div className="font-medium text-gray-900">{formatDate(voting.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Ends</div>
                    <div className="font-medium text-gray-900">{formatDate(voting.endDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {linkedEntity && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Item</h3>
                {linkedEntity}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <VotingResults results={results} votes={voting.votes} />
            </div>
          </div>
        </div>

        {isActive && !hasVoted && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <VoteForm onSubmit={handleVoteSubmit} />
          </div>
        )}

        {hasVoted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-green-700 font-semibold text-lg mb-2">Thank you for voting!</div>
            <p className="text-green-600">Your vote has been recorded.</p>
          </div>
        )}

        {!isActive && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <div className="text-gray-700 font-semibold text-lg mb-2">Voting Closed</div>
            <p className="text-gray-600">This voting has ended.</p>
          </div>
        )}
      </div>
    </div>
  );
}
