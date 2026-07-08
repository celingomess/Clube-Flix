import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Auth cookies set by client login/checkout simulation
  const userEmail = request.cookies.get('clube_flix_user_email')?.value;
  const userRole = request.cookies.get('clube_flix_user_role')?.value;
  const isSubscribed = request.cookies.get('clube_flix_is_subscribed')?.value === 'true';

  // 1. Protection for Course Showcase (Vitrine) & Secure Player
  if (pathname.startsWith('/vitrine') || pathname.startsWith('/player')) {
    if (!userEmail) {
      // Not authenticated, redirect to landing page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Students must have active subscriptions to watch premium videos
    if (userRole === 'student' && !isSubscribed) {
      return NextResponse.redirect(new URL('/checkout', request.url));
    }
  }

  // 2. Protection for Teacher Dashboard
  if (pathname.startsWith('/dashboard/teacher')) {
    if (userRole !== 'teacher') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Protection for Parent Dashboard
  if (pathname.startsWith('/dashboard/parent')) {
    if (userRole !== 'parent') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    '/vitrine/:path*',
    '/player/:path*',
    '/dashboard/teacher/:path*',
    '/dashboard/parent/:path*',
  ],
};
