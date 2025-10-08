import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';
import MilestoneCard from '../components/MilestoneCard';
import EmptyState from '../components/EmptyState';
import { mockInitiatives, mockMilestones } from '../data/mockData';

export default function RoadmapPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'milestones' | 'releases'>('milestones');

  const initiative = mockInitiatives.find((i) => i.id === id);
  const milestones = mockMilestones.filter((m) => m.initiativeId === id);

  if (!initiative) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initiative not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to initiatives
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const completedMilestones = milestones.filter((m) => m.status === 'completed');
  const inProgressMilestones = milestones.filter((m) => m.status === 'in_progress');
  const notStartedMilestones = milestones.filter((m) => m.status === 'not_started');

  const overallProgress = milestones.length > 0
    ? Math.round((completedMilestones.length / milestones.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/initiatives/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to initiative
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{initiative.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{initiative.description}</p>
              <div className="flex items-center gap-6 text-sm">
                {initiative.date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Started {formatDate(initiative.date)}</span>
                  </div>
                )}
                {initiative.targetReleaseDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Target {formatDate(initiative.targetReleaseDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('milestones')}
                className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'milestones'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Milestones
              </button>
              <button
                onClick={() => setActiveTab('releases')}
                className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'releases'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Releases
              </button>
            </div>
          </div>

          {activeTab === 'milestones' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-2xl font-bold text-gray-900">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full" />
                  <span className="text-gray-600">{completedMilestones.length} Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  <span className="text-gray-600">{inProgressMilestones.length} In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-gray-600">{notStartedMilestones.length} Not Started</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'milestones' ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Milestones Roadmap</h2>
              <p className="text-gray-600 mt-1">Track progress across all milestones</p>
            </div>

            {milestones.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No milestones yet"
                message="Create milestones to start tracking progress on this initiative."
              />
            ) : (
              <div className="space-y-8">
                {inProgressMilestones.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
                      <span className="text-sm text-gray-500">({inProgressMilestones.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inProgressMilestones.map((milestone) => (
                        <MilestoneCard key={milestone.id} milestone={milestone} />
                      ))}
                    </div>
                  </div>
                )}

                {notStartedMilestones.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">Not Started</h3>
                      <span className="text-sm text-gray-500">({notStartedMilestones.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {notStartedMilestones.map((milestone) => (
                        <MilestoneCard key={milestone.id} milestone={milestone} />
                      ))}
                    </div>
                  </div>
                )}

                {completedMilestones.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                      <span className="text-sm text-gray-500">({completedMilestones.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedMilestones.map((milestone) => (
                        <MilestoneCard key={milestone.id} milestone={milestone} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Release History</h2>
              <p className="text-gray-600 mt-1">All releases for this product</p>
            </div>

            {!initiative.releases || initiative.releases.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No releases yet"
                message="Releases will appear here once they are created."
              />
            ) : (
              <div className="space-y-4">
                {initiative.releases.map((release: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{release.version}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              release.status === 'released'
                                ? 'bg-green-100 text-green-700'
                                : release.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {release.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(release.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{release.notes}</p>
                    {release.migrations && release.migrations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Migrations</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {release.migrations.map((migration: string, idx: number) => (
                            <li key={idx}>{migration}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
