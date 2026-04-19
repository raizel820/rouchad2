import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        reviewsList: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Enrich with active sale/discount info (same logic as products list API)
    const now = new Date();
    const activeSales = await db.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { categories: true },
    });

    const categoryDiscounts: Record<string, number> = {};
    const categorySaleNames: Record<string, string> = {};
    for (const sale of activeSales) {
      for (const cat of sale.categories) {
        if ((categoryDiscounts[cat.categoryName] || 0) < cat.discountPercentage) {
          categoryDiscounts[cat.categoryName] = cat.discountPercentage;
          categorySaleNames[cat.categoryName] = sale.name;
        }
      }
    }

    const categoryDiscount = categoryDiscounts[product.category] || 0;
    const productDiscount = product.discountPercentage || 0;
    const effectiveDiscount = Math.max(categoryDiscount, productDiscount);

    if (effectiveDiscount > 0) {
      const discountedPrice = Math.round((product.price * (1 - effectiveDiscount / 100)) * 100) / 100;
      return NextResponse.json({
        ...product,
        discountedPrice,
        effectiveDiscount,
        savings: Math.round((product.price - discountedPrice) * 100) / 100,
        saleName: categorySaleNames[product.category] || 'Special Offer',
        onSale: true,
      });
    }

    return NextResponse.json({
      ...product,
      discountedPrice: product.price,
      effectiveDiscount: 0,
      savings: 0,
      saleName: null,
      onSale: false,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const product = await db.product.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
