import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`.toUpperCase();
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { code } = await context.request.json() as { code: string };

    if (!code) {
      return new Response(JSON.stringify({ message: 'Authorization code required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redirectUri = new URL('/api/auth/callback', context.request.url).toString();

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: context.env.GOOGLE_CLIENT_ID,
        client_secret: context.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return new Response(JSON.stringify({ message: 'Failed to exchange authorization code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return new Response(JSON.stringify({ message: 'Failed to get user info' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Check if user exists, create or update
    const existingUser = await context.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userInfo.id).first();

    if (existingUser) {
      await context.env.DB.prepare(
        'UPDATE users SET access_token = ?, refresh_token = COALESCE(?, refresh_token), updated_at = ? WHERE id = ?'
      ).bind(
        tokens.access_token,
        tokens.refresh_token || null,
        new Date().toISOString(),
        userInfo.id
      ).run();
    } else {
      await context.env.DB.prepare(
        'INSERT INTO users (id, email, name, picture, access_token, refresh_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        userInfo.id,
        userInfo.email,
        userInfo.name,
        userInfo.picture,
        tokens.access_token,
        tokens.refresh_token || null,
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
    }

    // Check if device exists for this user, create if not
    let device = await context.env.DB.prepare(
      'SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(userInfo.id).first();

    if (!device) {
      const deviceId = generateDeviceId();
      await context.env.DB.prepare(
        'INSERT INTO devices (id, user_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        deviceId,
        userInfo.id,
        'My Device',
        null,
        new Date().toISOString(),
        new Date().toISOString()
      ).run();

      device = {
        id: deviceId,
        user_id: userInfo.id,
        name: 'My Device',
        type: null,
        created_at: new Date().toISOString(),
        parent_device_id: null,
      };
    }

    return new Response(JSON.stringify({
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        hasMusicAccess: true, // Will be verified separately
      },
      device: {
        id: device.id,
        name: device.name,
        type: device.type,
        userId: device.user_id,
        createdAt: device.created_at,
        parentDeviceId: device.parent_device_id,
        childDeviceIds: [],
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    return new Response(JSON.stringify({ message: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
