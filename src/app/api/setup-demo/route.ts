import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Create demo user
    const existingUser = await db.user.findFirst({ where: { email: 'demo@rarebeauty.com' } });
    if (!existingUser) {
      await db.user.create({
        data: {
          name: 'Sarah Johnson',
          email: 'demo@rarebeauty.com',
          password: 'demo123',
          phone: '+1 (555) 123-4567',
          role: 'customer',
        },
      });
    }

    // Create sample reviews
    const products = await db.product.findMany();
    const demoUser = await db.user.findFirst({ where: { email: 'demo@rarebeauty.com' } });
    if (demoUser && products.length > 0) {
      const existingReviews = await db.review.count({ where: { userId: demoUser.id } });
      if (existingReviews === 0) {
        const reviewComments = [
          'Absolutely love this product! The quality is amazing.',
          'Best purchase I made this year. Highly recommend!',
          'Great value for money. Will definitely buy again.',
          'The packaging is beautiful and the product exceeded my expectations.',
          'Smooth application, long-lasting effect. Perfect!',
          'I use this every day and my skin has never looked better.',
        ];

        for (let i = 0; i < Math.min(6, products.length); i++) {
          await db.review.create({
            data: {
              userId: demoUser.id,
              productId: products[i].id,
              rating: 5,
              comment: reviewComments[i],
            },
          });
        }
      }
    }

    return NextResponse.json({ message: 'Demo data set up successfully' });
  } catch (error) {
    console.error('Error setting up demo:', error);
    return NextResponse.json({ error: 'Failed to set up demo' }, { status: 500 });
  }
}
