import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`.toUpperCase();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { userId, deviceType } = await context.request.json() as {
      userId: string;
      deviceType: 'parent' | 'child';
    };

    if (!userId || !deviceType) {
      return new Response(JSON.stringify({ message: 'User ID and device type required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deviceId = generateDeviceId();
    const now = new Date().toISOString();

    await context.env.DB.prepare(
      'INSERT INTO devices (id, user_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(deviceId, userId, `${deviceType === 'parent' ? 'Parent' : 'Child'} Device`, deviceType, now, now).run();

    // If parent device, create a whitelist
    if (deviceType === 'parent') {
      await context.env.DB.prepare(
        'INSERT INTO whitelists (id, parent_device_id, created_at, updated_at) VALUES (?, ?, ?, ?)'
      ).bind(`wl-${deviceId}`, deviceId, now, now).run();
    }

    return new Response(JSON.stringify({
      device: {
        id: deviceId,
        name: `${deviceType === 'parent' ? 'Parent' : 'Child'} Device`,
        type: deviceType,
        userId,
        createdAt: now,
        parentDeviceId: null,
        childDeviceIds: [],
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Device register error:', error);
    return new Response(JSON.stringify({ message: 'Failed to register device' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
