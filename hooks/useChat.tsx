"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from "js-cookie";

export const useChat = (conversationId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const fetchHistory = useCallback(async (offset: number) => {
    if (!conversationId) return;
    
    const token = Cookies.get("token");
    try {
      const res = await fetch(`http://localhost:8080/chat/history?conversation_id=${conversationId}&offset=${offset}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        if (data.length < 10) setHasMore(false);
        setMessages(prev => offset === 0 ? data : [...data, ...prev]);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setMessages([]);
    setHasMore(true);
    fetchHistory(0);

    const token = Cookies.get("token");
    const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      if (newMessage.conversation_id === conversationId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [conversationId, fetchHistory]);

  const sendMessage = (content: string, senderId: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && conversationId) {
      socketRef.current.send(JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      }));
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchHistory(messages.length);
    }
  };

  return { messages, sendMessage, loadMore, hasMore, isLoadingMore };
};