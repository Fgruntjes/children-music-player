import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const { user, device, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <nav className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-bold">
            <span className="text-primary">♪</span> KidTunes
          </Link>
        </div>
        {user && (
          <div className="flex-none gap-2">
            {device?.type === 'parent' && (
              <ul className="menu menu-horizontal px-1 hidden sm:flex">
                <li>
                  <Link
                    to="/whitelist"
                    className={isActive('/whitelist') ? 'active' : ''}
                  >
                    Whitelist
                  </Link>
                </li>
                <li>
                  <Link
                    to="/devices"
                    className={isActive('/devices') ? 'active' : ''}
                  >
                    Devices
                  </Link>
                </li>
                <li>
                  <Link
                    to="/children"
                    className={isActive('/children') ? 'active' : ''}
                  >
                    Children
                  </Link>
                </li>
              </ul>
            )}
            {device?.type === 'child' && (
              <ul className="menu menu-horizontal px-1 hidden sm:flex">
                <li>
                  <Link
                    to="/browse"
                    className={isActive('/browse') ? 'active' : ''}
                  >
                    Browse
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-playlists"
                    className={isActive('/my-playlists') ? 'active' : ''}
                  >
                    My Playlists
                  </Link>
                </li>
              </ul>
            )}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img alt={user.name} src={user.picture} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
              >
                <li className="menu-title">
                  <span>{user.name}</span>
                </li>
                <li>
                  <Link to="/device-info">Device Info</Link>
                </li>
                <li>
                  <button onClick={logout} className="text-error">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Outlet />
      </main>

      <footer className="footer footer-center p-4 bg-base-100 text-base-content">
        <aside>
          <p>KidTunes - Safe music for children</p>
        </aside>
      </footer>
    </div>
  );
}
