import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || searchParams.get('sortBy') || 'featured';
    const search = searchParams.get('search') || '';
    const limit = searchParams.get('limit');

    let products = await db.product.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (category && category !== 'All') {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Get active sales for discount calculation
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

    // Enrich products with discount info
    const enrichedProducts = products.map(product => {
      const categoryDiscount = categoryDiscounts[product.category] || 0;
      const productDiscount = product.discountPercentage || 0;
      const effectiveDiscount = Math.max(categoryDiscount, productDiscount);

      if (effectiveDiscount > 0) {
        const discountedPrice = Math.round((product.price * (1 - effectiveDiscount / 100)) * 100) / 100;
        return {
          ...product,
          discountedPrice,
          effectiveDiscount,
          savings: Math.round((product.price - discountedPrice) * 100) / 100,
          saleName: categorySaleNames[product.category] || 'Special Offer',
          onSale: true,
        };
      }

      return {
        ...product,
        discountedPrice: product.price,
        effectiveDiscount: 0,
        savings: 0,
        saleName: null,
        onSale: false,
      };
    });

    return NextResponse.json(limit ? enrichedProducts.slice(0, parseInt(limit, 10)) : enrichedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await db.product.create({
      data: body,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
