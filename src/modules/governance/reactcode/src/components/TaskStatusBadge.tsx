interface TaskStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  proposed: { label: 'Proposed', color: 'bg-gray-100 text-gray-700' },
  voting: { label: 'Voting', color: 'bg-blue-100 text-blue-700' },
  not_started: { label: 'Not Started', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-200 text-gray-600' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', color: 'bg-gray-200 text-gray-600' },
};

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.proposed;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
