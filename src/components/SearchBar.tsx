import { useState, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = 'Search music...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="join w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input input-bordered join-item flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn btn-primary join-item"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
