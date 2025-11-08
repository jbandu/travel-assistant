import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await removeAuthCookie();

    // Get the origin from the request to build absolute URL
    const origin = request.nextUrl.origin;

    // Return 302 redirect to login page
    return NextResponse.redirect(new URL('/login', origin), 302);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
