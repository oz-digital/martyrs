import { GitBranch, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface ProductRepositoriesProps {
  repositories: any[];
}

export default function ProductRepositories({ repositories }: ProductRepositoriesProps) {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Repositories</h3>
        </div>
        <p className="text-gray-500">No repositories configured yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Repositories</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{repo.name}</h4>
                <p className="text-sm text-gray-500 font-mono">{repo.path}</p>
              </div>
              <a
                href={`https://${repo.provider.toLowerCase()}.com/${repo.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-2 mb-2">
              {repo.buildStatus === 'passing' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${repo.buildStatus === 'passing' ? 'text-green-600' : 'text-red-600'}`}>
                {repo.buildStatus === 'passing' ? 'Build Passing' : 'Build Failing'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Owner:</span>
                <span className="ml-1 font-medium text-gray-900">{repo.owner.name}</span>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {repo.lastRelease}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
