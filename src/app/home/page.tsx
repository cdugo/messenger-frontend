'use client';

import { useServer } from '../contexts/ServerContext';
import { useUser } from '../contexts/UserContext';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { ReplyTo, TextBox } from '@/components/TextBox';
import { websocket } from '@/lib/websocket';
import { User } from '../types/user';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useMessages } from '../hooks/useMessages';
import { groupMessages, getParentMessage } from '../utils/messageUtils';
import { MessageContent } from '../components/MessageContent';
import { NoServerSelected, LoadingState } from '../components/StateMessages';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function HomePage() {
  const { currentServer } = useServer();
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [users, setUsers] = useState<User[]>([]);
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
        // Fetch server data for users
        const serverData = await apiClient.getServer(currentServer.id);
        if (!serverData || !isSubscribed) return;
        setUsers(serverData.users);

        // Fetch initial messages
        const messagesData = await apiClient.getMessages(currentServer.id, 1);
        if (!isSubscribed) return;

        setMessages(messagesData.messages);
        setHasMoreMessages(messagesData.pagination.next_page !== null);
        websocket.subscribeToServer(currentServer.id, handleWebSocketMessage);
        
        // Initial scroll to bottom without animation
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
    return () => { isSubscribed = false; };
  }, [currentServer, handleWebSocketMessage, initialLoad, setMessages, setIsLoading, setHasMoreMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentServer) return;

    websocket.sendMessage(currentServer.id, newMessage, replyTo?.id);
    setNewMessage("");
    setReplyTo(null);
  };

  if (!currentServer) return <NoServerSelected />;
  if (isLoading) return <LoadingState />;

  const messageGroups = groupMessages(messages);

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
            messageGroups={messageGroups}
            getParentMessage={(messageId) => getParentMessage(messages, messageId)}
            currentUserId={user?.id.toString() || ''}
            setReplyTo={setReplyTo}
            users={users}
            serverId={Number(currentServer.id)}
            username={user?.username || ''}
            lastMessageRef={lastMessageRef}
            messagesEndRef={messagesEndRef}
          />
        </InfiniteScroll>
      </div>

      <div className="flex-none bg-[#191919]">
        <TextBox 
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          users={users}
        />
      </div>
    </div>
  );
}