import type { Task, TaskStatus } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  isAdmin: boolean;
  onStatusChange: (taskId: number, status: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
}

const labels: Record<TaskStatus, string> = {
  TODO: 'Can lam',
  IN_PROGRESS: 'Dang lam',
  DONE: 'Hoan thanh',
};

export function TaskBoard({
  tasks,
  isAdmin,
  onStatusChange,
  onDeleteTask,
}: TaskBoardProps) {
  if (!tasks.length) {
    return <p className="empty">Chua co task nao phu hop voi tai khoan nay.</p>;
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <article className="task-card" key={task.id}>
          <div className="task-head">
            <h3>{task.title}</h3>
            <span className={`badge badge-${task.status.toLowerCase()}`}>
              {labels[task.status]}
            </span>
          </div>

          <p className="task-desc">{task.description ?? 'Khong co mo ta.'}</p>

          <dl>
            <div>
              <dt>Deadline</dt>
              <dd>{new Date(task.deadline).toLocaleString('vi-VN')}</dd>
            </div>
            <div>
              <dt>Nguoi duoc giao</dt>
              <dd>{task.assignee.name}</dd>
            </div>
            <div>
              <dt>Tao boi</dt>
              <dd>{task.createdBy.name}</dd>
            </div>
          </dl>

          <div className="task-actions">
            <select
              value={task.status}
              onChange={(event) =>
                void onStatusChange(task.id, event.target.value as TaskStatus)
              }
            >
              <option value="TODO">Can lam</option>
              <option value="IN_PROGRESS">Dang lam</option>
              <option value="DONE">Hoan thanh</option>
            </select>

            {isAdmin ? (
              <button
                type="button"
                className="danger"
                onClick={() => void onDeleteTask(task.id)}
              >
                Xoa
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
