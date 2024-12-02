'use client';

import { useServer } from '../contexts/ServerContext';
import { useUser } from '../contexts/UserContext';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { ReplyTo, TextBox } from '@/components/TextBox';
import { websocket } from '@/lib/websocket';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useMessages } from '../hooks/useMessages';
import { groupMessages, getParentMessage } from '../utils/messageUtils';
import { MessageContent } from '../components/MessageContent';
import { NoServerSelected, LoadingState, NoMessages } from '../components/StateMessages';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'sonner';

type NewMessage = { content?: string; attachments: string[] }

export default function HomePage() {
  const { currentServer, setCurrentServer } = useServer();
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState<NewMessage>({ content: "", attachments: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    hasMoreMessages,
    loadMoreMessages,
    handleWebSocketMessage,
    setHasMoreMessages,
    isLoadingMore
  } = useMessages(currentServer?.id);

  // Initial server and messages setup
  useEffect(() => {
    if (!currentServer) return;
    
    setIsLoading(true);
    let isSubscribed = true;

    const setupServerAndMessages = async () => {
      try {
        // Fetch server data with users
        const serverData = await apiClient.getServer(currentServer.id);
        if (!serverData || !isSubscribed) return;
        setCurrentServer(serverData);

        // Fetch initial messages
        const messagesData = await apiClient.getMessages(currentServer.id, 1);
        if (!isSubscribed) return;

        setMessages(messagesData.messages);
        setHasMoreMessages(messagesData.pagination.next_page !== null);
        websocket.subscribeToServer(currentServer.id, handleWebSocketMessage);
        
        if (initialLoad) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
          setInitialLoad(false);
        }
      } catch (error) {
        console.error('Error fetching server data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupServerAndMessages();

    return () => { 
      isSubscribed = false;
    };
  }, [currentServer, handleWebSocketMessage, initialLoad, setMessages, setIsLoading, setHasMoreMessages]);

  const handleSendMessage = (content: string, attachments?: string[]) => {
    if ((!content?.trim() && (!attachments || attachments.length === 0)) || !currentServer) return;

    try {
      websocket.sendMessage(
        currentServer.id, 
        content, 
        replyTo?.id,
        attachments
      );
      setNewMessage({ content: "", attachments: [] });
      setReplyTo(null);
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    }
  };

  if (!currentServer) return <NoServerSelected />;
  if (isLoading) return <LoadingState />;

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-none bg-background px-4 py-3 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">{currentServer.name}</h1>
      </div>

      <div 
        id="scrollableDiv"
        style={{
          minHeight: '0',
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column-reverse'
        }}
        className="overflow-auto"
      >
        {messages.length === 0 ? (
          <NoMessages />
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={loadMoreMessages}
            hasMore={hasMoreMessages && !isLoadingMore}
            loader={
              <div className="py-4">
                <LoadingSpinner size="lg" className="text-gray-700" />
              </div>
            }
            style={{ 
              display: 'flex', 
              flexDirection: 'column-reverse'
            }}
            inverse={true}
            scrollableTarget="scrollableDiv"
            className="px-4"
            endMessage={
              hasMoreMessages === false && messages.length > 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No more messages
                </div>
              ) : null
            }
            scrollThreshold="200px"
          >
            <MessageContent
              messageGroups={groupMessages(messages)}
              getParentMessage={(messageId) => getParentMessage(messages, messageId)}
              currentUserId={user?.id.toString() || ''}
              setReplyTo={setReplyTo}
              users={currentServer.users}
              serverId={Number(currentServer.id)}
              username={user?.username || ''}
              lastMessageRef={lastMessageRef}
              messagesEndRef={messagesEndRef}
            />
          </InfiniteScroll>
        )}
      </div>

      <div className="flex-none bg-[#191919]">
        <TextBox 
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          users={currentServer.users}
        />
      </div>
    </div>
  );
}