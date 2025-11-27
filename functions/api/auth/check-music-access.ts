import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { accessToken } = await context.request.json() as { accessToken: string };

    if (!accessToken) {
      return new Response(JSON.stringify({ hasAccess: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user can access YouTube Music by trying to get their channel
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // If we get a valid response, user has access
    const hasAccess = response.ok;

    return new Response(JSON.stringify({ hasAccess }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Check music access error:', error);
    return new Response(JSON.stringify({ hasAccess: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
