import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactRateLimiter } from '../../../lib/rate-limit';

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not configured');
  }
  return new Resend(apiKey);
}

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
    // Rate limiting: securely extract IP
    let ip = (request as NextRequest & { ip?: string }).ip;
    if (!ip) {
      // Fallback for environments where request.ip is unset
      const forwarded = request.headers.get('x-forwarded-for');
      // Take the last IP in the chain to prevent spoofing if the proxy appends
      ip = forwarded ? forwarded.split(',').pop()?.trim() || '127.0.0.1' : '127.0.0.1';
    }
    
    const rateResult = contactRateLimiter.check(ip);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const name = (formData.get('name') as string || '').trim().replace(/[\r\n]/g, '');
    const email = (formData.get('email') as string || '').trim();
    const message = (formData.get('message') as string || '').trim();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (name.length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or fewer' }, { status: 400 });
    }
    if (email.length > 254) {
      return NextResponse.json({ error: 'Email must be 254 characters or fewer' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message must be 5000 characters or fewer' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const resend = getResend();
    const contactEmail = process.env.CONTACT_EMAIL || 'info@skywin.aero';
    const { error: sendError } = await resend.emails.send({
      from: 'Skywin Aeronautics <onboarding@resend.dev>',
      to: [contactEmail],
      subject: `New Contact Form Submission from ${escapeHtml(name)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #23364F; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Skywin Aeronautics</h1>
            <p style="color: #a8b2c1; margin: 5px 0 0 0; font-size: 14px;">New Contact Form Submission</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #23364F; margin: 0 0 10px 0; font-size: 18px;">Contact Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #23364F;">Name:</td>
                  <td style="padding: 8px; background-color: white; border: 1px solid #e9ecef; color: #45576D;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #23364F;">Email:</td>
                  <td style="padding: 8px; background-color: white; border: 1px solid #e9ecef; color: #45576D;">${escapeHtml(email)}</td>
                </tr>
              </table>
            </div>
            
            <div>
              <h2 style="color: #23364F; margin: 0 0 10px 0; font-size: 18px;">Message</h2>
              <div style="background-color: #f8f9fa; padding: 15px; border: 1px solid #e9ecef; border-radius: 4px; color: #45576D; line-height: 1.6;">
                ${escapeHtml(message).replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #a8b2c1; font-size: 12px;">
              <p>This message was sent from the Skywin Aeronautics website contact form.</p>
              <p style="margin: 5px 0 0 0;">Sent on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    });

    if (sendError) {
      console.error('Contact form email failed:', sendError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
