import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, isPreferred } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = await db.paymentMethod.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // If setting as preferred, unset other preferred methods
    if (isPreferred) {
      await db.paymentMethod.updateMany({
        where: { userId, isPreferred: true, NOT: { id } },
        data: { isPreferred: false },
      });
    }

    const paymentMethod = await db.paymentMethod.update({
      where: { id },
      data: { ...(isPreferred !== undefined && { isPreferred }) },
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
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

    const existing = await db.paymentMethod.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    const wasPreferred = existing.isPreferred;

    await db.paymentMethod.delete({ where: { id } });

    // If the deleted method was preferred, set the most recent one as preferred
    if (wasPreferred) {
      const remaining = await db.paymentMethod.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await db.paymentMethod.update({
          where: { id: remaining.id },
          data: { isPreferred: true },
        });
      }
    }

    return NextResponse.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}
