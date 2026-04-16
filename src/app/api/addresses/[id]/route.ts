import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, label, name, street, city, state, zipCode, country, phone, isDefault } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(name !== undefined && { name }),
        ...(street !== undefined && { street }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const wasDefault = existing.isDefault;

    await db.address.delete({ where: { id } });

    // If the deleted address was default, set the most recent one as default
    if (wasDefault) {
      const remaining = await db.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await db.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
