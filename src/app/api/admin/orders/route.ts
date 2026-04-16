import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
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

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    const validStatuses = ['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Generate tracking number for In Transit
    let trackingNumber: string | undefined;
    if (status === 'In Transit') {
      trackingNumber = 'RB' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    const order = await db.order.update({
      where: { id },
      data: { status, ...(trackingNumber ? { trackingNumber } : {}) },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
