import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sales = await db.sale.findMany({
      include: {
        categories: true,
        promoCodes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, isActive, categories } = body;

    if (!name) {
      return NextResponse.json({ error: 'Sale name is required' }, { status: 400 });
    }

    const sale = await db.sale.create({
      data: {
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
        categories: {
          create: (categories || []).map((cat: { categoryName: string; discountPercentage: number }) => ({
            categoryName: cat.categoryName,
            discountPercentage: cat.discountPercentage,
          })),
        },
      },
      include: {
        categories: true,
        promoCodes: true,
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
