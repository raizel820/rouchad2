import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const wishlist = await db.wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, productId } = await request.json();

    const existing = await db.wishlist.findFirst({ where: { userId, productId } });
    if (existing) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 400 });
    }

    const wishlist = await db.wishlist.create({
      data: { userId, productId },
      include: { product: true },
    });

    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (id) {
      await db.wishlist.delete({ where: { id } });
    } else if (userId && productId) {
      await db.wishlist.deleteMany({ where: { userId, productId } });
    } else {
      return NextResponse.json({ error: 'Id or userId+productId required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
