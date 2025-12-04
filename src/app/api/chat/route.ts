import {
  UIMessage,
  convertToModelMessages,
  createIdGenerator,
  generateObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { saveChat } from '@/util/chat-store';

async function createTitle({ message }: { message: string }) {
  const { object } = await generateObject({
    model: 'openai/gpt-4o-mini', // Model that supports structured output
    schema: z.object({
      title: z
        .string()
        .describe(
          'A short, descriptive title for the conversation (max 50 characters)'
        ),
    }),
    prompt: `Generate a short and direct title for this conversation based on the first message:
        
Message: "${message}"

The title should be:
- Concise (max 50 characters)
- Descriptive of the topic
- In the same language as the message
- Without quotes or special formatting`,
  });

  return object.title;
}

export async function POST(req: Request) {
  const { messages, id }: { messages: UIMessage[]; id: string } =
    await req.json();

  // Only generate title for the first message (when there's only 1 user message)
  const isFirstMessage = messages.length === 1;
  let title = 'New Chat';

  if (isFirstMessage) {
    const firstMessage =
      messages[0].parts.find((part) => part.type === 'text')?.text ||
      'New Chat';
    try {
      title = await createTitle({ message: firstMessage });
      console.info('� Generated title:', title);
    } catch (error) {
      console.error('❌ Error generating title:', error);
      // Fallback to a simple title based on the message
      title = firstMessage.slice(0, 50);
    }
  }

  const result = streamText({
    model: 'openai/gpt-5-nano',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({
      prefix: 'msg',
      size: 16,
    }),
    onFinish: ({ messages }) => {
      saveChat({ id, title, messages });
    },
  });
}
