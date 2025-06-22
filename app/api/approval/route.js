import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';

export async function GET() {
  try {
    await connectToDatabase();
    const approval = await Approval.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(Array.isArray(approval) ? approval : [], { status: 200 });
  } catch (error) {
    console.error('❌ GET approval error:', error);
    return NextResponse.json({ error: 'Gagal ambil data approval', message: error.message }, { status: 500 });
  }
}
