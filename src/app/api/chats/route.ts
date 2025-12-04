import { NextResponse } from 'next/server';

import { deleteChats, listChats } from '@/util/chat-store';

export async function GET() {
  try {
    const chats = await listChats();
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error listing chats:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE() {
  try {
    await deleteChats();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
