'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { ChatLayout } from '@/components/chat/chat-layout';
import { handleSendMessage } from '@/lib/actions';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const initialMessages: ChatMessageType[] = [
  {
    role: 'model',
    content: "Hello! I'm Spinneys Chat, your AI assistant for Spinneys Lebanon. How can I help you today?",
    id: crypto.randomUUID(),
  },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [state, formAction] = useActionState(handleSendMessage, {
    newMessage: null,
    error: null,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatHistory');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages(initialMessages);
      }
    } catch (error) {
      setMessages(initialMessages);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (state.newMessage) {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const loadingMessageIndex = newMessages.findIndex(m => m.isLoading);
        if (loadingMessageIndex !== -1) {
          newMessages[loadingMessageIndex] = state.newMessage as ChatMessageType;
        }
        return newMessages;
      });
    }
    if (state.error) {
      toast({ variant: 'destructive', description: state.error });
       setMessages(prevMessages => prevMessages.filter(m => !m.isLoading));
    }
  }, [state, toast]);

  const onFormSubmit = (formData: FormData) => {
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim()) return;

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    const loadingMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'model',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    formRef.current?.reset();

    const fullHistory = [...messages, userMessage];
    const historyString = JSON.stringify(fullHistory);
    formData.append('messages', historyString);
    formAction(formData);
  };

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <ChatLayout
        messages={messages}
        onFormSubmit={onFormSubmit}
        formRef={formRef}
        messagesEndRef={messagesEndRef}
      />
    </main>
  );
}
