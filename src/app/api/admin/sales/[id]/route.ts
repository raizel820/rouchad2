import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sale = await db.sale.findUnique({
      where: { id },
      include: {
        categories: true,
        promoCodes: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, startDate, endDate, isActive, categories } = body;

    const existing = await db.sale.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Update sale
    const sale = await db.sale.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description !== undefined ? description : existing.description,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
      include: { categories: true, promoCodes: true },
    });

    // Update categories if provided
    if (categories && Array.isArray(categories)) {
      // Delete existing categories
      await db.saleCategory.deleteMany({ where: { saleId: id } });
      // Create new categories
      for (const cat of categories) {
        await db.saleCategory.create({
          data: {
            saleId: id,
            categoryName: cat.categoryName,
            discountPercentage: cat.discountPercentage,
          },
        });
      }
    }

    const updatedSale = await db.sale.findUnique({
      where: { id },
      include: { categories: true, promoCodes: true },
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.saleCategory.deleteMany({ where: { saleId: id } });
    await db.promoCode.updateMany({ where: { saleId: id }, data: { saleId: null } });
    await db.sale.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}
