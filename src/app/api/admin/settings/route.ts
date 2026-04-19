import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    let settings = await db.shopSettings.findFirst();
    if (!settings) {
      settings = await db.shopSettings.create({
        data: { shopName: 'Rare Beauty' },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let settings = await db.shopSettings.findFirst();

    if (settings) {
      settings = await db.shopSettings.update({
        where: { id: settings.id },
        data: {
          shopName: body.shopName ?? settings.shopName,
          logoUrl: body.logoUrl ?? settings.logoUrl,
          faviconUrl: body.faviconUrl ?? settings.faviconUrl,
        },
      });
    } else {
      settings = await db.shopSettings.create({
        data: {
          shopName: body.shopName ?? 'Rare Beauty',
          logoUrl: body.logoUrl,
          faviconUrl: body.faviconUrl,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'logo' or 'favicon'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'png';
    const filename = `${type}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);
    const url = `/uploads/${filename}`;

    // Update settings with new URL
    let settings = await db.shopSettings.findFirst();
    const updateData: Record<string, string> = {};
    if (type === 'logo') updateData.logoUrl = url;
    if (type === 'favicon') updateData.faviconUrl = url;

    if (settings) {
      settings = await db.shopSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await db.shopSettings.create({
        data: {
          shopName: 'Rare Beauty',
          ...updateData,
        },
      });
    }

    return NextResponse.json({ url, settings });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
