import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
