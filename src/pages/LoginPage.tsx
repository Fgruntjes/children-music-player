import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, setUser, setDevice, setLoading, setError, isLoading, error } = useAuthStore();
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const handleCallback = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    const result = await api.handleCallback(code);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.data) {
      setIsCheckingAccess(true);
      const accessCheck = await api.checkMusicAccess(result.data.user.accessToken);

      const user = {
        ...result.data.user,
        hasMusicAccess: accessCheck.data?.hasAccess ?? false,
      };

      setUser(user);
      setDevice(result.data.device);
      setIsCheckingAccess(false);
      setLoading(false);

      if (!user.hasMusicAccess) {
        navigate('/no-music-access');
      } else if (!result.data.device.type) {
        navigate('/device-setup');
      } else {
        navigate('/');
      }
    }
  }, [navigate, setDevice, setError, setLoading, setUser]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
    }
  }, [searchParams, handleCallback]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const result = await api.getAuthUrl();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  };

  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <LoadingSpinner size="lg" />
        <p className="text-base-content/60">
          {isCheckingAccess ? 'Checking music access...' : 'Signing in...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10">
      <div className="card bg-base-100 shadow-2xl max-w-md w-full">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="card-title text-3xl font-bold">KidTunes</h1>
          <p className="text-base-content/60 mb-6">
            Safe music streaming for children, managed by parents
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="btn btn-primary btn-lg gap-3 w-full"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs text-base-content/40 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
