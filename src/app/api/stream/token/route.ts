import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Run on Node.js runtime for cryptography library compatibility
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Missing videoId parameter' }, { status: 400 });
    }

    // 1. Session check to prevent unauthorized calls
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Verify authentication if keys are present
    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {}, // Read-only session check in API GET
        },
      });

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }

      // Check if user is enrolled
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (enrollment?.status !== 'active') {
        return NextResponse.json({ error: 'Access denied: Active subscription required' }, { status: 403 });
      }
    } else {
      // Fallback for local simulation testing without env variables
      const mockEmail = cookieStore.get('clube_flix_user_email')?.value;
      if (!mockEmail) {
        return NextResponse.json({ error: 'Unauthorized: Demo login required' }, { status: 401 });
      }
    }

    // 2. Expiration window: 5 minutes (300 seconds)
    const expirationSeconds = 300;
    const expirationTime = Math.floor(Date.now() / 1000) + expirationSeconds;

    // 3. String binding the HMAC directly to the videoId to prevent replay attacks on other videos
    const streamSecret = process.env.STREAM_SECRET_KEY || 'default_stream_secret_key';
    const stringToSign = `${videoId}:${expirationTime}`;

    const token = crypto
      .createHmac('sha256', streamSecret)
      .update(stringToSign)
      .digest('hex');

    // Return signed credentials
    return NextResponse.json({
      videoId,
      token,
      expiresAt: expirationTime,
      expiresIn: expirationSeconds,
      securePath: `/stream/${videoId}?token=${token}&expires=${expirationTime}`
    });
  } catch (error: any) {
    console.error('Streaming token API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
