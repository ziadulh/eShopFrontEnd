"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from "js-cookie";

export const useChat = (activeReceiverId?: string, currentSenderId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // হিস্ট্রি ফেচ করার মেইন ফাংশন
  const fetchHistory = useCallback(async (currentOffset: number) => {
    if (!activeReceiverId || !currentSenderId) return;
    
    const token = Cookies.get("token");
    try {
      const res = await fetch(
        `http://localhost:8080/chat/history?sender_id=${currentSenderId}&receiver_id=${activeReceiverId}&offset=${currentOffset}`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (Array.isArray(data)) {
        if (data.length < 10) setHasMore(false);
        
        setMessages((prev) => {
          // যদি প্রথমবার লোড হয় (offset 0), তবে শুধু নতুন ডাটা
          if (currentOffset === 0) return data;
          // পুরনো মেসেজগুলো শুরুতে যোগ করা
          return [...data, ...prev];
        });
      }
    } catch (err) {
      console.error("❌ History error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeReceiverId, currentSenderId]);

  // ইউজার সিলেক্ট করলে ইনিশিয়াল লোড
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    if (activeReceiverId) fetchHistory(0);
  }, [activeReceiverId, fetchHistory]);

  // WebSocket কানেকশন
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        const isRelevant = 
          (newMessage.sender_id === activeReceiverId && newMessage.receiver_id === currentSenderId) ||
          (newMessage.sender_id === currentSenderId && newMessage.receiver_id === activeReceiverId);

        if (isRelevant) {
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => ws.close();
  }, [activeReceiverId, currentSenderId]);

  const sendMessage = (content: string, senderId: string, receiverId: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
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