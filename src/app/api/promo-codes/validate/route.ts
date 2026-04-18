import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const promoCode = await db.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: { sale: true },
    });

    if (!promoCode) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    }

    if (!promoCode.isValid) {
      return NextResponse.json({ error: 'This promo code is no longer valid' }, { status: 400 });
    }

    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
    }

    if (promoCode.maxUses > 0 && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 });
    }

    if (orderTotal < promoCode.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount of $${promoCode.minOrderAmount.toFixed(2)} required`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (promoCode.discountType === 'percentage') {
      discountAmount = orderTotal * (promoCode.discountValue / 100);
    } else {
      discountAmount = promoCode.discountValue;
    }

    return NextResponse.json({
      id: promoCode.id,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      description: promoCode.discountType === 'percentage'
        ? `${promoCode.discountValue}% off`
        : `$${promoCode.discountValue.toFixed(2)} off`,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
