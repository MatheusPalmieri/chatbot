import Chat from '@/components/ui/Chat';
import { Sidebar } from '@/components/ui/Sidebar';
import { loadChat } from '@/util/chat-store';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { messages } = await loadChat(id);

  return (
    <main className="flex h-dvh bg-neutral-800">
      <Sidebar />

      <Chat id={id} initialMessages={messages} />
    </main>
  );
}
