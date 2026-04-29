'use client';

import { useState } from 'react';
import { Bot, User, Volume2, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { handleTextToSpeech } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function ChatMessage({
  role,
  content,
  isLoading = false,
}: ChatMessageType) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlyingError, setIsPlayingError] = useState(false);
  const { toast } = useToast();

  const onPlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setIsPlayingError(false);
    const { audioDataUri, error } = await handleTextToSpeech(content);
    if (error || !audioDataUri) {
      setIsPlayingError(true);
      setIsPlaying(false);
      toast({
        variant: 'destructive',
        description: 'Failed to generate audio. Please try again.',
      });
      return;
    }

    const audio = new Audio(audioDataUri);
    audio.play();
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      setIsPlayingError(true);
      toast({
        variant: 'destructive',
        description: 'Error playing audio.',
      });
    };
  };

  const isAi = role === 'model';

  return (
    <div
      className={cn(
        'flex items-start gap-3 sm:gap-4 animate-in fade-in',
        !isAi && 'flex-row-reverse'
      )}
    >
      <Avatar className="h-9 w-9 border shrink-0">
        <AvatarFallback
          className={cn(
            isAi ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          )}
        >
          {isAi ? <Bot size={20} /> : <User size={20} />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'flex flex-col gap-2 max-w-[85%]',
          !isAi && 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-lg p-3 text-sm shadow-sm',
            isAi ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <LoaderCircle className="animate-spin w-4 h-4" />
              <span>Thinking...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
        {isAi && !isLoading && content && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 text-muted-foreground transition-colors',
              isPlaying && 'text-accent-foreground',
              isPlyingError && 'text-destructive'
            )}
            onClick={onPlayAudio}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <Volume2 size={16} />
            )}
            <span className="sr-only">Play audio</span>
          </Button>
        )}
      </div>
    </div>
  );
}
 