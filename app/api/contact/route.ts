import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactRateLimiter } from '../../../lib/rate-limit';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Basic IP-based rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = contactRateLimiter.check(ip);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) } }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
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
    const { data, error } = await resend.emails.send({
      from: 'Skywin Aeronautics <onboarding@resend.dev>',
      to: ['naol1000zedu@gmail.com'],
      subject: `New Contact Form Submission from ${name}`,
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
                  <td style="padding: 8px; background-color: white; border: 1px solid #e9ecef; color: #45576D;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; background-color: #f8f9fa; border: 1px solid #e9ecef; font-weight: bold; color: #23364F;">Email:</td>
                  <td style="padding: 8px; background-color: white; border: 1px solid #e9ecef; color: #45576D;">${email}</td>
                </tr>
              </table>
            </div>
            
            <div>
              <h2 style="color: #23364F; margin: 0 0 10px 0; font-size: 18px;">Message</h2>
              <div style="background-color: #f8f9fa; padding: 15px; border: 1px solid #e9ecef; border-radius: 4px; color: #45576D; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
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

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);

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
