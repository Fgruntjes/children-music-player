import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const playlist = await context.request.json() as {
      name: string;
      description?: string;
      tracks: unknown[];
      ownerId: string;
      ownerDeviceId: string;
      thumbnailUrl?: string;
    };

    if (!playlist.name || !playlist.ownerDeviceId) {
      return new Response(JSON.stringify({ message: 'Playlist name and owner device ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const playlistId = `pl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    await context.env.DB.prepare(`
      INSERT INTO playlists (id, name, description, thumbnail_url, tracks, owner_id, owner_device_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      playlistId,
      playlist.name,
      playlist.description || null,
      playlist.thumbnailUrl || null,
      JSON.stringify(playlist.tracks || []),
      playlist.ownerId,
      playlist.ownerDeviceId,
      now,
      now
    ).run();

    return new Response(JSON.stringify({
      playlist: {
        id: playlistId,
        name: playlist.name,
        description: playlist.description,
        thumbnailUrl: playlist.thumbnailUrl,
        tracks: playlist.tracks || [],
        ownerId: playlist.ownerId,
        ownerDeviceId: playlist.ownerDeviceId,
        createdAt: now,
        updatedAt: now,
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    return new Response(JSON.stringify({ message: 'Failed to create playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
