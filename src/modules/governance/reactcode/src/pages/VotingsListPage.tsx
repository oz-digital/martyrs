import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import VotingCard from '../components/VotingCard';
import EmptyState from '../components/EmptyState';
import { mockVotings } from '../data/mockData';

export default function VotingsListPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredVotings = mockVotings.filter((voting) => {
    const matchesType = typeFilter === 'all' || voting.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || voting.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Votings</h1>
          <p className="text-gray-600">View and participate in all active votings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="create_task">Create Task</option>
                <option value="approve_task">Approve Task</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredVotings.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No votings found"
            message="Try adjusting your filters to see more votings."
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Showing {filteredVotings.length} of {mockVotings.length} votings
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVotings.map((voting) => (
                <VotingCard key={voting.id} voting={voting} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
