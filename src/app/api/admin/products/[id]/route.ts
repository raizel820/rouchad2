import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.badge !== undefined) updateData.badge = data.badge || null;
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
    if (data.rating !== undefined) updateData.rating = parseFloat(data.rating);
    if (data.reviewCount !== undefined) updateData.reviewCount = parseInt(data.reviewCount);
    if (data.sales !== undefined) updateData.sales = parseInt(data.sales);

    const product = await db.product.update({ where: { id }, data: updateData });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Delete related records first
    await db.review.deleteMany({ where: { productId: id } });
    await db.wishlist.deleteMany({ where: { productId: id } });
    await db.orderItem.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
