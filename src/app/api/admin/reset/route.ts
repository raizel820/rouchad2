import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rmSync, existsSync } from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Delete all data from all tables in correct order (respect FK constraints)
    const tableNames = [
      'OrderItem', 'Review', 'Wishlist',
      'Order',
      'SaleCategory', 'PromoCode', 'Sale',
      'PaymentMethod', 'Address',
      'Product',
      'Category',
      'ShopSettings', 'Newsletter',
      'User',
    ];

    for (const tableName of tableNames) {
      try {
        // @ts-expect-error - dynamic table name for Prisma deleteMany
        await db[tableName.charAt(0).toLowerCase() + tableName.slice(1)].deleteMany();
      } catch {
        // Table might not exist or might have FK issues, skip
      }
    }

    // Clean up uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (existsSync(uploadsDir)) {
      rmSync(uploadsDir, { recursive: true, force: true });
    }

    // Re-seed the database with initial products
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/seed`, { method: 'POST' });
    } catch (seedErr) {
      console.error('Seed error:', seedErr);
    }

    // Seed sales, promo codes, and reviews
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/seed-sales`, { method: 'POST' });
    } catch (seedErr) {
      console.error('Seed-sales error:', seedErr);
    }

    return NextResponse.json({ success: true, message: 'App reset successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset app' }, { status: 500 });
  }
}
