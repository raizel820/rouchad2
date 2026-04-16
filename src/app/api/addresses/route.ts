import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, label, name, street, city, state, zipCode, country, phone, isDefault } = await request.json();

    if (!userId || !label || !name || !street || !city || !state || !zipCode || !country) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const existingCount = await db.address.count({ where: { userId } });
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault && !isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        state,
        zipCode,
        country,
        phone: phone || null,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
