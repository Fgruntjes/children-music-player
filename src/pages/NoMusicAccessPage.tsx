import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function NoMusicAccessPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl max-w-md w-full">
        <div className="card-body items-center text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="card-title text-2xl">No Music Access</h1>
          <p className="text-base-content/60 mb-6">
            Your Google account doesn't have access to YouTube Music. Please
            ensure you have a YouTube Music subscription and try again.
          </p>

          <div className="space-y-3 w-full">
            <a
              href="https://music.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-block"
            >
              Get YouTube Music
            </a>
            <button onClick={handleLogout} className="btn btn-ghost btn-block">
              Sign in with a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
