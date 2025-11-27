import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const requestId = context.params.requestId as string;
    const { status } = await context.request.json() as { status: 'approved' | 'rejected' };

    if (!status || !['approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({ message: 'Valid status required (approved/rejected)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const request = await context.env.DB.prepare(
      'SELECT * FROM pairing_requests WHERE id = ?'
    ).bind(requestId).first();

    if (!request) {
      return new Response(JSON.stringify({ message: 'Pairing request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.status !== 'pending') {
      return new Response(JSON.stringify({ message: 'Request already processed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update request status
    await context.env.DB.prepare(
      'UPDATE pairing_requests SET status = ? WHERE id = ?'
    ).bind(status, requestId).run();

    // If approved, link the child to parent
    if (status === 'approved') {
      const now = new Date().toISOString();

      await context.env.DB.prepare(
        'UPDATE devices SET parent_device_id = ?, updated_at = ? WHERE id = ?'
      ).bind(request.parent_device_id, now, request.child_device_id).run();

      // Add child to parent's whitelist
      await context.env.DB.prepare(`
        UPDATE whitelists
        SET child_device_ids = CASE
          WHEN child_device_ids IS NULL OR child_device_ids = '' THEN ?
          ELSE child_device_ids || ',' || ?
        END,
        updated_at = ?
        WHERE parent_device_id = ?
      `).bind(
        request.child_device_id,
        request.child_device_id,
        now,
        request.parent_device_id
      ).run();
    }

    return new Response(JSON.stringify({
      request: {
        id: requestId,
        childDeviceId: request.child_device_id,
        parentDeviceId: request.parent_device_id,
        status,
        createdAt: request.created_at,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Respond to pairing error:', error);
    return new Response(JSON.stringify({ message: 'Failed to respond to pairing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
