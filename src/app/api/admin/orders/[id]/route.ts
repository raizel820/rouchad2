import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status && status !== 'All') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: { include: { product: { select: { name: true, image: true } } } },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
