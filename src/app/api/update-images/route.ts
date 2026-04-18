import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const imageMap: Record<string, string> = {
      'Soft Pie Liquid Highlighter': '/products/highlighter.png',
      'Soft Pie Cream Blush': '/products/blush.png',
      'Soft Kiss Dewy Lip Balm': '/products/lip-balm.png',
      'Soft Pie Tinted Lip Oil': '/products/lip-oil.png',
      'Rose Glow Serum': '/products/serum.png',
      'Gentle Foam Cleanser': '/products/cleanser.png',
      'Hydrating Body Butter': '/products/body-butter.png',
      'Natural Glow Moisturizer': '/products/moisturizer.png',
      'Silky Hair Serum': '/products/hair-serum.png',
      'Volumizing Shampoo': '/products/shampoo.png',
      'Rose Petal Perfume': '/products/perfume-rose.png',
      'Vanilla Blossom Eau de Toilette': '/products/perfume-vanilla.png',
    };

    for (const [name, image] of Object.entries(imageMap)) {
      const product = await db.product.findFirst({ where: { name } });
      if (product) {
        await db.product.update({ where: { id: product.id }, data: { image } });
      }
    }

    return NextResponse.json({ message: 'Images updated successfully' });
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json({ error: 'Failed to update images' }, { status: 500 });
  }
}
