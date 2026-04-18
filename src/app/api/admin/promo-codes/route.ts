import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const promoCodes = await db.promoCode.findMany({
      include: { sale: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, maxUses, isValid, expiresAt, saleId } = body;

    if (!code || discountValue === undefined) {
      return NextResponse.json({ error: 'Code and discount value are required' }, { status: 400 });
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || 'percentage',
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxUses: parseInt(maxUses) || 0,
        isValid: isValid !== undefined ? isValid : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        saleId: saleId || null,
      },
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}
