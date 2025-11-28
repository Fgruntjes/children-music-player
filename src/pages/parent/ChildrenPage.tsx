import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDeviceStore } from '../../store/deviceStore';
import { useMusicStore } from '../../store/musicStore';
import { api } from '../../api/client';
import { PlaylistCard, TrackCard } from '../../components/MusicCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Playlist, Device } from '../../types';

export function ChildrenPage() {
  const { device } = useAuthStore();
  const { linkedDevices } = useDeviceStore();
  const { childPlaylists, setChildPlaylists } = useMusicStore();
  const [selectedChild, setSelectedChild] = useState<Device | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const childDevices = linkedDevices.filter((d) => d.type === 'child');

  const loadChildrenPlaylists = useCallback(async () => {
    if (!device?.id) return;
    setIsLoading(true);
    const result = await api.getChildrenPlaylists(device.id);
    if (result.data) {
      setChildPlaylists(result.data.playlists);
    }
    setIsLoading(false);
  }, [device?.id, setChildPlaylists]);

  useEffect(() => {
    if (device?.id) {
      loadChildrenPlaylists();
    }
  }, [device?.id, loadChildrenPlaylists]);

  const getPlaylistsForChild = (childId: string) => {
    return childPlaylists.filter((p) => p.ownerDeviceId === childId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (selectedPlaylist) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="btn btn-ghost gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="avatar">
                <div className="w-24 rounded-lg">
                  <img
                    src={selectedPlaylist.thumbnailUrl || '/placeholder-playlist.svg'}
                    alt={selectedPlaylist.name}
                  />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{selectedPlaylist.name}</h1>
                {selectedPlaylist.description && (
                  <p className="text-base-content/60 mt-1">
                    {selectedPlaylist.description}
                  </p>
                )}
                <p className="text-sm text-base-content/40 mt-2">
                  {selectedPlaylist.tracks.length} tracks
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {selectedPlaylist.tracks.map((track, index) => (
            <div key={track.id} className="flex items-center gap-4">
              <span className="text-base-content/40 w-6 text-right text-sm">
                {index + 1}
              </span>
              <div className="flex-1">
                <TrackCard track={track} showActions={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedChild) {
    const playlists = getPlaylistsForChild(selectedChild.id);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedChild(null)}
          className="btn btn-ghost gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to all children
        </button>

        <div>
          <h1 className="text-3xl font-bold">
            {selectedChild.name || "Child's"} Playlists
          </h1>
          <p className="text-base-content/60">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} created
          </p>
        </div>

        {playlists.length === 0 ? (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-12">
              <span className="text-5xl mb-4">🎵</span>
              <p className="text-base-content/60">
                No playlists created yet
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onView={() => setSelectedPlaylist(playlist)}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Children's Music</h1>
        <p className="text-base-content/60">
          View and manage your children's playlists
        </p>
      </div>

      {childDevices.length === 0 ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-12">
            <span className="text-5xl mb-4">👶</span>
            <h3 className="text-xl font-semibold mb-2">No Children Linked</h3>
            <p className="text-base-content/60">
              Link a child device first to see their playlists
            </p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {childDevices.map((child) => {
            const playlists = getPlaylistsForChild(child.id);
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow text-left"
              >
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">👶</span>
                    <div className="flex-1">
                      <h2 className="card-title">
                        {child.name || 'Child Device'}
                      </h2>
                      <p className="text-base-content/60 text-sm">
                        {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-base-content/40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {childPlaylists.length > 0 && (
        <>
          <div className="divider">Recent Activity</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {childPlaylists.slice(0, 8).map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onView={() => setSelectedPlaylist(playlist)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
