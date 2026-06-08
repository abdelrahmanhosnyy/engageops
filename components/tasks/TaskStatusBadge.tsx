import { TaskStatus } from '@/types'

const styles: Record<TaskStatus, string> = {
  'Not Started':        'bg-slate-100 text-slate-600',
  'In Progress':        'bg-blue-50 text-blue-700',
  'Waiting for Client': 'bg-amber-50 text-amber-700',
  'Done':               'bg-green-50 text-green-700',
}

export default function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}