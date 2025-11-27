import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { childDeviceId, parentDeviceId } = await context.request.json() as {
      childDeviceId: string;
      parentDeviceId: string;
    };

    if (!childDeviceId || !parentDeviceId) {
      return new Response(JSON.stringify({ message: 'Child and parent device IDs required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify child device exists and is a child type
    const childDevice = await context.env.DB.prepare(
      'SELECT * FROM devices WHERE id = ?'
    ).bind(childDeviceId).first();

    if (!childDevice) {
      return new Response(JSON.stringify({ message: 'Child device not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (childDevice.type !== 'child') {
      return new Response(JSON.stringify({ message: 'Device is not a child device' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if child already has a parent
    if (childDevice.parent_device_id) {
      return new Response(JSON.stringify({ message: 'Child device already has a parent' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify parent device exists and is a parent type
    const parentDevice = await context.env.DB.prepare(
      'SELECT * FROM devices WHERE id = ?'
    ).bind(parentDeviceId).first();

    if (!parentDevice) {
      return new Response(JSON.stringify({ message: 'Parent device not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (parentDevice.type !== 'parent') {
      return new Response(JSON.stringify({ message: 'Device is not a parent device' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for existing pending request
    const existingRequest = await context.env.DB.prepare(
      'SELECT * FROM pairing_requests WHERE child_device_id = ? AND parent_device_id = ? AND status = ?'
    ).bind(childDeviceId, parentDeviceId, 'pending').first();

    if (existingRequest) {
      return new Response(JSON.stringify({
        request: {
          id: existingRequest.id,
          childDeviceId: existingRequest.child_device_id,
          parentDeviceId: existingRequest.parent_device_id,
          status: existingRequest.status,
          createdAt: existingRequest.created_at,
        },
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create pairing request
    const requestId = `pr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    await context.env.DB.prepare(
      'INSERT INTO pairing_requests (id, child_device_id, parent_device_id, status, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(requestId, childDeviceId, parentDeviceId, 'pending', now).run();

    return new Response(JSON.stringify({
      request: {
        id: requestId,
        childDeviceId,
        parentDeviceId,
        status: 'pending',
        createdAt: now,
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create pairing request error:', error);
    return new Response(JSON.stringify({ message: 'Failed to create pairing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
