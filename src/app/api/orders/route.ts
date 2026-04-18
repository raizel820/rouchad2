import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      subtotal,
      tax,
      total,
      paymentMethod,
    } = body;

    const orderNumber = 'RB' + Date.now().toString().slice(-8);
    const trackingNumber = 'TRK' + Math.random().toString(36).substring(2, 14).toUpperCase();

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: 'Processing',
        subtotal,
        tax,
        shipping: 0,
        total,
        paymentMethod: paymentMethod || 'credit_card',
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        trackingNumber,
        orderItems: {
          create: items.map((item: { productId: string; quantity: number; price: number; color?: string | null }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color || null,
          })),
        },
      },
      include: { orderItems: true },
    });

    // Update product sales
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { sales: { increment: item.quantity }, stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
