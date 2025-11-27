import { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMusicStore } from '../../store/musicStore';
import { api } from '../../api/client';
import { SearchBar } from '../../components/SearchBar';
import { ArtistCard, TrackCard, PlaylistCard } from '../../components/MusicCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Artist, Track, Playlist } from '../../types';

type Tab = 'artists' | 'tracks' | 'playlists';

export function WhitelistPage() {
  const { user, device } = useAuthStore();
  const {
    whitelist,
    searchResults,
    isSearching,
    addToWhitelist,
    removeFromWhitelist,
    setSearchResults,
    setIsSearching,
    clearSearchResults,
  } = useMusicStore();

  const [activeTab, setActiveTab] = useState<Tab>('artists');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!user?.accessToken) return;

      setIsSearching(true);
      clearSearchResults();

      const result = await api.searchMusic(query, user.accessToken);

      if (result.data) {
        setSearchResults(result.data);
      }

      setIsSearching(false);
    },
    [user?.accessToken, setIsSearching, clearSearchResults, setSearchResults]
  );

  const handleAddArtist = (artist: Artist) => {
    addToWhitelist('artists', artist);
    if (device?.id) {
      api.updateWhitelist(device.id, {
        artists: [...(whitelist?.artists || []), artist],
      });
    }
  };

  const handleRemoveArtist = (artistId: string) => {
    removeFromWhitelist('artists', artistId);
    if (device?.id && whitelist) {
      api.updateWhitelist(device.id, {
        artists: whitelist.artists.filter((a) => a.id !== artistId),
      });
    }
  };

  const handleAddTrack = (track: Track) => {
    addToWhitelist('tracks', track);
    if (device?.id) {
      api.updateWhitelist(device.id, {
        tracks: [...(whitelist?.tracks || []), track],
      });
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    removeFromWhitelist('tracks', trackId);
    if (device?.id && whitelist) {
      api.updateWhitelist(device.id, {
        tracks: whitelist.tracks.filter((t) => t.id !== trackId),
      });
    }
  };

  const handleAddPlaylist = (playlist: Playlist) => {
    addToWhitelist('playlists', playlist);
    if (device?.id) {
      api.updateWhitelist(device.id, {
        playlists: [...(whitelist?.playlists || []), playlist],
      });
    }
  };

  const handleRemovePlaylist = (playlistId: string) => {
    removeFromWhitelist('playlists', playlistId);
    if (device?.id && whitelist) {
      api.updateWhitelist(device.id, {
        playlists: whitelist.playlists.filter((p) => p.id !== playlistId),
      });
    }
  };

  const isInWhitelist = (type: Tab, id: string): boolean => {
    if (!whitelist) return false;
    switch (type) {
      case 'artists':
        return whitelist.artists.some((a) => a.id === id);
      case 'tracks':
        return whitelist.tracks.some((t) => t.id === id);
      case 'playlists':
        return whitelist.playlists.some((p) => p.id === id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Music Whitelist</h1>
          <p className="text-base-content/60">
            Curate approved music for your children
          </p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`btn ${showSearch ? 'btn-ghost' : 'btn-primary'}`}
        >
          {showSearch ? 'Cancel' : '+ Add Music'}
        </button>
      </div>

      {showSearch && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Search Music</h3>
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />

            {isSearching && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {!isSearching && searchResults.artists.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Artists</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {searchResults.artists.slice(0, 8).map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onAdd={
                        !isInWhitelist('artists', artist.id)
                          ? () => handleAddArtist(artist)
                          : undefined
                      }
                      showActions={!isInWhitelist('artists', artist.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isSearching && searchResults.tracks.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Tracks</h4>
                <div className="space-y-2">
                  {searchResults.tracks.slice(0, 10).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      onAdd={
                        !isInWhitelist('tracks', track.id)
                          ? () => handleAddTrack(track)
                          : undefined
                      }
                      showActions={!isInWhitelist('tracks', track.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isSearching && searchResults.playlists.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Playlists</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {searchResults.playlists.slice(0, 8).map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onAdd={
                        !isInWhitelist('playlists', playlist.id)
                          ? () => handleAddPlaylist(playlist)
                          : undefined
                      }
                      showActions={!isInWhitelist('playlists', playlist.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div role="tablist" className="tabs tabs-boxed bg-base-100 p-1">
        <button
          role="tab"
          className={`tab ${activeTab === 'artists' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('artists')}
        >
          Artists ({whitelist?.artists.length || 0})
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'tracks' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          Tracks ({whitelist?.tracks.length || 0})
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'playlists' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists ({whitelist?.playlists.length || 0})
        </button>
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'artists' && (
          <div>
            {whitelist?.artists.length === 0 ? (
              <EmptyState
                icon="🎤"
                title="No artists yet"
                description="Add artists to allow your children to listen to their music"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {whitelist?.artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onRemove={() => handleRemoveArtist(artist.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div>
            {whitelist?.tracks.length === 0 ? (
              <EmptyState
                icon="🎵"
                title="No tracks yet"
                description="Add individual tracks to the whitelist"
              />
            ) : (
              <div className="space-y-2">
                {whitelist?.tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onRemove={() => handleRemoveTrack(track.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            {whitelist?.playlists.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No playlists yet"
                description="Add playlists for your children to enjoy"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {whitelist?.playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onRemove={() => handleRemovePlaylist(playlist.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-base-content/60">{description}</p>
    </div>
  );
}
