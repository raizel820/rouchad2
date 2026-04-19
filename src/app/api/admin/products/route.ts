import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, category, image, images, description, ingredients, colors, badge, stock, discountPercentage } = await request.json();
    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        image: image || `/products/default.png`,
        images: images || null,
        description: description || '',
        ingredients: ingredients || null,
        colors: colors || null,
        badge: badge || null,
        stock: parseInt(stock) || 50,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
