import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import ProposeTaskForm from '../components/ProposeTaskForm';
import TaskStatusBadge from '../components/TaskStatusBadge';
import EmptyState from '../components/EmptyState';
import { mockMilestones, mockTasks } from '../data/mockData';

const columns = [
  { id: 'proposed', title: 'Proposed', status: 'proposed' },
  { id: 'voting', title: 'Voting', status: 'voting' },
  { id: 'not_started', title: 'Not Started', status: 'not_started' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'review', title: 'Review', status: 'review' },
  { id: 'completed', title: 'Completed', status: 'completed' },
];

export default function MilestoneDetailPage() {
  const { id } = useParams();
  const [showTaskForm, setShowTaskForm] = useState(false);

  const milestone = mockMilestones.find((m) => m.id === id);
  const tasks = mockTasks.filter((t) => t.milestoneId === id);

  if (!milestone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Milestone not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to initiatives
          </Link>
        </div>
      </div>
    );
  }

  const handleProposeTask = (data: any) => {
    console.log('Proposing task:', data);
    setShowTaskForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTasksForColumn = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/initiatives/${milestone.initiativeId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to initiative
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <TaskStatusBadge status={milestone.status} />
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(milestone.startDate)} - {formatDate(milestone.dueDate)}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{milestone.name}</h1>
              <p className="text-gray-700 text-lg">{milestone.description}</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-4"
            >
              <Plus className="w-5 h-5" />
              Propose Task
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-2xl font-bold text-gray-900">{milestone.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <img
                  src={milestone.owner.avatar}
                  alt={milestone.owner.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="text-xs text-gray-500">Owner</div>
                  <div className="font-medium text-gray-900">{milestone.owner.name}</div>
                </div>
              </div>
              {milestone.contributors.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Contributors</div>
                  <div className="flex -space-x-2">
                    {milestone.contributors.map((contributor) => (
                      <img
                        key={contributor.id}
                        src={contributor.avatar}
                        alt={contributor.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                        title={contributor.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No tasks yet"
            message="Propose tasks to start working on this milestone."
            actionText="Propose Task"
            onAction={() => setShowTaskForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {columns.map((column) => {
              const columnTasks = getTasksForColumn(column.status);
              return (
                <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} draggable />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showTaskForm && (
          <ProposeTaskForm
            initiativeId={milestone.initiativeId}
            milestoneId={id}
            onSubmit={handleProposeTask}
            onClose={() => setShowTaskForm(false)}
          />
        )}
      </div>
    </div>
  );
}
