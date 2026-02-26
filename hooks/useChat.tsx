"use client";

import { useState, useEffect, useRef } from 'react';
import Cookies from "js-cookie";

export const useChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    // WebSocket কানেকশন তৈরি (আপনার Go ব্যাকএন্ড URL)
    socketRef.current = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

    socketRef.current.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        console.error("Error parsing socket message:", err);
      }
    };

    socketRef.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = (content: string, senderId: string, receiverId: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const data = JSON.stringify({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
      });
      socketRef.current.send(data);
    }
  };

  return { messages, setMessages, sendMessage };
};