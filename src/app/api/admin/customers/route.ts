import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    const customerStats = await Promise.all(
      users.map(async (u) => {
        const customerOrders = await db.order.findMany({ where: { userId: u.id } });
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
        return { ...u, orderCount: customerOrders.length, totalSpent };
      })
    );

    return NextResponse.json(customerStats);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    // Don't allow deleting admin
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 400 });
    }
    await db.review.deleteMany({ where: { userId } });
    await db.wishlist.deleteMany({ where: { userId } });
    await db.address.deleteMany({ where: { userId } });
    await db.paymentMethod.deleteMany({ where: { userId } });
    const orderItems = await db.orderItem.findMany({ where: { order: { userId } }, select: { id: true } });
    if (orderItems.length > 0) {
      await db.orderItem.deleteMany({ where: { id: { in: orderItems.map(i => i.id) } } });
    }
    await db.order.deleteMany({ where: { userId } });
    await db.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
