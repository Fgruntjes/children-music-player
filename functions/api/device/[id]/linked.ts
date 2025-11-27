import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const deviceId = context.params.id as string;

    const device = await context.env.DB.prepare(
      'SELECT * FROM devices WHERE id = ?'
    ).bind(deviceId).first();

    if (!device) {
      return new Response(JSON.stringify({ message: 'Device not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let linkedDevices: unknown[] = [];

    if (device.type === 'parent') {
      // Get all child devices
      const children = await context.env.DB.prepare(
        'SELECT * FROM devices WHERE parent_device_id = ?'
      ).bind(deviceId).all();

      // Get other parent devices that share children
      const otherParents = await context.env.DB.prepare(`
        SELECT DISTINCT d2.* FROM devices d1
        JOIN devices d2 ON d1.parent_device_id = d2.id OR d2.parent_device_id = d1.id
        WHERE d1.parent_device_id = ? AND d2.id != ? AND d2.type = 'parent'
      `).bind(deviceId, deviceId).all();

      linkedDevices = [...children.results, ...otherParents.results];
    } else if (device.type === 'child' && device.parent_device_id) {
      // Get parent device
      const parent = await context.env.DB.prepare(
        'SELECT * FROM devices WHERE id = ?'
      ).bind(device.parent_device_id).first();

      if (parent) {
        linkedDevices.push(parent);
      }
    }

    const devices = linkedDevices.map((d: Record<string, unknown>) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      userId: d.user_id,
      createdAt: d.created_at,
      parentDeviceId: d.parent_device_id,
    }));

    return new Response(JSON.stringify({ devices }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get linked devices error:', error);
    return new Response(JSON.stringify({ message: 'Failed to get linked devices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
