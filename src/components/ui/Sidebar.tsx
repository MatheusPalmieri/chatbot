'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Trash2 } from 'lucide-react';

export const Sidebar = () => {
  const router = useRouter();
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Tem certeza que deseja deletar este chat?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the chat list
        await fetchChats();
        // If we're currently viewing this chat, redirect to home
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Erro ao deletar o chat');
    }
  };

  const handleClearChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the chat list
        await fetchChats();
        // Redirect to home
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error clearing chats:', error);
      alert('Erro ao limpar os chats');
    }
  };

  return (
    <div className="flex w-52 flex-col border-r border-neutral-200 px-6 py-5">
      <ul className="flex-1 space-y-1">
        {loading ? (
          <p className="h-5 w-full px-2 text-start text-xs text-neutral-400">
            Carregando...
          </p>
        ) : chats.length === 0 ? (
          <p className="h-5 w-full px-2 text-start text-xs text-neutral-400">
            Sem histórico
          </p>
        ) : (
          chats.map((chat) => (
            <li key={chat.id} className="group relative">
              <Link
                href={`/chat/${chat.id}`}
                className="flex h-8 w-full cursor-pointer items-center justify-between rounded px-2 text-start text-xs leading-8 transition-colors duration-300 hover:bg-neutral-700"
              >
                <span className="flex-1 truncate">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="ml-2 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-4 w-4 text-rose-600 hover:text-rose-700" />
                </button>
              </Link>
            </li>
          ))
        )}
      </ul>

      <div className="border-t border-neutral-200 py-2">
        <button
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-rose-200 px-3 py-2 text-rose-600 transition-colors duration-300 hover:bg-rose-300"
          onClick={handleClearChats}
        >
          Limpar <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
};
