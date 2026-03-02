"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from "js-cookie";

export const useChat = (conversationId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.184:8080";
  const webSocketURL = process.env.NEXT_PUBLIC_WEB_SOCKET_URL || "ws://192.168.100.184:8080/ws";

  const fetchHistory = useCallback(async (offset: number) => {
    if (!conversationId) return;
    
    const token = Cookies.get("token");
    try {
      const res = await fetch(baseURL+`/chat/history?conversation_id=${conversationId}&offset=${offset}`, {
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
    const ws = new WebSocket(webSocketURL+`?token=${token}`);
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