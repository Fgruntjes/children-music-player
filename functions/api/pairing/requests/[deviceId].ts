import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const deviceId = context.params.deviceId as string;

    // Get requests where this device is the parent
    const requests = await context.env.DB.prepare(
      'SELECT * FROM pairing_requests WHERE parent_device_id = ? ORDER BY created_at DESC'
    ).bind(deviceId).all();

    const formattedRequests = requests.results.map((r: Record<string, unknown>) => ({
      id: r.id,
      childDeviceId: r.child_device_id,
      parentDeviceId: r.parent_device_id,
      status: r.status,
      createdAt: r.created_at,
    }));

    return new Response(JSON.stringify({ requests: formattedRequests }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get pairing requests error:', error);
    return new Response(JSON.stringify({ message: 'Failed to get pairing requests' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
