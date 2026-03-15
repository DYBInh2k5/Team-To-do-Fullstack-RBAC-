import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthPage } from './AuthPage';

// Mock the useAuth hook
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    logout: vi.fn(),
    isBootstrapping: false,
  }),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockRegister.mockReset();
  });

  it('renders login form by default', () => {
    render(<AuthPage />);

    expect(screen.getByText('Dang nhap he thong')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Toi thieu 6 ky tu')).toBeInTheDocument();
    // Name field should not be visible in login mode
    expect(screen.queryByPlaceholderText('Nguyen Van A')).not.toBeInTheDocument();
  });

  it('switches to register mode when Dang ky button is clicked', () => {
    render(<AuthPage />);

    fireEvent.click(screen.getByText('Dang ky'));

    expect(screen.getByText('Tao tai khoan moi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nguyen Van A')).toBeInTheDocument();
  });

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<AuthPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'admin@demo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Toi thieu 6 ky tu'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.click(screen.getByText('Vao dashboard'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@demo.com',
        password: 'Admin123!',
      });
    });
  });

  it('calls register with name, email and password in register mode', async () => {
    mockRegister.mockResolvedValue(undefined);
    render(<AuthPage />);

    fireEvent.click(screen.getByText('Dang ky'));

    fireEvent.change(screen.getByPlaceholderText('Nguyen Van A'), {
      target: { value: 'Carol Jones' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'carol@demo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Toi thieu 6 ky tu'), {
      target: { value: 'Member123!' },
    });
    fireEvent.click(screen.getByText('Tao tai khoan'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Carol Jones',
        email: 'carol@demo.com',
        password: 'Member123!',
      });
    });
  });

  it('shows error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Unauthorized'));
    render(<AuthPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'bad@demo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Toi thieu 6 ky tu'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByText('Vao dashboard'));

    await waitFor(() => {
      expect(
        screen.getByText(/thong tin khong hop le/i),
      ).toBeInTheDocument();
    });
  });
});
