'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, MoreVertical, Users, Clock } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  isOwn: boolean;
}

interface EventChatProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    attendeeCount: number;
  } | null;
}

export default function EventChat({ eventId, isOpen, onClose, event }: EventChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock messages for demo
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hey everyone! Excited for tomorrow! 🍮',
        userId: 'user1',
        userName: 'Lisa Schmidt',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isOwn: false,
      },
      {
        id: '2',
        content: 'Can\'t wait to try everyone\'s pudding!',
        userId: 'user2',
        userName: 'Max Müller',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        isOwn: false,
      },
      {
        id: '3',
        content: 'I\'m bringing my famous chocolate pudding!',
        userId: 'user3',
        userName: 'Sarah Weber',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date(Date.now() - 900000).toISOString(),
        isOwn: true,
      },
      {
        id: '4',
        content: 'Perfect! I\'m making vanilla with real vanilla beans',
        userId: 'user1',
        userName: 'Lisa Schmidt',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        isOwn: false,
      },
    ];
    setMessages(mockMessages);
  }, [eventId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      userId: 'current-user',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="apple-card w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍮</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{event.attendeeCount} attendees</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-[80%] ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Image
                    src={message.userAvatar || '/images/default-avatar.png'}
                    alt={message.userName}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                
                {/* Message Content */}
                <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.isOwn 
                      ? 'bg-primary-500 text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {/* Timestamp and Name */}
                  <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${
                    message.isOwn ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <span className="font-medium">{message.userName}</span>
                    <span>•</span>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">👤</span>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                maxLength={500}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {newMessage.length}/500
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Messages are only visible to approved attendees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
