import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const paymentMethods = await db.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isPreferred: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, type, lastFour, expiryMonth, expiryYear, holderName, isPreferred } = await request.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'User ID and type are required' }, { status: 400 });
    }

    const paymentType = type.toUpperCase();

    // For card types, validate card-specific fields
    if (paymentType !== 'PAY_ON_RECEIVE' && paymentType !== 'CASH_ON_DELIVERY') {
      if (!lastFour || !expiryMonth || !expiryYear || !holderName) {
        return NextResponse.json({ error: 'Card number, expiry, and holder name are required for card payments' }, { status: 400 });
      }

      // Validate last four digits
      if (!/^\d{4}$/.test(lastFour)) {
        return NextResponse.json({ error: 'Last four digits must be exactly 4 digits' }, { status: 400 });
      }

      // Validate expiry
      const month = parseInt(expiryMonth);
      const year = parseInt(expiryYear);
      if (month < 1 || month > 12) {
        return NextResponse.json({ error: 'Invalid expiry month' }, { status: 400 });
      }
      if (year < 2024 || year > 2035) {
        return NextResponse.json({ error: 'Invalid expiry year' }, { status: 400 });
      }
    }

    // If setting as preferred, unset others
    if (isPreferred) {
      await db.paymentMethod.updateMany({
        where: { userId, isPreferred: true },
        data: { isPreferred: false },
      });
    }

    // If this is the first payment method, make it preferred
    const existingCount = await db.paymentMethod.count({ where: { userId } });
    const shouldBePreferred = isPreferred || existingCount === 0;

    if (shouldBePreferred && !isPreferred) {
      await db.paymentMethod.updateMany({
        where: { userId, isPreferred: true },
        data: { isPreferred: false },
      });
    }

    const paymentMethod = await db.paymentMethod.create({
      data: {
        userId,
        type: paymentType,
        lastFour: lastFour || null,
        expiryMonth: paymentType === 'PAY_ON_RECEIVE' || paymentType === 'CASH_ON_DELIVERY' ? null : parseInt(expiryMonth),
        expiryYear: paymentType === 'PAY_ON_RECEIVE' || paymentType === 'CASH_ON_DELIVERY' ? null : parseInt(expiryYear),
        holderName: holderName || null,
        isPreferred: shouldBePreferred,
      },
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
  }
}
