import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const deviceId = context.params.deviceId as string;

    const playlists = await context.env.DB.prepare(
      'SELECT * FROM playlists WHERE owner_device_id = ? ORDER BY updated_at DESC'
    ).bind(deviceId).all();

    const formattedPlaylists = playlists.results.map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      thumbnailUrl: p.thumbnail_url,
      tracks: JSON.parse((p.tracks as string) || '[]'),
      ownerId: p.owner_id,
      ownerDeviceId: p.owner_device_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return new Response(JSON.stringify({ playlists: formattedPlaylists }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    return new Response(JSON.stringify({ message: 'Failed to get playlists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
