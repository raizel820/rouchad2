import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalOrders, totalProducts, totalCustomers, orders] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.user.count(),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: { include: { product: { select: { name: true, image: true } } } },
        },
        take: 100,
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const recentOrders = orders.slice(0, 10);

    const customers = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculate per-customer stats
    const customerStats = await Promise.all(
      customers.map(async (c) => {
        const customerOrders = await db.order.findMany({ where: { userId: c.id } });
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
        return {
          ...c,
          password: undefined,
          orderCount: customerOrders.length,
          totalSpent,
        };
      })
    );

    const products = await db.product.findMany({
      orderBy: { sales: 'desc' },
    });

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        orderGrowth: 12.5,
        revenueGrowth: 18.3,
        customerGrowth: 8.7,
        productGrowth: 4.2,
      },
      recentOrders,
      customers: customerStats,
      products,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
