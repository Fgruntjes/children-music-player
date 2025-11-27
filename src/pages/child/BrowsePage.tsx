import { useState, useMemo } from 'react';
import { useMusicStore } from '../../store/musicStore';
import { SearchBar } from '../../components/SearchBar';
import { ArtistCard, TrackCard, PlaylistCard } from '../../components/MusicCard';
import type { Track, Playlist } from '../../types';

type Tab = 'all' | 'artists' | 'tracks' | 'playlists';

export function BrowsePage() {
  const { whitelist, addChildPlaylist, childPlaylists } = useMusicStore();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<Track | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const filteredContent = useMemo(() => {
    if (!whitelist) return { artists: [], tracks: [], playlists: [] };

    const query = searchQuery.toLowerCase();

    return {
      artists: whitelist.artists.filter((a) =>
        a.name.toLowerCase().includes(query)
      ),
      tracks: whitelist.tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artistName.toLowerCase().includes(query)
      ),
      playlists: whitelist.playlists.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      ),
    };
  }, [whitelist, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToPlaylist = (track: Track, playlistId?: string) => {
    if (playlistId) {
      const playlist = childPlaylists.find((p) => p.id === playlistId);
      if (playlist) {
        const updatedPlaylist = {
          ...playlist,
          tracks: [...playlist.tracks, track],
          updatedAt: new Date().toISOString(),
        };
        useMusicStore.getState().updateChildPlaylist(updatedPlaylist);
      }
    }
    setShowAddToPlaylist(null);
  };

  const handleCreatePlaylistWithTrack = (track: Track) => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      tracks: [track],
      ownerId: '',
      ownerDeviceId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addChildPlaylist(newPlaylist);
    setShowAddToPlaylist(null);
    setNewPlaylistName('');
  };

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
              <div>
                <h1 className="text-2xl font-bold">{selectedPlaylist.name}</h1>
                {selectedPlaylist.description && (
                  <p className="text-base-content/60">{selectedPlaylist.description}</p>
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
                <TrackCard
                  track={track}
                  onAdd={() => setShowAddToPlaylist(track)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasNoContent =
    !whitelist ||
    (whitelist.artists.length === 0 &&
      whitelist.tracks.length === 0 &&
      whitelist.playlists.length === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Music</h1>
        <p className="text-base-content/60">
          Explore your approved music collection
        </p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search artists, songs, or playlists..."
      />

      {hasNoContent ? (
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center py-16">
            <span className="text-6xl mb-4">🎵</span>
            <h3 className="text-xl font-semibold mb-2">No Music Yet</h3>
            <p className="text-base-content/60">
              Ask a parent to add music to your whitelist
            </p>
          </div>
        </div>
      ) : (
        <>
          <div role="tablist" className="tabs tabs-boxed bg-base-100 p-1">
            <button
              role="tab"
              className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === 'artists' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              Artists ({filteredContent.artists.length})
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === 'tracks' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('tracks')}
            >
              Tracks ({filteredContent.tracks.length})
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === 'playlists' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('playlists')}
            >
              Playlists ({filteredContent.playlists.length})
            </button>
          </div>

          <div className="min-h-[300px]">
            {(activeTab === 'all' || activeTab === 'artists') &&
              filteredContent.artists.length > 0 && (
                <div className="mb-8">
                  {activeTab === 'all' && (
                    <h2 className="text-xl font-semibold mb-4">Artists</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredContent.artists.map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} showActions={false} />
                    ))}
                  </div>
                </div>
              )}

            {(activeTab === 'all' || activeTab === 'tracks') &&
              filteredContent.tracks.length > 0 && (
                <div className="mb-8">
                  {activeTab === 'all' && (
                    <h2 className="text-xl font-semibold mb-4">Tracks</h2>
                  )}
                  <div className="space-y-2">
                    {filteredContent.tracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        onAdd={() => setShowAddToPlaylist(track)}
                      />
                    ))}
                  </div>
                </div>
              )}

            {(activeTab === 'all' || activeTab === 'playlists') &&
              filteredContent.playlists.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2 className="text-xl font-semibold mb-4">Playlists</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredContent.playlists.map((playlist) => (
                      <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        onView={() => setSelectedPlaylist(playlist)}
                        showActions
                      />
                    ))}
                  </div>
                </div>
              )}

            {searchQuery &&
              filteredContent.artists.length === 0 &&
              filteredContent.tracks.length === 0 &&
              filteredContent.playlists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-4">🔍</span>
                  <h3 className="text-xl font-semibold mb-2">No Results</h3>
                  <p className="text-base-content/60">
                    Try a different search term
                  </p>
                </div>
              )}
          </div>
        </>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add to Playlist</h3>
            <p className="text-sm text-base-content/60 mb-4">
              Adding: {showAddToPlaylist.title}
            </p>

            {childPlaylists.length > 0 && (
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium">Your Playlists</p>
                {childPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(showAddToPlaylist, playlist.id)}
                    className="btn btn-ghost btn-block justify-start"
                  >
                    <span className="text-lg">📋</span>
                    {playlist.name}
                    <span className="badge badge-sm ml-auto">
                      {playlist.tracks.length}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="divider">Or create new</div>

            <div className="form-control">
              <div className="join w-full">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New playlist name"
                  className="input input-bordered join-item flex-1"
                />
                <button
                  onClick={() => handleCreatePlaylistWithTrack(showAddToPlaylist)}
                  className="btn btn-primary join-item"
                  disabled={!newPlaylistName.trim()}
                >
                  Create
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setShowAddToPlaylist(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowAddToPlaylist(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
