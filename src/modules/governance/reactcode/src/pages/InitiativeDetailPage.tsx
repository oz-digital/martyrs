import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Link as LinkIcon, Calendar, Zap, Users, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Vote, ArrowRight } from 'lucide-react';
import MilestoneCard from '../components/MilestoneCard';
import CreateMilestoneForm from '../components/CreateMilestoneForm';
import ProposeTaskForm from '../components/ProposeTaskForm';
import EmptyState from '../components/EmptyState';
import VotingCard from '../components/VotingCard';
import { mockInitiatives, mockMilestones, mockVotings } from '../data/mockData';

export default function InitiativeDetailPage() {
  const { id } = useParams();
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const initiative = mockInitiatives.find((i) => i.id === id);
  const milestones = mockMilestones.filter((m) => m.initiativeId === id);
  const relatedVotings = mockVotings.filter((v) => v.linkedEntityId === id);

  if (!initiative) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateMilestone = (data: any) => {
    console.log('Creating milestone:', data);
    setShowMilestoneForm(false);
  };

  const handleProposeTask = (data: any) => {
    console.log('Proposing task:', data);
    setShowTaskForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  };

  const status = statusConfig[initiative.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to products
        </Link>

        {initiative.cover && (
          <div className="relative h-64 rounded-xl overflow-hidden mb-6 shadow-lg">
            <img
              src={initiative.cover}
              alt={initiative.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-4xl font-bold text-white mb-2">{initiative.title}</h1>
              <p className="text-white/90 text-lg">{initiative.description}</p>
            </div>
          </div>
        )}

        {(initiative.fullDescription || initiative.valueProposition || initiative.targetAudience || (initiative.successCriteria && initiative.successCriteria.length > 0) || initiative.team) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                About This Initiative
              </h3>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${status.color}`}>
                  {status.label}
                </span>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                >
                  <Vote className="w-4 h-4" />
                  Open Voting
                </button>
              </div>
            </div>

            {initiative.fullDescription && (
              <div className="mb-4">
                <p className={`text-gray-700 leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
                  {initiative.fullDescription}
                </p>
                {initiative.fullDescription.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

            {showFullDescription && (
              <>
                {initiative.valueProposition && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Value Proposition</h4>
                    <p className="text-gray-700">{initiative.valueProposition}</p>
                  </div>
                )}

                {initiative.targetAudience && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Target Audience</h4>
                    <p className="text-gray-700">{initiative.targetAudience}</p>
                  </div>
                )}

                {initiative.successCriteria && initiative.successCriteria.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Success Criteria</h4>
                    <ul className="space-y-2">
                      {initiative.successCriteria.map((criteria: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {initiative.releases && initiative.releases.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Recent Release</h4>
                  <Link
                    to={`/initiatives/${id}/roadmap`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    View All Releases
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex items-start justify-between bg-gradient-to-br from-blue-50 to-white">
                  <div>
                    <h5 className="font-semibold text-gray-900">{initiative.releases[0].version}</h5>
                    <p className="text-sm text-gray-500">{formatDate(initiative.releases[0].date)}</p>
                    <p className="text-gray-700 mt-1">{initiative.releases[0].notes}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    {initiative.releases[0].status}
                  </span>
                </div>
              </div>
            )}

            {initiative.team && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Team</h4>
                  <Link
                    to={`/initiatives/${id}/team`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    Manage Team
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {initiative.team.owners && initiative.team.owners.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-white">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Owners</h5>
                      <div className="space-y-2">
                        {initiative.team.owners.slice(0, 3).map((member: any) => (
                          <div key={member.id} className="flex items-center gap-2">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-7 h-7 rounded-full"
                            />
                            <span className="text-sm text-gray-900 truncate">{member.name}</span>
                          </div>
                        ))}
                        {initiative.team.owners.length > 3 && (
                          <span className="text-xs text-gray-500">+{initiative.team.owners.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {initiative.team.coreTeam && initiative.team.coreTeam.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Core Team</h5>
                      <div className="space-y-2">
                        {initiative.team.coreTeam.slice(0, 3).map((member: any) => (
                          <div key={member.id} className="flex items-center gap-2">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-7 h-7 rounded-full"
                            />
                            <span className="text-sm text-gray-900 truncate">{member.name}</span>
                          </div>
                        ))}
                        {initiative.team.coreTeam.length > 3 && (
                          <span className="text-xs text-gray-500">+{initiative.team.coreTeam.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {initiative.team.contributors && initiative.team.contributors.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-white">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">Contributors</h5>
                      <div className="space-y-2">
                        {initiative.team.contributors.slice(0, 3).map((member: any) => (
                          <div key={member.id} className="flex items-center gap-2">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-7 h-7 rounded-full"
                            />
                            <span className="text-sm text-gray-900 truncate">{member.name}</span>
                          </div>
                        ))}
                        {initiative.team.contributors.length > 3 && (
                          <span className="text-xs text-gray-500">+{initiative.team.contributors.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {initiative.metrics && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Task Progress</div>
                    <div className="text-2xl font-bold text-gray-900">{initiative.metrics.taskProgress}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Milestone Progress</div>
                    <div className="text-2xl font-bold text-gray-900">{initiative.metrics.milestoneProgress}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Risk Index</div>
                    <div className={`text-sm font-bold capitalize px-2 py-1 rounded ${
                      initiative.metrics.riskIndex === 'low' ? 'bg-green-100 text-green-700' :
                      initiative.metrics.riskIndex === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {initiative.metrics.riskIndex}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Availability</div>
                    <div className="text-2xl font-bold text-gray-900">{initiative.metrics.availabilityIndex}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Active Users</div>
                    <div className="text-2xl font-bold text-gray-900">{initiative.metrics.activeUsers.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Performance</div>
                    <div className="text-2xl font-bold text-gray-900">{initiative.metrics.performance}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {relatedVotings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Governance & Approvals</h3>
              </div>
              <Link to="/votings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all votings
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {relatedVotings.slice(0, 3).map((voting) => (
                <VotingCard key={voting.id} voting={voting} />
              ))}
            </div>
          </div>
        )}

        {initiative.sprints && initiative.sprints.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Active Sprints</h3>
              </div>
              <Link
                to={`/initiatives/${id}/milestones`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View Roadmap
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {initiative.sprints.map((sprint: any) => (
                <Link
                  key={sprint.id}
                  to={`/milestones/${sprint.milestoneId}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">{sprint.name}</h4>
                      <p className="text-sm text-gray-600">{sprint.theme}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">
                          {sprint.completedCount}/{sprint.taskCount} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(sprint.completedCount / sprint.taskCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Participants:</span>
                    <div className="flex -space-x-2">
                      {sprint.participants.map((member: any) => (
                        <img
                          key={member.id}
                          src={member.avatar}
                          alt={member.name}
                          className="w-6 h-6 rounded-full border-2 border-white"
                          title={member.name}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <LinkIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Links, Artifacts & Repositories</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initiative.repositories && initiative.repositories.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Repositories</h4>
                <div className="space-y-2">
                  {initiative.repositories.map((repo: any, index: number) => (
                    <a
                      key={index}
                      href={`https://github.com/${repo.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {repo.path}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {initiative.links?.documentation && initiative.links.documentation.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documentation
                </h4>
                <div className="space-y-2">
                  {initiative.links.documentation.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link.split('/').pop() || 'Link'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {initiative.links?.design && initiative.links.design.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Design</h4>
                <div className="space-y-2">
                  {initiative.links.design.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Figma
                    </a>
                  ))}
                </div>
              </div>
            )}

            {initiative.links?.cicd && initiative.links.cicd.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">CI/CD</h4>
                <div className="space-y-2">
                  {initiative.links.cicd.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Pipelines
                    </a>
                  ))}
                </div>
              </div>
            )}

            {initiative.links?.monitoring && initiative.links.monitoring.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Monitoring</h4>
                <div className="space-y-2">
                  {initiative.links.monitoring.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Grafana
                    </a>
                  ))}
                </div>
              </div>
            )}

            {initiative.links?.analytics && initiative.links.analytics.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Analytics</h4>
                <div className="space-y-2">
                  {initiative.links.analytics.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Dashboard
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {initiative.environments && initiative.environments.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Environments</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {initiative.environments.map((env: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{env.name}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        env.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {env.status}
                      </span>
                    </div>
                    <a
                      href={env.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                    <p className="text-xs text-gray-500">Version: {env.version}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {showMilestoneForm && (
          <CreateMilestoneForm
            initiativeId={id!}
            onSubmit={handleCreateMilestone}
            onClose={() => setShowMilestoneForm(false)}
          />
        )}

        {showTaskForm && (
          <ProposeTaskForm
            initiativeId={id!}
            onSubmit={handleProposeTask}
            onClose={() => setShowTaskForm(false)}
          />
        )}
      </div>
    </div>
  );
}
