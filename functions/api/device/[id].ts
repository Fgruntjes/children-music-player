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

    // Get child device IDs if parent
    let childDeviceIds: string[] = [];
    if (device.type === 'parent') {
      const children = await context.env.DB.prepare(
        'SELECT id FROM devices WHERE parent_device_id = ?'
      ).bind(deviceId).all();
      childDeviceIds = children.results.map((c: { id: string }) => c.id);
    }

    return new Response(JSON.stringify({
      device: {
        id: device.id,
        name: device.name,
        type: device.type,
        userId: device.user_id,
        createdAt: device.created_at,
        parentDeviceId: device.parent_device_id,
        childDeviceIds,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get device error:', error);
    return new Response(JSON.stringify({ message: 'Failed to get device' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const deviceId = context.params.id as string;
    const updates = await context.request.json() as Partial<{
      name: string;
      type: 'parent' | 'child';
    }>;

    const device = await context.env.DB.prepare(
      'SELECT * FROM devices WHERE id = ?'
    ).bind(deviceId).first();

    if (!device) {
      return new Response(JSON.stringify({ message: 'Device not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    const newName = updates.name || device.name;
    const newType = updates.type || device.type;

    await context.env.DB.prepare(
      'UPDATE devices SET name = ?, type = ?, updated_at = ? WHERE id = ?'
    ).bind(newName, newType, now, deviceId).run();

    // If becoming a parent device, create whitelist
    if (updates.type === 'parent' && device.type !== 'parent') {
      await context.env.DB.prepare(
        'INSERT OR IGNORE INTO whitelists (id, parent_device_id, created_at, updated_at) VALUES (?, ?, ?, ?)'
      ).bind(`wl-${deviceId}`, deviceId, now, now).run();
    }

    // Get child device IDs if parent
    let childDeviceIds: string[] = [];
    if (newType === 'parent') {
      const children = await context.env.DB.prepare(
        'SELECT id FROM devices WHERE parent_device_id = ?'
      ).bind(deviceId).all();
      childDeviceIds = children.results.map((c: { id: string }) => c.id);
    }

    return new Response(JSON.stringify({
      device: {
        id: deviceId,
        name: newName,
        type: newType,
        userId: device.user_id,
        createdAt: device.created_at,
        parentDeviceId: device.parent_device_id,
        childDeviceIds,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update device error:', error);
    return new Response(JSON.stringify({ message: 'Failed to update device' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
