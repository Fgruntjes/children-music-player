import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusicStore } from '../../store/musicStore';
import { PlaylistCard, TrackCard } from '../../components/MusicCard';
import type { Playlist } from '../../types';

export function MyPlaylistsPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { childPlaylists, addChildPlaylist, updateChildPlaylist, removeChildPlaylist } = useMusicStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const selectedPlaylist = playlistId
    ? childPlaylists.find((p) => p.id === playlistId)
    : null;

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      description: newPlaylistDesc || undefined,
      tracks: [],
      ownerId: '',
      ownerDeviceId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addChildPlaylist(newPlaylist);
    setShowCreateModal(false);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  const handleUpdatePlaylist = () => {
    if (!editingPlaylist || !newPlaylistName.trim()) return;

    updateChildPlaylist({
      ...editingPlaylist,
      name: newPlaylistName,
      description: newPlaylistDesc || undefined,
      updatedAt: new Date().toISOString(),
    });

    setEditingPlaylist(null);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    if (confirm(`Delete "${playlist.name}"? This cannot be undone.`)) {
      removeChildPlaylist(playlist.id);
      if (selectedPlaylist?.id === playlist.id) {
        navigate('/my-playlists');
      }
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!selectedPlaylist) return;

    updateChildPlaylist({
      ...selectedPlaylist,
      tracks: selectedPlaylist.tracks.filter((t) => t.id !== trackId),
      updatedAt: new Date().toISOString(),
    });
  };

  const startEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDesc(playlist.description || '');
  };

  if (selectedPlaylist) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/my-playlists')}
          className="btn btn-ghost gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Playlists
        </button>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="avatar">
                  <div className="w-24 rounded-lg bg-gradient-to-br from-primary to-secondary">
                    <div className="flex items-center justify-center h-full text-4xl">
                      🎵
                    </div>
                  </div>
                </div>
                <div>
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
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                  <li>
                    <button onClick={() => startEdit(selectedPlaylist)}>
                      Edit Details
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleDeletePlaylist(selectedPlaylist)}
                      className="text-error"
                    >
                      Delete Playlist
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {selectedPlaylist.tracks.length === 0 ? (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-12">
              <span className="text-5xl mb-4">🎵</span>
              <h3 className="text-xl font-semibold mb-2">No Tracks Yet</h3>
              <p className="text-base-content/60 mb-4">
                Add songs from the Browse page
              </p>
              <button
                onClick={() => navigate('/browse')}
                className="btn btn-primary"
              >
                Browse Music
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedPlaylist.tracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4">
                <span className="text-base-content/40 w-6 text-right text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <TrackCard
                    track={track}
                    onRemove={() => handleRemoveTrack(track.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Playlists</h1>
          <p className="text-base-content/60">
            Your personal music collections
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + New Playlist
        </button>
      </div>

      {childPlaylists.length === 0 ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-16">
            <span className="text-6xl mb-4">📋</span>
            <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
            <p className="text-base-content/60 mb-4">
              Create your first playlist to start organizing your music
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {childPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onView={() => navigate(`/my-playlists/${playlist.id}`)}
              onEdit={() => startEdit(playlist)}
              showActions
            />
          ))}
        </div>
      )}

      {/* Create/Edit Playlist Modal */}
      {(showCreateModal || editingPlaylist) && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
            </h3>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Playlist Name</span>
              </label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="input input-bordered"
                autoFocus
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Description (optional)</span>
              </label>
              <textarea
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="What's this playlist about?"
                className="textarea textarea-bordered"
                rows={2}
              />
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPlaylist(null);
                  setNewPlaylistName('');
                  setNewPlaylistDesc('');
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}
                className="btn btn-primary"
                disabled={!newPlaylistName.trim()}
              >
                {editingPlaylist ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingPlaylist(null);
              }}
            >
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
