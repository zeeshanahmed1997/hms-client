'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/src/redux/hooks';
import { Bell, ChevronDown, User, LogOut, Activity, Settings, MessageCircle } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import ChatModal from '../chat/ChatModal';
import './dashboard.css';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatMessage {
  receiverId: number;
  id: number;
  senderId: number;
  senderName?: string;
  messageText: string;
  sentAt: string;
}

export default function TopNavbar() {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Chat States
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [recentChats, setRecentChats] = useState<ChatMessage[]>([]);
  
  // Modal Control States
  const [isChatHubOpen, setIsChatHubOpen] = useState(false);
  const [activePatientForChat, setActivePatientForChat] = useState<any>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const displayName = user?.fullName ?? 'Dr. Abdullah';
  const displayRole = user?.role ?? 'Chief Surgeon';

  // Format time for PKT as requested
  const timeString = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Karachi',
  });

  // SignalR Initialization
  useEffect(() => {
    if (!userId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7186/hubs/chat', { 
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => {
        console.log('SignalR Hub Connected to TopNavbar');

        connection.on('ReceiveMessage', (message: ChatMessage) => {
          // Verify the message is intended for the logged-in user
          if (message.receiverId == Number(userId)) {
            setUnreadChatCount((prev) => prev + 1);
            setRecentChats((prev) => {
              // Move the latest message from this sender to the top
              const filtered = prev.filter(m => m.senderId !== message.senderId);
              return [message, ...filtered].slice(0, 8);
            });
          }
        });

        connection.on('ReceiveNotification', (notification: Notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
      })
      .catch((err) => console.error('SignalR Connection Error:', err));

    return () => {
      connection.stop();
    };
  }, [userId]);

  // Utility listeners
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handler to open the Full Chat Hub
  const openChatHub = (patientData?: ChatMessage) => {
    if (patientData) {
      // If a specific notification was clicked
      setActivePatientForChat({
        id: patientData.senderId,
        firstName: patientData.senderName || 'Patient'
      });
    } else {
      // If general chat icon was clicked
      setActivePatientForChat(null);
    }
    setIsChatHubOpen(true);
    setShowChatDropdown(false);
    setUnreadChatCount(0); // Clear badge on click
  };

  return (
    <>
      <header className={`top-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="top-navbar-container">
          
          {/* Left Side */}
          <div className="top-navbar-left">
            <div className="system-status d-none d-xl-flex align-items-center gap-2">
              <div className="status-dot" />
              <span className="status-text">
                EMR Sync: <span className="status-live">Live</span>
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="top-navbar-right">
            
            {/* Clock */}
            <div className="clock-container d-none d-md-flex align-items-center gap-2">
              <span className="clock-time">{timeString}</span>
              <span className="clock-zone">PKT</span>
            </div>

            {/* Chat Icon & Dropdown */}
            <div className="notification-wrapper">
              <button
                className="nav-icon-btn"
                onClick={() => openChatHub()}
                aria-label="Messages"
              >
                <MessageCircle size={20} />
                {unreadChatCount > 0 && (
                  <span className="notification-count chat-count">{unreadChatCount}</span>
                )}
              </button>

              {showChatDropdown && (
                <div className="notification-dropdown shadow">
                  <div className="dropdown-header d-flex justify-content-between align-items-center">
                    <h6>Messages</h6>
                    <button className="btn btn-sm btn-link" onClick={() => openChatHub()}>View Hub</button>
                  </div>
                  <div className="notification-list">
                    {recentChats.length === 0 ? (
                      <p className="text-center text-muted py-3">No new messages</p>
                    ) : (
                      recentChats.map((chat) => (
                        <div 
                          key={chat.id} 
                          className="notification-item unread" 
                          onClick={() => openChatHub(chat)}
                          style={{ cursor: 'pointer' }}
                        >
                          <strong>{chat.senderName || 'Patient'}</strong>
                          <p className="text-truncate">{chat.messageText}</p>
                          <small>{new Date(chat.sentAt).toLocaleTimeString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="notification-wrapper">
              <button
                className="nav-icon-btn notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown shadow">
                  <div className="dropdown-header d-flex justify-content-between align-items-center">
                    <h6>Notifications</h6>
                    <button onClick={() => setUnreadCount(0)} className="btn btn-sm btn-link">
                      Mark all read
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <p className="text-center text-muted py-3">No new notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="notification-item">
                          <strong>{notif.title}</strong>
                          <p>{notif.message}</p>
                          <small>{new Date(notif.createdAt).toLocaleTimeString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="divider-vertical" />

            {/* User Profile Dropdown */}
            <div className="dropdown">
              <button
                className="profile-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="avatar-container">
                  <div className="avatar">{displayName.charAt(0)}</div>
                  <div className="status-indicator" />
                </div>

                <div className="user-info d-none d-lg-flex flex-column text-start">
                  <span className="user-name">{displayName}</span>
                  <span className="user-role">{displayRole}</span>
                </div>

                <ChevronDown size={16} className="chevron" />
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li className="dropdown-header">Staff Portal</li>
                <li><a className="dropdown-item" href="#"><User size={16} className="me-2" /> Profile</a></li>
                <li><a className="dropdown-item" href="#"><Activity size={16} className="me-2" /> Activity</a></li>
                <li><a className="dropdown-item" href="#"><Settings size={16} className="me-2" /> Settings</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item text-danger" href="#">
                    <LogOut size={16} className="me-2" /> Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Full Chat Hub Modal */}
      {isChatHubOpen && (
        <ChatModal 
          initialPatient={activePatientForChat} 
          onClose={() => {
            setIsChatHubOpen(false);
            setActivePatientForChat(null);
          }} 
        />
      )}
    </>
  );
}