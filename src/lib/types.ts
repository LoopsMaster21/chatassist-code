export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isLoading?: boolean;
};
 