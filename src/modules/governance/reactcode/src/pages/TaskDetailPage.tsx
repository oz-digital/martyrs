import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Flag, Tag, User, Clock, DollarSign, GitBranch, GitMerge, CheckCircle, XCircle, Rocket, Shield, Users, Vote, Link as LinkIcon } from 'lucide-react';
import TaskStatusBadge from '../components/TaskStatusBadge';
import TaskAssignForm from '../components/TaskAssignForm';
import { mockTasks, mockInitiatives, mockMilestones, mockVotings } from '../data/mockData';

export default function TaskDetailPage() {
  const { id } = useParams();
  const [showAssignForm, setShowAssignForm] = useState(false);

  const task = mockTasks.find((t) => t.id === id);
  const initiative = task ? mockInitiatives.find((i) => i.id === task.initiativeId) : null;
  const milestone = task ? mockMilestones.find((m) => m.id === task.milestoneId) : null;
  const startVoting = task?.startVotingId ? mockVotings.find((v) => v.id === task.startVotingId) : null;
  const approvalVoting = task?.approvalVotingId ? mockVotings.find((v) => v.id === task.approvalVotingId) : null;

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to initiatives
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAssignToMe = () => {
    console.log('Assigning task to current user');
  };

  const handleSubmitForReview = () => {
    console.log('Submitting task for review');
  };

  const handleCompleteTask = () => {
    console.log('Completing task');
  };

  const handleAssignTask = (userId: string) => {
    console.log('Assigning task to user:', userId);
    setShowAssignForm(false);
  };

  const handleMerge = () => {
    console.log('Merging changes');
  };

  const handleApproveBudget = () => {
    console.log('Approving budget');
  };

  const handleDeploy = () => {
    console.log('Deploying changes');
  };

  const handleVeto = () => {
    console.log('Vetoing task');
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
    medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    high: { label: 'High', color: 'text-red-600', bg: 'bg-red-100' },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={milestone ? `/milestones/${milestone.id}` : `/initiatives/${task.initiativeId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to {milestone ? 'milestone' : 'initiative'}
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <TaskStatusBadge status={task.status} />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}>
                    <Flag className="w-3 h-3 inline mr-1" />
                    {priority.label} Priority
                  </span>
                  {task.passed && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Passed
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">Assignee</div>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="font-medium text-gray-900">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-gray-500 block">Unassigned</span>
                          {task.status === 'not_started' && (
                            <div className="flex gap-2">
                              <button
                                onClick={handleAssignToMe}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                              >
                                Assign to Me
                              </button>
                              <button
                                onClick={() => setShowAssignForm(true)}
                                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                              >
                                Assign to User
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Created / Due Date</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(task.createdAt)} → {formatDate(task.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-900">Repository Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Project</div>
                  <div className="font-medium text-gray-900">{task.project}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Repository</div>
                  <div className="font-medium text-gray-900">{task.repository}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Branch</div>
                  <div className="font-medium text-gray-900">{task.branch || 'Not created'}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  {task.mergeRequests.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Merge Requests</div>
                      <div className="flex flex-wrap gap-2">
                        {task.mergeRequests.map((mr) => (
                          <span
                            key={mr}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-1"
                          >
                            <GitMerge className="w-3 h-3" />
                            {mr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {task.permissions.merge && (
                    <button
                      onClick={handleMerge}
                      className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <GitMerge className="w-4 h-4" />
                      Merge
                    </button>
                  )}
                  {task.permissions.deploy && (
                    <button
                      onClick={handleDeploy}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Deploy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {(initiative || milestone) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">Part Of</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {initiative && (
                <Link
                  to={`/initiatives/${initiative.id}`}
                  className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="text-xs text-blue-600 font-medium mb-1">Initiative</div>
                  <div className="font-semibold text-gray-900">{initiative.title}</div>
                </Link>
              )}
              {milestone && (
                <Link
                  to={`/milestones/${milestone.id}`}
                  className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="text-xs text-green-600 font-medium mb-1">Milestone</div>
                  <div className="font-semibold text-gray-900">{milestone.name}</div>
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Task Governance & Budget</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Task Acceptance</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {task.startVotingId ? (
                    <span>This task requires <span className="font-semibold text-blue-700">public voting</span> to start work.</span>
                  ) : (
                    <span>Team members can start working on this task directly.</span>
                  )}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Approval Process</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {task.approvalVotingId ? (
                    <span>Task completion requires <span className="font-semibold text-blue-700">public voting approval</span>.</span>
                  ) : (
                    <span>Task completion is approved by team members.</span>
                  )}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Decision Making</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Governance Type:</span>
                    <span className="font-medium text-gray-900">
                      {task.visibility.type === 'public' ? 'Community-based' : 'Team-based'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility:</span>
                    <span className="font-medium text-gray-900 capitalize">{task.visibility.type}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-gray-700" />
                  <h4 className="text-sm font-semibold text-gray-900">Budget</h4>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {task.budget.amount} {task.budget.currency}
                    </div>
                  </div>
                  <div>
                    {task.budget.approved ? (
                      <span className="flex items-center gap-1 text-green-700 font-medium text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-700 font-medium text-sm">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                {task.permissions.budget && !task.budget.approved && (
                  <button
                    onClick={handleApproveBudget}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Approve Budget
                  </button>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Merge Rights</span>
                    {task.permissions.merge ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget Approval</span>
                    {task.permissions.budget ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deploy Rights</span>
                    {task.permissions.deploy ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Veto Power</span>
                    {task.permissions.veto ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {task.permissions.veto && (
                  <button
                    onClick={handleVeto}
                    className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Veto Task
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Vote className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Governance & Voting</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50">
              <div className="text-xs font-semibold text-blue-700 uppercase mb-3">Start Voting</div>
              {startVoting ? (
                <>
                  <Link
                    to={`/votings/${startVoting.id}`}
                    className="block hover:bg-blue-100 -m-5 p-5 rounded-lg transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{startVoting.title}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <TaskStatusBadge status={startVoting.status} />
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Yes: {startVoting.yesVotes}</span>
                        <span>No: {startVoting.noVotes}</span>
                        <span>Abstain: {startVoting.abstainVotes}</span>
                      </div>
                    </div>
                  </Link>
                  {startVoting.status === 'approved' && task.status === 'not_started' && task.assignee && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <button
                        onClick={handleSubmitForReview}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Begin Work
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-gray-600 text-sm mb-3">No start voting required. Team members can begin work directly.</p>
                  {task.status === 'proposed' && (
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Create Start Voting
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="border-2 border-green-200 rounded-lg p-5 bg-green-50">
              <div className="text-xs font-semibold text-green-700 uppercase mb-3">Approval Voting</div>
              {approvalVoting ? (
                <>
                  <Link
                    to={`/votings/${approvalVoting.id}`}
                    className="block hover:bg-green-100 -m-5 p-5 rounded-lg transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{approvalVoting.title}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <TaskStatusBadge status={approvalVoting.status} />
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Yes: {approvalVoting.yesVotes}</span>
                        <span>No: {approvalVoting.noVotes}</span>
                        <span>Abstain: {approvalVoting.abstainVotes}</span>
                      </div>
                    </div>
                  </Link>
                  {approvalVoting.status === 'approved' && task.status === 'review' && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <button
                        onClick={handleCompleteTask}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Complete Task
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-gray-600 text-sm mb-3">Not submitted for approval yet.</p>
                  {task.status === 'in_progress' && task.assignee && (
                    <button
                      onClick={handleSubmitForReview}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Submit for Review
                    </button>
                  )}
                  {task.status === 'review' && (
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Create Approval Voting
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {showAssignForm && (
          <TaskAssignForm
            taskId={id!}
            onSubmit={handleAssignTask}
            onClose={() => setShowAssignForm(false)}
          />
        )}
      </div>
    </div>
  );
}
