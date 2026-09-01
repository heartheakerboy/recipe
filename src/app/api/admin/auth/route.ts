import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, destroyAdminSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const isValid = await createAdminSession(password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Authenticated successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await destroyAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out' });
}
