'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAppSelector } from '@/src/redux/hooks';

export default function ChatWithPatient({ patientId }: { patientId: number }) {
  const user = useAppSelector((state) => state.auth.user);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [patients, setPatients] = useState<any[]>([]);     // Load your patients list
  const [selectedPatientId, setPatientId] = useState<number>(patientId);

  useEffect(() => {
    if (!user?.id) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7186/hubs/chat', {
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .withAutomaticReconnect()
      .build();

    conn.start().then(() => console.log('Chat connected'));

    conn.on('ReceiveMessage', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    setConnection(conn);

    return () => { conn.stop(); };
  }, [user]);

  const sendMessage = async () => {
    if (!connection || !selectedPatientId || !messageText.trim()) return;

    await connection.invoke('SendMessageToPatient', {
      receiverId: selectedPatientId,
      messageText: messageText.trim()
    });

    setMessageText('');
  };

  return (
    <div className="chat-container">
      <h3>Chat with Patient</h3>

      {/* Patient Selector */}
      <select value={selectedPatientId} onChange={(e) => setPatientId(Number(e.target.value))}>
        <option value={0}>Select Patient</option>
        {patients.map(p => (
          <option key={p.id} value={p.id}>{p.fullName}</option>
        ))}
      </select>

      {/* Messages Area */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.senderId === parseInt(user?.id ?? '0') ? 'sent' : 'received'}>
            <strong>{msg.senderId === parseInt(user?.id ?? '0') ? 'You' : 'Patient'}:</strong> {msg.messageText}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}