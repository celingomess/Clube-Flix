import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseClient';

// Ensure standard Node.js runtime (no runtime = 'edge' configuration)
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'fallback_secret';

    // 1. Webhook Signature Validation (Stripe style)
    // Structure: t=timestamp,v1=signature
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      return NextResponse.json({ error: 'Invalid signature structure' }, { status: 400 });
    }

    const timestamp = timestampPart.split('=')[1];
    const signatureHash = signaturePart.split('=')[1];

    // Compute expected HMAC SHA-256
    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    // Secure comparison (prevents timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );

    if (!isValid) {
      console.warn('Webhook verification failed: signature mismatch');
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 });
    }

    // Parse the validated payload
    const event = JSON.parse(rawBody);
    
    // Only process checkout completion events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentIntentId = session.payment_intent || session.id;
      
      // 2. Idempotency Check
      // Check if payment was already processed to avoid duplicates
      const { data: existingEnrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id, status')
        .eq('stripe_payment_id', paymentIntentId)
        .maybeSingle();

      if (existingEnrollment) {
        return NextResponse.json({ status: 'ignored', message: 'Payment already processed (idempotency triggered)' });
      }

      // 3. Race Conditions: Mapped Student Email vs Billing Email
      // Look for custom metadata student_email, fallback to billing email
      const studentEmail = (session.metadata?.student_email || session.customer_details?.email || '').toLowerCase().trim();

      if (!studentEmail) {
        return NextResponse.json({ error: 'No user email mapped in payment metadata' }, { status: 400 });
      }

      // 4. Update Database using Service Role (RLS Bypass)
      // Find user profile by email
      let { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', studentEmail)
        .maybeSingle();

      let userId = profile?.id;

      // If student hasn't signed up in profiles yet, create a placeholder profile
      // so when they register they automatically get their active state
      if (!userId) {
        // Generate a random user in auth.users is handled by auth,
        // so we create a placeholder profile directly.
        // For production, the user is usually redirected to signup first, but this handles any race condition.
        const tempId = crypto.randomUUID();
        const { data: newProfile, error: profileErr } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: tempId,
            email: studentEmail,
            full_name: session.customer_details?.name || 'Assinante',
            role: 'student'
          })
          .select('id')
          .single();

        if (profileErr) {
          console.error('Failed to create placeholder profile:', profileErr);
          return NextResponse.json({ error: 'Failed to create student account' }, { status: 500 });
        }
        
        userId = newProfile.id;
      }

      // Upsert enrollment status to active
      const { error: enrollErr } = await supabaseAdmin
        .from('enrollments')
        .upsert({
          user_id: userId,
          status: 'active',
          stripe_payment_id: paymentIntentId
        });

      if (enrollErr) {
        console.error('Failed to upsert active enrollment:', enrollErr);
        return NextResponse.json({ error: 'Failed to activate enrollment' }, { status: 500 });
      }

      console.log(`Successfully enrolled user ${studentEmail} with paymentId: ${paymentIntentId}`);
      return NextResponse.json({ status: 'success', enrolled: studentEmail });
    }

    return NextResponse.json({ status: 'unhandled_event' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
