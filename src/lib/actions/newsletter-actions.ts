'use server';

import { newsletterRepository } from '../repositories/newsletter.repository';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletterAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const res = await newsletterRepository.subscribe(email);
    return {
      success: true,
      message: res.isNew
        ? 'Welcome to the FlavorNest table! Fresh recipe ideas will arrive in your inbox.'
        : 'Welcome back! Your subscription is active.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Subscription failed',
    };
  }
}
