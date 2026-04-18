import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'ProductId is required' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, productId, rating, comment } = await request.json();

    if (!userId || !productId || !rating) {
      return NextResponse.json({ error: 'UserId, productId, and rating are required' }, { status: 400 });
    }

    const review = await db.review.create({
      data: { userId, productId, rating, comment },
      include: { user: { select: { name: true } } },
    });

    // Update product rating
    const allReviews = await db.review.findMany({ where: { productId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await db.product.update({
      where: { id: productId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
