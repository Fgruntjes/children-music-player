import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface YouTubeSearchResult {
  kind: string;
  etag: string;
  items: Array<{
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId?: string;
      channelId?: string;
      playlistId?: string;
    };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
    };
  }>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { query, accessToken, type } = await context.request.json() as {
      query: string;
      accessToken: string;
      type?: 'artist' | 'track' | 'playlist';
    };

    if (!query || !accessToken) {
      return new Response(JSON.stringify({ message: 'Query and access token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results = {
      artists: [] as Array<{ id: string; name: string; thumbnailUrl?: string }>,
      tracks: [] as Array<{
        id: string;
        title: string;
        artistName: string;
        artistId: string;
        albumName?: string;
        thumbnailUrl?: string;
      }>,
      playlists: [] as Array<{
        id: string;
        name: string;
        description?: string;
        thumbnailUrl?: string;
        tracks: [];
        ownerId: string;
        ownerDeviceId: string;
        createdAt: string;
        updatedAt: string;
      }>,
    };

    // Search for channels (artists)
    if (!type || type === 'artist') {
      const channelParams = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'channel',
        maxResults: '10',
      });

      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${channelParams}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (channelResponse.ok) {
        const channelData: YouTubeSearchResult = await channelResponse.json();
        results.artists = channelData.items.map((item) => ({
          id: item.id.channelId || item.snippet.channelId,
          name: item.snippet.channelTitle || item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        }));
      }
    }

    // Search for videos (tracks)
    if (!type || type === 'track') {
      const videoParams = new URLSearchParams({
        part: 'snippet',
        q: `${query} music`,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: '15',
      });

      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${videoParams}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (videoResponse.ok) {
        const videoData: YouTubeSearchResult = await videoResponse.json();
        results.tracks = videoData.items.map((item) => ({
          id: item.id.videoId || '',
          title: item.snippet.title,
          artistName: item.snippet.channelTitle,
          artistId: item.snippet.channelId,
          thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        }));
      }
    }

    // Search for playlists
    if (!type || type === 'playlist') {
      const playlistParams = new URLSearchParams({
        part: 'snippet',
        q: `${query} music playlist`,
        type: 'playlist',
        maxResults: '10',
      });

      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${playlistParams}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (playlistResponse.ok) {
        const playlistData: YouTubeSearchResult = await playlistResponse.json();
        results.playlists = playlistData.items.map((item) => ({
          id: item.id.playlistId || '',
          name: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          tracks: [],
          ownerId: item.snippet.channelId,
          ownerDeviceId: '',
          createdAt: item.snippet.publishedAt,
          updatedAt: item.snippet.publishedAt,
        }));
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Music search error:', error);
    return new Response(JSON.stringify({
      message: 'Failed to search music',
      artists: [],
      tracks: [],
      playlists: [],
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
