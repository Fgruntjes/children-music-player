import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const parentDeviceId = context.params.parentDeviceId as string;

    const whitelist = await context.env.DB.prepare(
      'SELECT * FROM whitelists WHERE parent_device_id = ?'
    ).bind(parentDeviceId).first();

    if (!whitelist) {
      return new Response(JSON.stringify({ message: 'Whitelist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON fields
    const artists = whitelist.artists ? JSON.parse(whitelist.artists as string) : [];
    const tracks = whitelist.tracks ? JSON.parse(whitelist.tracks as string) : [];
    const playlists = whitelist.playlists ? JSON.parse(whitelist.playlists as string) : [];
    const childDeviceIds = whitelist.child_device_ids
      ? (whitelist.child_device_ids as string).split(',').filter(Boolean)
      : [];

    return new Response(JSON.stringify({
      whitelist: {
        id: whitelist.id,
        parentDeviceId: whitelist.parent_device_id,
        childDeviceIds,
        artists,
        tracks,
        playlists,
        createdAt: whitelist.created_at,
        updatedAt: whitelist.updated_at,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get whitelist error:', error);
    return new Response(JSON.stringify({ message: 'Failed to get whitelist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const parentDeviceId = context.params.parentDeviceId as string;
    const updates = await context.request.json() as {
      artists?: unknown[];
      tracks?: unknown[];
      playlists?: unknown[];
    };

    const whitelist = await context.env.DB.prepare(
      'SELECT * FROM whitelists WHERE parent_device_id = ?'
    ).bind(parentDeviceId).first();

    if (!whitelist) {
      return new Response(JSON.stringify({ message: 'Whitelist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    const newArtists = updates.artists !== undefined
      ? JSON.stringify(updates.artists)
      : whitelist.artists;
    const newTracks = updates.tracks !== undefined
      ? JSON.stringify(updates.tracks)
      : whitelist.tracks;
    const newPlaylists = updates.playlists !== undefined
      ? JSON.stringify(updates.playlists)
      : whitelist.playlists;

    await context.env.DB.prepare(
      'UPDATE whitelists SET artists = ?, tracks = ?, playlists = ?, updated_at = ? WHERE parent_device_id = ?'
    ).bind(newArtists, newTracks, newPlaylists, now, parentDeviceId).run();

    const childDeviceIds = whitelist.child_device_ids
      ? (whitelist.child_device_ids as string).split(',').filter(Boolean)
      : [];

    return new Response(JSON.stringify({
      whitelist: {
        id: whitelist.id,
        parentDeviceId,
        childDeviceIds,
        artists: updates.artists !== undefined ? updates.artists : JSON.parse((whitelist.artists as string) || '[]'),
        tracks: updates.tracks !== undefined ? updates.tracks : JSON.parse((whitelist.tracks as string) || '[]'),
        playlists: updates.playlists !== undefined ? updates.playlists : JSON.parse((whitelist.playlists as string) || '[]'),
        createdAt: whitelist.created_at,
        updatedAt: now,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update whitelist error:', error);
    return new Response(JSON.stringify({ message: 'Failed to update whitelist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
