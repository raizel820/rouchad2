import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const products = [
  {
    name: 'Soft Pie Liquid Highlighter',
    price: 24.00,
    category: 'Makeup',
    image: 'cosmetics liquid highlighter',
    description: 'Achieve a luminous glow with this silky liquid highlighter. Perfect for adding radiance to your cheekbones, brow bones, and cupid\'s bow.',
    badge: 'SALE',
    rating: 4.8,
    reviewCount: 234,
    stock: 45,
    sales: 234,
  },
  {
    name: 'Soft Pie Cream Blush',
    price: 26.00,
    category: 'Makeup',
    image: 'pink cream blush compact',
    description: 'A velvety cream blush that blends seamlessly for a natural, healthy flush. Buildable formula for customizable color intensity.',
    rating: 4.9,
    reviewCount: 456,
    stock: 32,
    sales: 456,
  },
  {
    name: 'Soft Kiss Dewy Lip Balm',
    price: 22.00,
    category: 'Makeup',
    image: 'nude lip balm stick',
    description: 'Nourishing lip balm with a hint of color and a dewy finish. Enriched with natural oils to keep lips soft and hydrated all day.',
    badge: 'New',
    rating: 4.7,
    reviewCount: 189,
    stock: 58,
    sales: 189,
  },
  {
    name: 'Soft Pie Tinted Lip Oil',
    price: 28.00,
    category: 'Makeup',
    image: 'pink tinted lip oil',
    description: 'Glossy tinted lip oil that delivers a sheer wash of color while deeply moisturizing. Non-sticky formula with a subtle shine.',
    badge: 'SALE',
    rating: 4.9,
    reviewCount: 567,
    stock: 41,
    sales: 567,
  },
  {
    name: 'Rose Glow Serum',
    price: 45.00,
    category: 'Skincare',
    image: 'rose gold serum bottle',
    description: 'Luxurious facial serum infused with rose extract and hyaluronic acid. Hydrates and brightens for radiant, youthful-looking skin.',
    rating: 4.8,
    reviewCount: 312,
    stock: 28,
    sales: 312,
  },
  {
    name: 'Gentle Foam Cleanser',
    price: 32.00,
    category: 'Skincare',
    image: 'white foam cleanser bottle',
    description: 'Soft foaming cleanser that gently removes makeup and impurities without stripping skin\'s natural moisture. Suitable for all skin types.',
    rating: 4.6,
    reviewCount: 278,
    stock: 55,
    sales: 278,
  },
  {
    name: 'Hydrating Body Butter',
    price: 38.00,
    category: 'Skincare',
    image: 'cream body butter jar',
    description: 'Rich, whipped body butter with shea and cocoa butter. Melts into skin for intense hydration and a silky-smooth finish.',
    badge: '10% OFF',
    rating: 4.9,
    reviewCount: 423,
    stock: 36,
    sales: 423,
  },
  {
    name: 'Natural Glow Moisturizer',
    price: 42.00,
    category: 'Skincare',
    image: 'natural moisturizer jar',
    description: 'Lightweight daily moisturizer that enhances skin\'s natural glow. Formulated with vitamin E and botanical extracts.',
    rating: 4.7,
    reviewCount: 345,
    stock: 30,
    sales: 345,
  },
  {
    name: 'Silky Hair Serum',
    price: 35.00,
    category: 'Haircare',
    image: 'hair serum dropper bottle',
    description: 'Nourishing hair serum that tames frizz and adds brilliant shine. Lightweight formula won\'t weigh hair down.',
    rating: 4.8,
    reviewCount: 267,
    stock: 40,
    sales: 267,
  },
  {
    name: 'Volumizing Shampoo',
    price: 29.00,
    category: 'Haircare',
    image: 'pink shampoo bottle',
    description: 'Gentle volumizing shampoo that cleanses while adding body and bounce. Infused with botanical proteins.',
    rating: 4.5,
    reviewCount: 198,
    stock: 50,
    sales: 198,
  },
  {
    name: 'Rose Petal Perfume',
    price: 65.00,
    category: 'Perfume',
    image: 'pink perfume bottle elegant',
    description: 'Delicate floral fragrance with notes of rose petals, jasmine, and white musk. Long-lasting and romantic scent.',
    badge: 'New',
    rating: 4.9,
    reviewCount: 534,
    stock: 15,
    sales: 534,
  },
  {
    name: 'Vanilla Blossom Eau de Toilette',
    price: 58.00,
    category: 'Perfume',
    image: 'vanilla perfume spray bottle',
    description: 'Warm and inviting fragrance featuring vanilla, orange blossom, and sandalwood. Perfect for everyday wear.',
    rating: 4.7,
    reviewCount: 287,
    stock: 22,
    sales: 287,
  },
];

export async function POST() {
  try {
    const existing = await db.product.count();
    if (existing > 0) {
      return NextResponse.json({ message: 'Products already seeded', count: existing });
    }

    for (const product of products) {
      await db.product.create({ data: product });
    }

    return NextResponse.json({ message: 'Products seeded successfully', count: products.length });
  } catch (error) {
    console.error('Error seeding:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
