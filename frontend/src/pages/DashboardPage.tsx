import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { TaskBoard } from '../components/TaskBoard';
import { useAuth } from '../context/useAuth';
import {
  createTask,
  deleteTask,
  getTasks,
  getUsers,
  updateTaskStatus,
} from '../lib/api';
import type { Task, TaskStatus, User } from '../types';

interface CreateTaskForm {
  title: string;
  description: string;
  deadline: string;
  assigneeId: string;
}

const initialForm: CreateTaskForm = {
  title: '',
  description: '',
  deadline: '',
  assigneeId: '',
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<CreateTaskForm>(initialForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const tasksData = await getTasks();
      setTasks(tasksData);
      if (isAdmin) {
        const usersData = await getUsers();
        setUsers(usersData);
      }
    } catch {
      setError('Khong the tai du lieu. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function onCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.assigneeId || !form.deadline) {
      setError('Vui long nhap deadline va chon nguoi duoc giao.');
      return;
    }

    try {
      setError('');
      await createTask({
        title: form.title,
        description: form.description,
        deadline: new Date(form.deadline).toISOString(),
        assigneeId: Number(form.assigneeId),
      });
      setForm(initialForm);
      setInfo('Da tao task thanh cong.');
      await loadData();
    } catch {
      setError('Tao task that bai. Kiem tra quyen hoac du lieu dau vao.');
    }
  }

  async function onStatusChange(taskId: number, status: TaskStatus) {
    try {
      await updateTaskStatus(taskId, status);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status } : task)),
      );
    } catch {
      setError('Cap nhat trang thai khong thanh cong.');
    }
  }

  async function onDeleteTask(taskId: number) {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch {
      setError('Xoa task that bai.');
    }
  }

  const assigneeOptions = useMemo(
    () => users.filter((member) => member.role === 'MEMBER'),
    [users],
  );

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Team To-do Dashboard</p>
          <h1>
            Xin chao, {user?.name} ({user?.role})
          </h1>
        </div>
        <button type="button" className="ghost" onClick={logout}>
          Dang xuat
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {info ? <p className="info-text">{info}</p> : null}

      {isAdmin ? (
        <section className="create-box">
          <h2>Tao task moi</h2>
          <form className="create-form" onSubmit={(event) => void onCreateTask(event)}>
            <label>
              Tieu de
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </label>

            <label>
              Mo ta
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>

            <label>
              Deadline
              <input
                required
                type="datetime-local"
                value={form.deadline}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, deadline: event.target.value }))
                }
              />
            </label>

            <label>
              Giao cho
              <select
                required
                value={form.assigneeId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, assigneeId: event.target.value }))
                }
              >
                <option value="">Chon thanh vien</option>
                {assigneeOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="primary">
              Tao task
            </button>
          </form>
        </section>
      ) : null}

      <section className="task-box">
        <div className="section-head">
          <h2>{isAdmin ? 'Tat ca tasks' : 'Tasks cua ban'}</h2>
          <button type="button" className="ghost" onClick={() => void loadData()}>
            Lam moi
          </button>
        </div>

        {loading ? (
          <p className="empty">Dang tai du lieu...</p>
        ) : (
          <TaskBoard
            tasks={tasks}
            isAdmin={isAdmin}
            onStatusChange={onStatusChange}
            onDeleteTask={onDeleteTask}
          />
        )}
      </section>
    </main>
  );
}
