import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Hybrid Fallback: If Supabase keys are not set, run mock authentication logic
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    const userEmail = request.cookies.get('clube_flix_user_email')?.value;
    const userRole = request.cookies.get('clube_flix_user_role')?.value;
    const isSubscribed = request.cookies.get('clube_flix_is_subscribed')?.value === 'true';

    if (pathname.startsWith('/vitrine') || pathname.startsWith('/player')) {
      if (!userEmail) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (userRole === 'student' && !isSubscribed) {
        return NextResponse.redirect(new URL('/checkout', request.url));
      }
    }

    if (pathname.startsWith('/dashboard/teacher') && userRole !== 'teacher') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/dashboard/parent') && userRole !== 'parent') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  }

  // 1. Real Supabase Session validation using @supabase/ssr cookies
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session and get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (pathname.startsWith('/vitrine') || pathname.startsWith('/player') || pathname.startsWith('/dashboard')) {
      if (userError || !user) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Fetch user profile and roles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.role;

      // Protection rules for Students
      if (userRole === 'student') {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('status')
          .eq('user_id', user.id)
          .single();

        const isSubscribed = enrollment?.status === 'active';

        // Block student routes if inactive subscription
        if (pathname.startsWith('/vitrine') || pathname.startsWith('/player')) {
          if (!isSubscribed) {
            return NextResponse.redirect(new URL('/checkout', request.url));
          }
        }
      }

      // Protection for Teacher Dashboard
      if (pathname.startsWith('/dashboard/teacher') && userRole !== 'teacher') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Protection for Parent Dashboard
      if (pathname.startsWith('/dashboard/parent') && userRole !== 'parent') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (error) {
    console.error('Middleware session refresh error:', error);
    // Fallback safe redirect if database breaks
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/vitrine/:path*',
    '/player/:path*',
    '/dashboard/teacher/:path*',
    '/dashboard/parent/:path*',
  ],
};
