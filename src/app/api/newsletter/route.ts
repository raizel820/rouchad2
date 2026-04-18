import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Use raw SQL to bypass Prisma model caching issues in dev
const rawDb = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Use raw query to check for existing subscription
    const existing = await rawDb.$queryRawUnsafe(
      `SELECT id FROM Newsletter WHERE email = ? LIMIT 1`,
      trimmedEmail
    ) as Array<{ id: string }>;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    // Use raw query to create subscription
    await rawDb.$executeRawUnsafe(
      `INSERT INTO Newsletter (id, email, createdAt) VALUES (?, ?, datetime('now'))`,
      crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      trimmedEmail
    );

    return NextResponse.json(
      { success: true, message: 'Subscribed successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
