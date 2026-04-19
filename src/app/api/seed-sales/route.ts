import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Compute dynamic dates relative to now so sales always appear active
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * day);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * day);
    const sevenDaysAgo = new Date(now.getTime() - 7 * day);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * day);
    const oneYearFromNow = new Date(now.getTime() + 365 * day);
    const sixMonthsFromNow = new Date(now.getTime() + 180 * day);

    // Check if sales already exist — update their dates to be current
    const existingSales = await db.sale.findMany({ include: { categories: true } });

    let sale1, sale2;

    if (existingSales.length >= 2) {
      // Update existing sales with current dates so they appear active
      sale1 = await db.sale.update({
        where: { id: existingSales[0].id },
        data: {
          name: 'Summer Glow Sale',
          description: 'Get radiant this summer with amazing discounts on makeup and skincare essentials!',
          startDate: thirtyDaysAgo,
          endDate: sixtyDaysFromNow,
          isActive: true,
        },
        include: { categories: true },
      });

      sale2 = await db.sale.update({
        where: { id: existingSales[1].id },
        data: {
          name: 'Haircare Week',
          description: 'Treat your hair with our premium haircare collection at 25% off!',
          startDate: sevenDaysAgo,
          endDate: thirtyDaysFromNow,
          isActive: true,
        },
        include: { categories: true },
      });
    } else {
      // Create sales for the first time
      sale1 = await db.sale.create({
        data: {
          name: 'Summer Glow Sale',
          description: 'Get radiant this summer with amazing discounts on makeup and skincare essentials!',
          startDate: thirtyDaysAgo,
          endDate: sixtyDaysFromNow,
          isActive: true,
          categories: {
            create: [
              { categoryName: 'Makeup', discountPercentage: 20 },
              { categoryName: 'Skincare', discountPercentage: 15 },
            ],
          },
        },
        include: { categories: true },
      });

      sale2 = await db.sale.create({
        data: {
          name: 'Haircare Week',
          description: 'Treat your hair with our premium haircare collection at 25% off!',
          startDate: sevenDaysAgo,
          endDate: thirtyDaysFromNow,
          isActive: true,
          categories: {
            create: [
              { categoryName: 'Haircare', discountPercentage: 25 },
            ],
          },
        },
        include: { categories: true },
      });
    }

    // Create a product-level discount on Hydrating Body Butter (10% off)
    await db.product.updateMany({
      where: { name: 'Hydrating Body Butter' },
      data: { discountPercentage: 10 },
    });

    // Create a product-level discount on Vanilla Blossom Perfume (15% off)
    await db.product.updateMany({
      where: { name: 'Vanilla Blossom Eau de Toilette' },
      data: { discountPercentage: 15 },
    });

    // Fix misleading badges - remove SALE/10% OFF from products that now have category-level discounts
    await db.product.updateMany({
      where: { name: 'Soft Pie Liquid Highlighter' },
      data: { badge: null },
    });
    await db.product.updateMany({
      where: { name: 'Soft Pie Tinted Lip Oil' },
      data: { badge: null },
    });
    await db.product.updateMany({
      where: { name: 'Hydrating Body Butter' },
      data: { badge: null },
    });

    // Create or update promo codes (use upsert to handle re-seeding)
    const promo1 = await db.promoCode.upsert({
      where: { code: 'WELCOME10' },
      update: { expiresAt: oneYearFromNow, isValid: true },
      create: {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 25,
        maxUses: 100,
        currentUses: 12,
        isValid: true,
        expiresAt: oneYearFromNow,
      },
    });

    const promo2 = await db.promoCode.upsert({
      where: { code: 'SUMMER20' },
      update: { expiresAt: sixMonthsFromNow, isValid: true, saleId: sale1.id },
      create: {
        code: 'SUMMER20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 50,
        maxUses: 50,
        currentUses: 8,
        isValid: true,
        expiresAt: sixMonthsFromNow,
        saleId: sale1.id,
      },
    });

    const promo3 = await db.promoCode.upsert({
      where: { code: 'FREESHIP' },
      update: { expiresAt: oneYearFromNow, isValid: true },
      create: {
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 5.99,
        minOrderAmount: 30,
        maxUses: 200,
        currentUses: 45,
        isValid: true,
        expiresAt: oneYearFromNow,
      },
    });

    const promo4 = await db.promoCode.upsert({
      where: { code: 'VIP30' },
      update: { expiresAt: sixMonthsFromNow, isValid: true },
      create: {
        code: 'VIP30',
        discountType: 'percentage',
        discountValue: 30,
        minOrderAmount: 75,
        maxUses: 10,
        currentUses: 3,
        isValid: true,
        expiresAt: sixMonthsFromNow,
      },
    });

    // Seed some reviews for popular products (only if no reviews exist yet)
    const existingReviews = await db.review.count();
    if (existingReviews === 0) {
      const users = await db.user.findMany({ select: { id: true } });
      const products = await db.product.findMany({ select: { id: true, name: true } });

      const reviewData = [
        { productName: 'Soft Pie Cream Blush', userIdx: 0, rating: 5, comment: 'Absolutely love this blush! The texture is so creamy and blends like a dream. Perfect for everyday wear.' },
        { productName: 'Soft Pie Cream Blush', userIdx: 1, rating: 5, comment: 'Best cream blush I have ever used. The color payoff is amazing and it lasts all day without fading.' },
        { productName: 'Soft Pie Cream Blush', userIdx: 0, rating: 4, comment: 'Beautiful shade but I wish there were more color options. Otherwise, it is perfect!' },
        { productName: 'Soft Pie Tinted Lip Oil', userIdx: 1, rating: 5, comment: 'This lip oil is everything! Hydrating, glossy, and the tint is just perfect. Not sticky at all.' },
        { productName: 'Soft Pie Tinted Lip Oil', userIdx: 0, rating: 5, comment: 'I have repurchased this 3 times already. The shade range is gorgeous and it smells divine.' },
        { productName: 'Rose Glow Serum', userIdx: 1, rating: 4, comment: 'My skin has been glowing since I started using this serum. A little goes a long way!' },
        { productName: 'Rose Glow Serum', userIdx: 0, rating: 5, comment: 'Luxurious feel and you can see results within a week. Worth every penny.' },
        { productName: 'Rose Petal Perfume', userIdx: 1, rating: 5, comment: 'The most beautiful fragrance I own. Compliments every single time I wear it.' },
        { productName: 'Rose Petal Perfume', userIdx: 0, rating: 5, comment: 'Romantic, elegant, and long-lasting. This is my signature scent now.' },
        { productName: 'Hydrating Body Butter', userIdx: 1, rating: 4, comment: 'So moisturizing without being greasy. My skin feels incredibly soft after using this.' },
        { productName: 'Soft Pie Liquid Highlighter', userIdx: 0, rating: 4, comment: 'Gives the most beautiful glow! I use it on my cheekbones and it looks stunning.' },
        { productName: 'Natural Glow Moisturizer', userIdx: 1, rating: 5, comment: 'Lightweight yet hydrating. Perfect under makeup or on bare skin. Love the natural finish.' },
      ];

      for (const review of reviewData) {
        if (users[review.userIdx] && products.find(p => p.name === review.productName)) {
          const product = products.find(p => p.name === review.productName)!;
          await db.review.create({
            data: {
              userId: users[review.userIdx].id,
              productId: product.id,
              rating: review.rating,
              comment: review.comment,
            },
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Demo data seeded successfully',
      sales: [sale1, sale2],
      promoCodes: [promo1.code, promo2.code, promo3.code, promo4.code],
      reviews: existingReviews,
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json({ error: 'Failed to seed demo data' }, { status: 500 });
  }
}
