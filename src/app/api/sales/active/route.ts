import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();

    const activeSales = await db.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const categoryDiscounts: Record<string, { percentage: number; saleName: string; saleId: string }> = {};

    for (const sale of activeSales) {
      for (const cat of sale.categories) {
        const existing = categoryDiscounts[cat.categoryName];
        if (!existing || cat.discountPercentage > existing.percentage) {
          categoryDiscounts[cat.categoryName] = {
            percentage: cat.discountPercentage,
            saleName: sale.name,
            saleId: sale.id,
          };
        }
      }
    }

    const products = await db.product.findMany();
    const productsWithDiscount = products.map(product => {
      const categoryDiscount = categoryDiscounts[product.category];
      const productDiscount = product.discountPercentage || 0;
      const effectiveDiscount = Math.max(categoryDiscount?.percentage || 0, productDiscount);
      const saleInfo = effectiveDiscount > 0 ? (categoryDiscount?.saleName || 'Special Offer') : null;

      if (effectiveDiscount > 0) {
        const discountedPrice = Math.round((product.price * (1 - effectiveDiscount / 100)) * 100) / 100;
        const savings = Math.round((product.price - discountedPrice) * 100) / 100;
        return {
          ...product,
          discountedPrice,
          effectiveDiscount,
          savings,
          saleName: saleInfo,
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

    const saleDisplay = activeSales.map(sale => ({
      id: sale.id,
      name: sale.name,
      description: sale.description,
      startDate: sale.startDate,
      endDate: sale.endDate,
      categories: sale.categories.map(c => ({
        categoryName: c.categoryName,
        discountPercentage: c.discountPercentage,
      })),
    }));

    return NextResponse.json({
      sales: saleDisplay,
      products: productsWithDiscount,
      categoryDiscounts,
    });
  } catch (error) {
    console.error('Error fetching active sales:', error);
    return NextResponse.json({ error: 'Failed to fetch active sales' }, { status: 500 });
  }
}
