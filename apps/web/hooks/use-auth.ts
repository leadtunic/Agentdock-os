import { useAuthStore } from '@/lib/store';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    setUser,
  };
}
