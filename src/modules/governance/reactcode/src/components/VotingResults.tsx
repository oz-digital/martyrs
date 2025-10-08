import { Check, X, MessageSquare } from 'lucide-react';

interface Vote {
  userId: string;
  userName: string;
  vote: 'yes' | 'no' | 'abstain';
  comment: string;
  createdAt: string;
}

interface VotingResultsProps {
  results: {
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    percentageYes: number;
    percentageNo: number;
    threshold: number;
  };
  votes: Vote[];
}

export default function VotingResults({ results, votes }: VotingResultsProps) {
  const { totalVotes, yesVotes, noVotes, abstainVotes, percentageYes, percentageNo, threshold } = results;
  const percentageAbstain = 100 - percentageYes - percentageNo;
  const thresholdMet = percentageYes >= threshold * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'yes':
        return 'text-green-600';
      case 'no':
        return 'text-red-600';
      case 'abstain':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Voting Results</h3>
          <div className={`flex items-center gap-2 ${thresholdMet ? 'text-green-600' : 'text-red-600'}`}>
            {thresholdMet ? (
              <>
                <Check className="w-5 h-5" />
                <span className="font-semibold">Threshold Met</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                <span className="font-semibold">Threshold Not Met</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Total Votes</span>
            <span className="text-2xl font-bold text-gray-900">{totalVotes}</span>
          </div>
          <div className="text-sm text-gray-600">
            Threshold: {(threshold * 100).toFixed(0)}% approval required
          </div>
        </div>

        <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden flex">
          {percentageYes > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${percentageYes}%` }}
            >
              {percentageYes >= 15 && `${percentageYes.toFixed(0)}%`}
            </div>
          )}
          {percentageNo > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${percentageNo}%` }}
            >
              {percentageNo >= 15 && `${percentageNo.toFixed(0)}%`}
            </div>
          )}
          {percentageAbstain > 0 && (
            <div
              className="bg-gray-400 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${percentageAbstain}%` }}
            >
              {percentageAbstain >= 15 && `${percentageAbstain.toFixed(0)}%`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{yesVotes}</div>
            <div className="text-sm text-gray-600">Yes ({percentageYes.toFixed(1)}%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{noVotes}</div>
            <div className="text-sm text-gray-600">No ({percentageNo.toFixed(1)}%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{abstainVotes}</div>
            <div className="text-sm text-gray-600">Abstain ({percentageAbstain.toFixed(1)}%)</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          All Votes ({votes.length})
        </h4>
        <div className="space-y-3">
          {votes.map((vote, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                    {vote.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{vote.userName}</div>
                    <div className="text-xs text-gray-500">{formatDate(vote.createdAt)}</div>
                  </div>
                </div>
                <span className={`font-semibold capitalize ${getVoteColor(vote.vote)}`}>
                  {vote.vote}
                </span>
              </div>
              {vote.comment && (
                <p className="text-sm text-gray-700 mt-2 pl-13">{vote.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
