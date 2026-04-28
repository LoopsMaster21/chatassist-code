import { type RefObject } from 'react';
import { SendHorizonal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from './chat-message';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFormStatus } from 'react-dom';

interface ChatLayoutProps {
  messages: ChatMessageType[];
  onFormSubmit: (formData: FormData) => void;
  formRef: RefObject<HTMLFormElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="icon" className="h-full aspect-square" disabled={pending}>
            <SendHorizonal />
            <span className="sr-only">Send</span>
        </Button>
    );
}

export function ChatLayout({
  messages,
  onFormSubmit,
  formRef,
  messagesEndRef,
}: ChatLayoutProps) {
  return (
    <div className="w-full max-w-4xl h-full flex flex-col bg-card rounded-lg border shadow-lg">
      <div className="flex items-center p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            S
          </AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h1 className="text-xl font-bold font-headline">Spinneys Chat</h1>
          <p className="text-sm text-muted-foreground">AI powered by Gemini</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6">
          {messages.map(message => (
            <ChatMessage key={message.id} {...message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <form
          ref={formRef}
          action={onFormSubmit}
          className="flex items-start gap-4"
        >
          <Textarea
            name="prompt"
            placeholder="Ask me anything..."
            className="flex-1 resize-none"
            minRows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
