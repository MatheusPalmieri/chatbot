import { UIMessage, generateId } from 'ai';
import { existsSync, mkdirSync } from 'fs';
import { readFile, readdir, unlink, writeFile } from 'fs/promises';
import path from 'path';

export async function createChat(): Promise<string> {
  const id = generateId(); // generate a unique chat ID
  await writeFile(
    getChatFile(id),
    JSON.stringify(
      { messages: [], title: 'New Chat', updatedAt: new Date().toISOString() },
      null,
      2
    )
  );
  return id;
}

function getChatFile(id: string): string {
  const chatDir = path.join(process.cwd(), '.chats');
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${id}.json`);
}

function getChatDir(): string {
  const chatDir = path.join(process.cwd(), '.chats');
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return chatDir;
}

export async function loadChat(
  id: string
): Promise<{ messages: UIMessage[]; title: string; updatedAt: string }> {
  const content = await readFile(getChatFile(id), 'utf8');
  return JSON.parse(content);
}

export async function listChats(): Promise<
  { id: string; title: string; updatedAt: string }[]
> {
  const chatDir = getChatDir();
  const files = await readdir(chatDir);

  const chats = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        const id = file.replace('.json', '');
        try {
          const data = await loadChat(id);
          return {
            id,
            title: data.title || 'Untitled Chat',
            updatedAt: data.updatedAt,
          };
        } catch (error) {
          console.error(`Error loading chat ${id}:`, error);
          return null;
        }
      })
  );

  const chatsFiltered = chats.filter(
    (chat): chat is { id: string; title: string; updatedAt: string } =>
      chat !== null
  );

  const chatsOrdened = chatsFiltered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return chatsOrdened;
}

export async function saveChat({
  id,
  title,
  messages,
}: {
  id: string;
  title: string;
  messages: UIMessage[];
}): Promise<void> {
  const updatedAt = new Date().toISOString();

  const content = JSON.stringify({ messages, title, updatedAt }, null, 2);
  await writeFile(getChatFile(id), content);
}

export async function deleteChats(): Promise<void> {
  const chatDir = getChatDir();
  const files = await readdir(chatDir);

  // Delete all .json files in the chat directory
  await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map((file) => unlink(getChatFile(file.replace('.json', ''))))
  );
}

export async function deleteChat(id: string): Promise<void> {
  const chatFile = getChatFile(id);

  if (existsSync(chatFile)) {
    await unlink(chatFile);
  }
}
