import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface VoteFormProps {
  onSubmit: (vote: 'yes' | 'no' | 'abstain', comment: string) => void;
}

export default function VoteForm({ onSubmit }: VoteFormProps) {
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | 'abstain' | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVote) {
      onSubmit(selectedVote, comment);
      setSelectedVote(null);
      setComment('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Cast Your Vote</h4>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setSelectedVote('yes')}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
              selectedVote === 'yes'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <ThumbsUp className={`w-8 h-8 mb-2 ${selectedVote === 'yes' ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${selectedVote === 'yes' ? 'text-green-700' : 'text-gray-600'}`}>
              Yes
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVote('no')}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
              selectedVote === 'no'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <ThumbsDown className={`w-8 h-8 mb-2 ${selectedVote === 'no' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${selectedVote === 'no' ? 'text-red-700' : 'text-gray-600'}`}>
              No
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVote('abstain')}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
              selectedVote === 'abstain'
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <Minus className={`w-8 h-8 mb-2 ${selectedVote === 'abstain' ? 'text-gray-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${selectedVote === 'abstain' ? 'text-gray-700' : 'text-gray-600'}`}>
              Abstain
            </span>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comment (Optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your thoughts on this proposal..."
        />
      </div>

      <button
        type="submit"
        disabled={!selectedVote}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        Submit Vote
      </button>
    </form>
  );
}
