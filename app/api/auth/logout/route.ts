import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await removeAuthCookie();

    // Redirect to login page after successful logout
    redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
