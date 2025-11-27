import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';
import { useMusicStore } from '../store/musicStore';
import { QRCodeDisplay } from '../components/QRCode';

export function HomePage() {
  const { device } = useAuthStore();
  const { linkedDevices } = useDeviceStore();
  const { whitelist, childPlaylists } = useMusicStore();

  if (device?.type === 'parent') {
    return <ParentHome linkedDevices={linkedDevices} whitelist={whitelist} />;
  }

  if (device?.type === 'child') {
    return <ChildHome device={device} playlists={childPlaylists} />;
  }

  return null;
}

interface ParentHomeProps {
  linkedDevices: import('../types').Device[];
  whitelist: import('../types').Whitelist | null;
}

function ParentHome({ linkedDevices, whitelist }: ParentHomeProps) {
  const childCount = linkedDevices.filter((d) => d.type === 'child').length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
        <p className="text-base-content/60">
          Manage your children's music experience
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/devices" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📱</span>
              <div>
                <h2 className="card-title">Devices</h2>
                <p className="text-base-content/60">
                  {childCount} child device{childCount !== 1 ? 's' : ''} linked
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/whitelist" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <span className="text-4xl">✅</span>
              <div>
                <h2 className="card-title">Whitelist</h2>
                <p className="text-base-content/60">
                  {whitelist?.artists.length || 0} artists,{' '}
                  {whitelist?.tracks.length || 0} tracks
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/children" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎵</span>
              <div>
                <h2 className="card-title">Children's Music</h2>
                <p className="text-base-content/60">
                  View and manage playlists
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="divider">Quick Actions</div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">Add a Child Device</h2>
            <p>Scan this QR code from a child device to link it</p>
            <div className="card-actions justify-center mt-4">
              <Link to="/device-info" className="btn btn-outline btn-sm">
                Show QR Code
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-secondary text-secondary-content">
          <div className="card-body">
            <h2 className="card-title">Curate Music</h2>
            <p>Add approved artists and songs to the whitelist</p>
            <div className="card-actions justify-center mt-4">
              <Link to="/whitelist" className="btn btn-outline btn-sm">
                Manage Whitelist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChildHomeProps {
  device: import('../types').Device;
  playlists: import('../types').Playlist[];
}

function ChildHome({ device, playlists }: ChildHomeProps) {
  const hasParent = !!device.parentDeviceId;

  if (!hasParent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center">
            <span className="text-6xl mb-4">🔗</span>
            <h1 className="card-title text-2xl">Link to a Parent</h1>
            <p className="text-base-content/60 mb-4">
              Ask a parent to scan your device code to get started
            </p>
            <QRCodeDisplay deviceId={device.id} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome! 🎶</h1>
        <p className="text-base-content/60">
          Discover and play your approved music
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Link to="/browse" className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body items-center text-center">
            <span className="text-5xl mb-2">🔍</span>
            <h2 className="card-title">Browse Music</h2>
            <p>Explore approved songs and artists</p>
          </div>
        </Link>

        <Link to="/my-playlists" className="card bg-gradient-to-br from-accent to-secondary text-accent-content shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body items-center text-center">
            <span className="text-5xl mb-2">📋</span>
            <h2 className="card-title">My Playlists</h2>
            <p>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
          </div>
        </Link>
      </div>

      {playlists.length > 0 && (
        <>
          <div className="divider">Recent Playlists</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.slice(0, 3).map((playlist) => (
              <Link
                key={playlist.id}
                to={`/my-playlists/${playlist.id}`}
                className="card card-compact bg-base-100 shadow hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <h3 className="card-title text-sm">{playlist.name}</h3>
                  <p className="text-xs text-base-content/60">
                    {playlist.tracks.length} tracks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
