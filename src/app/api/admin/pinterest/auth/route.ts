import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const clientId = process.env.PINTEREST_CLIENT_ID || '1504839';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flavornest.xyz';
  const redirectUri = `${appUrl.replace(/\/$/, '')}/api/admin/pinterest/callback`;

  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const cookieStore = await cookies();
  cookieStore.set('pinterest_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  const pinterestAuthUrl = new URL('https://www.pinterest.com/oauth/');
  pinterestAuthUrl.searchParams.set('client_id', clientId);
  pinterestAuthUrl.searchParams.set('redirect_uri', redirectUri);
  pinterestAuthUrl.searchParams.set('response_type', 'code');
  pinterestAuthUrl.searchParams.set('scope', 'boards:read,pins:read,pins:write');
  pinterestAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(pinterestAuthUrl.toString());
}
