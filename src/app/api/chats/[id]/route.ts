import { NextResponse } from 'next/server';

import { deleteChat } from '@/util/chat-store';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteChat(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
