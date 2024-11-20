import { useState, useCallback } from 'react';
import { Message, WebSocketMessage, MessageType } from '../types/server';
import { apiClient } from '../api/apiClient';

export function useMessages(serverId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case MessageType.MESSAGE: {
        const newMessage: Message = {
          id: data.id,
          content: data.content,
          user_id: data.user_id,
          created_at: data.created_at,
          parent_message_id: data.parent_message_id,
          user: data.user,
          server_id: data.server_id,
          updated_at: data.updated_at,
          reactions: data.reactions,
          attachment_urls: data.attachment_urls
        };
        
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, newMessage];
        });
        break;
      }

      case MessageType.MESSAGE_DELETED:
        setMessages(prev => prev.filter(m => m.id !== data.message_id));
        break;

      case MessageType.REACTION: {
        const newReaction = {
          id: data.id,
          emoji: data.reaction.emoji,
          user: {
            username: data.reaction.username
          }
        };
        
        setMessages(prev => prev.map(m => 
          m.id === data.message_id 
            ? { ...m, reactions: [...m.reactions.filter(r => 
                !(r.user.username === data.reaction.username && r.emoji === data.reaction.emoji)
              ), newReaction] }
            : m
        ));
        break;
      }

      case MessageType.REACTION_DELETED:
        setMessages(prev => prev.map(m => 
          m.id === data.message_id
            ? { ...m, reactions: m.reactions.filter(r => 
                !(r.user.username === data.reaction.username)
              )}
            : m
        ));
        break;
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!serverId || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await apiClient.getMessages(serverId, nextPage);

      if (response.messages.length > 0) {
        setMessages(prev => [...response.messages, ...prev]);
        setCurrentPage(nextPage);
        setHasMoreMessages(response.pagination.next_page !== null);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      setHasMoreMessages(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [serverId, currentPage, isLoadingMore]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isLoadingMore,
    hasMoreMessages,
    setHasMoreMessages,
    currentPage,
    setCurrentPage,
    loadMoreMessages,
    handleWebSocketMessage
  };
}