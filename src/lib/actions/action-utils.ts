import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '../auth/session';

export async function verifyActionAuth(): Promise<{ authorized: boolean; error?: string }> {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return {
        authorized: false,
        error: 'Unauthorized: Admin session expired. Please log in again.',
      };
    }
    return { authorized: true };
  } catch {
    return {
      authorized: false,
      error: 'Authentication verification failed.',
    };
  }
}

export function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path);
  } catch (e) {
    // Silently ignore cache invalidation errors in edge/serverless environments where cache is static
    console.warn(`[safeRevalidatePath] Handled revalidation for ${path}`);
  }
}
