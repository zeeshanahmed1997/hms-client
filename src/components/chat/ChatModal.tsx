'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { X, Send, User, Search, MessageSquare, CheckCheck, Shield, Clock } from 'lucide-react';
import { useAppSelector } from '@/src/redux/hooks';
import { useChatHistory, ChatMessage } from '../../api/chatHistory'; // Import the hook we created

interface ChatModalProps {
  initialPatient?: { id: number; firstName: string };
  onClose: () => void;
}

export default function ChatModal({ initialPatient, onClose }: ChatModalProps) {
  const user = useAppSelector((state) => state.auth.user);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 1. React Query: Fetch Historical Data
  const { data: history, isLoading } = useChatHistory(Number(user?.id), token);

  // 2. State Management
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialPatient?.id || null);
  const [messageText, setMessageText] = useState('');
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync React Query history into local state for real-time appending
  useEffect(() => {
    if (history) {
      setAllMessages(history);
    }
  }, [history]);

  // 3. SignalR: Establish Real-time Connection
  useEffect(() => {
    if (!user?.id || !token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7186/hubs/chat', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        conn.on('ReceiveMessage', (msg: ChatMessage) => {
          setAllMessages((prev) => {
            // Avoid duplicate messages if backend sends back to sender
            if (prev.some(m => m.id === msg.id && msg.id !== 0)) return prev;
            return [...prev, msg];
          });
        });
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    setConnection(conn);
    return () => { conn.stop(); };
  }, [user?.id, token]);

  // 4. Computed Logic: Conversations List (Sidebar)
  const conversations = Array.from(new Set(allMessages.map(m => 
    m.senderId == Number(user?.id) ? m.receiverId : m.senderId
  ))).map(id => {
    const thread = allMessages.filter(m => m.senderId == id || m.receiverId == id);
    const lastMsg = thread[thread.length - 1];
    return { id, lastMsg };
  }).sort((a, b) => new Date(b.lastMsg.sentAt).getTime() - new Date(a.lastMsg.sentAt).getTime());

  // 5. Computed Logic: Active Chat Messages
  const activeMessages = allMessages.filter(m => 
    (m.senderId == Number(selectedUserId) && m.receiverId == Number(user?.id)) ||
    (m.senderId == Number(user?.id) && m.receiverId == Number(selectedUserId))
  );

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSendMessage = async () => {
    if (!connection || !messageText.trim() || !selectedUserId) return;

    const msgPayload = {
      senderId: Number(user?.id),
      receiverId: selectedUserId,
      messageText: messageText.trim(),
      sentAt: new Date().toISOString(),
    };

    try {
      await connection.invoke('SendMessage', msgPayload);
      // If your backend doesn't broadcast back to sender, manually add it:
      // setAllMessages(prev => [...prev, { ...msgPayload, id: Date.now() }]); 
      setMessageText('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden border border-white/20">
        
        {/* SIDEBAR */}
        <div className="w-80 border-r bg-slate-50/50 flex flex-col">
          <div className="p-6 bg-white border-b">
            <h4 className="font-extrabold text-slate-800 m-0">Clinical Chats</h4>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 text-sm focus:ring-2 focus:ring-emerald-500/20" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-10 text-center text-slate-400 animate-pulse text-sm">Synchronizing history...</div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <MessageSquare className="mx-auto mb-2 opacity-20" size={40} />
                <p className="text-sm font-medium">No active discussions</p>
              </div>
            ) : (
              conversations.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedUserId(c.id)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all border-b border-slate-100/50 ${selectedUserId == c.id ? 'bg-white shadow-md z-10 scale-[1.02]' : 'hover:bg-slate-100/50'}`}
                >
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-lg">
                    {c.lastMsg.senderName?.[0] || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm text-slate-800 truncate m-0">{c.lastMsg.senderName || `User ${c.id}`}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.lastMsg.sentAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate m-0 italic">"{c.lastMsg.messageText}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUserId ? (
            <>
              <div className="px-8 py-5 border-b flex justify-between items-center bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <User size={24}/>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 m-0">Clinical Consultation</h5>
                    <p className="text-[10px] text-emerald-500 m-0 flex items-center gap-1 font-bold uppercase tracking-widest">
                      <Shield size={12} /> HIPAA Secure Channel
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
                  <X size={28}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                {activeMessages.map((msg, i) => {
                  const isMe = msg.senderId == Number(user?.id);
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 shadow-sm relative ${
                        isMe 
                        ? 'bg-emerald-600 text-white rounded-3xl rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-3xl rounded-tl-none'
                      }`}>
                        <p className="text-sm m-0 leading-relaxed">{msg.messageText}</p>
                        <div className={`text-[9px] mt-2 flex items-center gap-1 opacity-60 ${isMe ? 'justify-end text-emerald-100' : 'justify-start'}`}>
                          <Clock size={10} />
                          {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {isMe && <CheckCheck size={14} className="ml-1"/>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <div className="p-6 bg-white border-t">
                <div className="flex gap-3 bg-slate-100 rounded-[1.5rem] p-2 border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                  <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-3" 
                    placeholder="Provide medical guidance..." 
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!messageText.trim()}
                    className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                  >
                    <Send size={20}/>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <MessageSquare size={40} className="opacity-40" />
                    </div>
                    <h4 className="font-bold text-slate-800">Select a Conversation</h4>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Click on a patient from the left sidebar to view historical clinical discussions.
                    </p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}