import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artist, Track, Playlist, Whitelist } from '../types';

interface MusicState {
  whitelist: Whitelist | null;
  childPlaylists: Playlist[];
  searchResults: {
    artists: Artist[];
    tracks: Track[];
    playlists: Playlist[];
  };
  currentPlaylist: Playlist | null;
  isSearching: boolean;

  setWhitelist: (whitelist: Whitelist | null) => void;
  addToWhitelist: (type: 'artists' | 'tracks' | 'playlists', item: Artist | Track | Playlist) => void;
  removeFromWhitelist: (type: 'artists' | 'tracks' | 'playlists', itemId: string) => void;
  setChildPlaylists: (playlists: Playlist[]) => void;
  addChildPlaylist: (playlist: Playlist) => void;
  updateChildPlaylist: (playlist: Playlist) => void;
  removeChildPlaylist: (playlistId: string) => void;
  setSearchResults: (results: { artists: Artist[]; tracks: Track[]; playlists: Playlist[] }) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearchResults: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      whitelist: null,
      childPlaylists: [],
      searchResults: { artists: [], tracks: [], playlists: [] },
      currentPlaylist: null,
      isSearching: false,

      setWhitelist: (whitelist) => set({ whitelist }),

      addToWhitelist: (type, item) => set((state) => {
        if (!state.whitelist) return state;
        const updated = { ...state.whitelist };
        if (type === 'artists') {
          updated.artists = [...updated.artists, item as Artist];
        } else if (type === 'tracks') {
          updated.tracks = [...updated.tracks, item as Track];
        } else {
          updated.playlists = [...updated.playlists, item as Playlist];
        }
        updated.updatedAt = new Date().toISOString();
        return { whitelist: updated };
      }),

      removeFromWhitelist: (type, itemId) => set((state) => {
        if (!state.whitelist) return state;
        const updated = { ...state.whitelist };
        if (type === 'artists') {
          updated.artists = updated.artists.filter((a) => a.id !== itemId);
        } else if (type === 'tracks') {
          updated.tracks = updated.tracks.filter((t) => t.id !== itemId);
        } else {
          updated.playlists = updated.playlists.filter((p) => p.id !== itemId);
        }
        updated.updatedAt = new Date().toISOString();
        return { whitelist: updated };
      }),

      setChildPlaylists: (childPlaylists) => set({ childPlaylists }),

      addChildPlaylist: (playlist) => set((state) => ({
        childPlaylists: [...state.childPlaylists, playlist]
      })),

      updateChildPlaylist: (playlist) => set((state) => ({
        childPlaylists: state.childPlaylists.map((p) =>
          p.id === playlist.id ? playlist : p
        )
      })),

      removeChildPlaylist: (playlistId) => set((state) => ({
        childPlaylists: state.childPlaylists.filter((p) => p.id !== playlistId)
      })),

      setSearchResults: (searchResults) => set({ searchResults }),
      setCurrentPlaylist: (currentPlaylist) => set({ currentPlaylist }),
      setIsSearching: (isSearching) => set({ isSearching }),
      clearSearchResults: () => set({ searchResults: { artists: [], tracks: [], playlists: [] } }),
    }),
    {
      name: 'music-storage',
    }
  )
);
