import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const parentDeviceId = context.params.parentDeviceId as string;

    // Get all child devices linked to this parent
    const childDevices = await context.env.DB.prepare(
      'SELECT id FROM devices WHERE parent_device_id = ?'
    ).bind(parentDeviceId).all();

    if (childDevices.results.length === 0) {
      return new Response(JSON.stringify({ playlists: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const childIds = childDevices.results.map((d: { id: string }) => d.id);

    // Get all playlists from child devices
    const placeholders = childIds.map(() => '?').join(',');
    const playlists = await context.env.DB.prepare(
      `SELECT * FROM playlists WHERE owner_device_id IN (${placeholders}) ORDER BY updated_at DESC`
    ).bind(...childIds).all();

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
    console.error('Get children playlists error:', error);
    return new Response(JSON.stringify({ message: 'Failed to get children playlists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
