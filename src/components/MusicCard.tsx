import type { Artist, Track, Playlist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  onAdd?: () => void;
  onRemove?: () => void;
  showActions?: boolean;
}

export function ArtistCard({ artist, onAdd, onRemove, showActions = true }: ArtistCardProps) {
  return (
    <div className="card card-compact bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <figure className="aspect-square">
        <img
          src={artist.thumbnailUrl || '/placeholder-artist.svg'}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h3 className="card-title text-sm line-clamp-2">{artist.name}</h3>
        {showActions && (
          <div className="card-actions justify-end">
            {onAdd && (
              <button onClick={onAdd} className="btn btn-primary btn-xs">
                Add
              </button>
            )}
            {onRemove && (
              <button onClick={onRemove} className="btn btn-error btn-xs btn-outline">
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TrackCardProps {
  track: Track;
  onAdd?: () => void;
  onRemove?: () => void;
  onPlay?: () => void;
  showActions?: boolean;
}

export function TrackCard({ track, onAdd, onRemove, onPlay, showActions = true }: TrackCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="avatar">
        <div className="w-12 h-12 rounded">
          <img
            src={track.thumbnailUrl || '/placeholder-track.svg'}
            alt={track.title}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{track.title}</h4>
        <p className="text-xs text-base-content/60 truncate">{track.artistName}</p>
      </div>
      {showActions && (
        <div className="flex gap-2">
          {onPlay && (
            <button onClick={onPlay} className="btn btn-circle btn-sm btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} className="btn btn-primary btn-xs">
              Add
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} className="btn btn-error btn-xs btn-outline">
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
  onView?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export function PlaylistCard({
  playlist,
  onView,
  onAdd,
  onRemove,
  onEdit,
  showActions = true,
}: PlaylistCardProps) {
  return (
    <div className="card card-compact bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <figure className="aspect-square relative">
        <img
          src={playlist.thumbnailUrl || '/placeholder-playlist.svg'}
          alt={playlist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 badge badge-neutral">
          {playlist.tracks.length} tracks
        </div>
      </figure>
      <div className="card-body">
        <h3 className="card-title text-sm line-clamp-1">{playlist.name}</h3>
        {playlist.description && (
          <p className="text-xs text-base-content/60 line-clamp-2">
            {playlist.description}
          </p>
        )}
        {showActions && (
          <div className="card-actions justify-end mt-2">
            {onView && (
              <button onClick={onView} className="btn btn-ghost btn-xs">
                View
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} className="btn btn-ghost btn-xs">
                Edit
              </button>
            )}
            {onAdd && (
              <button onClick={onAdd} className="btn btn-primary btn-xs">
                Add
              </button>
            )}
            {onRemove && (
              <button onClick={onRemove} className="btn btn-error btn-xs btn-outline">
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
