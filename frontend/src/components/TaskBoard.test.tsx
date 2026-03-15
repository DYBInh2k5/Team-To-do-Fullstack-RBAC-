import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskBoard } from './TaskBoard';
import type { Task } from '../types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Fix critical bug',
  description: 'Something is broken.',
  deadline: '2026-12-31T00:00:00.000Z',
  status: 'TODO',
  assigneeId: 2,
  createdById: 1,
  assignee: { id: 2, email: 'bob@demo.com', name: 'Bob Smith', role: 'MEMBER' },
  createdBy: { id: 1, email: 'admin@demo.com', name: 'Alice Admin', role: 'ADMIN' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('TaskBoard', () => {
  const noop = vi.fn().mockResolvedValue(undefined);

  it('shows empty message when there are no tasks', () => {
    render(
      <TaskBoard
        tasks={[]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    expect(
      screen.getByText(/chua co task nao/i),
    ).toBeInTheDocument();
  });

  it('renders task title and assignee name', () => {
    render(
      <TaskBoard
        tasks={[makeTask()]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    expect(screen.getByText('Fix critical bug')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('shows task description', () => {
    render(
      <TaskBoard
        tasks={[makeTask()]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    expect(screen.getByText('Something is broken.')).toBeInTheDocument();
  });

  it('shows "Khong co mo ta" when description is null', () => {
    render(
      <TaskBoard
        tasks={[makeTask({ description: null })]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    expect(screen.getByText(/khong co mo ta/i)).toBeInTheDocument();
  });

  it('renders delete button only for admin', () => {
    const { rerender } = render(
      <TaskBoard
        tasks={[makeTask()]}
        isAdmin={true}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    expect(screen.getByText('Xoa')).toBeInTheDocument();

    rerender(
      <TaskBoard
        tasks={[makeTask()]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    expect(screen.queryByText('Xoa')).not.toBeInTheDocument();
  });

  it('calls onDeleteTask when Xoa button is clicked', () => {
    render(
      <TaskBoard
        tasks={[makeTask({ id: 42 })]}
        isAdmin={true}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    fireEvent.click(screen.getByText('Xoa'));
    expect(noop).toHaveBeenCalledWith(42);
  });

  it('calls onStatusChange when status select changes', () => {
    render(
      <TaskBoard
        tasks={[makeTask({ id: 5, status: 'TODO' })]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'IN_PROGRESS' },
    });

    expect(noop).toHaveBeenCalledWith(5, 'IN_PROGRESS');
  });

  it('renders correct status badge label', () => {
    render(
      <TaskBoard
        tasks={[makeTask({ status: 'IN_PROGRESS' })]}
        isAdmin={false}
        onStatusChange={noop}
        onDeleteTask={noop}
      />,
    );

    // "Dang lam" appears both in the badge <span> and the <select> option;
    // assert that the badge element specifically carries the correct class.
    const badge = document.querySelector('.badge-in_progress');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe('Dang lam');
  });
});
