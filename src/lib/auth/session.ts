import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'flavornest_admin_session';
const DEFAULT_DEV_ADMIN_PASSWORD = 'flavornest_admin_2026';

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_DEV_ADMIN_PASSWORD;
}

function generateSessionToken(password: string): string {
  // Simple deterministic token for session validation without external dependencies
  const raw = `fn_auth_${password}_${new Date().toISOString().slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sess_${Math.abs(hash).toString(36)}_${Buffer.from(password.slice(0, 4)).toString('hex')}`;
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return false;

  const validToken = generateSessionToken(getAdminPassword());
  return sessionToken === validToken;
}

export async function createAdminSession(passwordInput: string): Promise<boolean> {
  const expectedPassword = getAdminPassword();
  if (passwordInput.trim() !== expectedPassword.trim()) {
    return false;
  }

  const token = generateSessionToken(expectedPassword);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return true;
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
