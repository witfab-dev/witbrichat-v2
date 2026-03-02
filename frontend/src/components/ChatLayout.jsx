import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  IoChatbubblesOutline, 
  IoSearchOutline, 
  IoPeopleOutline,
  IoAddOutline,
  IoVideocamOutline,
  IoCallOutline,
  IoNotificationsOutline
} from "react-icons/io5";
import Sidebar from "./Sidebar.jsx";
import EnhancedChatWindow from "./EnhancedChatWindow.jsx";
import GroupChat from "./GroupChat.jsx";
import CreatePoll from "./CreatePoll.jsx";
import "./ChatLayout.css";

/**
 * Enhanced ChatLayout with group chats, filters, and advanced features
 */
function ChatLayout({ 
  socket, 
  currentUser, 
  dbUsers = [], 
  onlineUsers = [], 
  lastMessages = {},
  targetUser,
  setActiveChat,
  setIsSearchOpen,
  isLoading = false,
  onNewMessage,
  unreadCount = 0
}) {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadConversations, setUnreadConversations] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

  // Filter conversations based on active filter and search
  const filteredConversations = useMemo(() => {
    return dbUsers.filter(user => {
      if (user.username === currentUser?.username) return false;
      
      const matchesSearch = searchQuery === "" || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      switch (activeFilter) {
        case "unread":
          return unreadConversations.includes(user.username);
        case "groups":
          return user.isGroup || false;
        case "friends":
          return user.isFriend || false;
        default:
          return true;
      }
    });
  }, [dbUsers, currentUser, searchQuery, activeFilter, unreadConversations]);

  // Handle typing indicators from socket
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ user: typingUser, room, isTyping: isUserTyping }) => {
      const roomUsers = room.split('_');
      const otherUser = roomUsers.find(u => u !== currentUser?.username);
      
      if (otherUser) {
        setTypingUsers(prev => ({
          ...prev,
          [otherUser]: isUserTyping
        }));
      }
    };

    socket.on("user_typing", handleUserTyping);
    
    // Track unread conversations
    socket.on("new_message", (message) => {
      if (message.sender !== targetUser) {
        setUnreadConversations(prev => {
          if (!prev.includes(message.sender)) {
            return [...prev, message.sender];
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off("user_typing", handleUserTyping);
      socket.off("new_message");
    };
  }, [socket, currentUser, targetUser]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (targetUser) {
      setUnreadConversations(prev => prev.filter(user => user !== targetUser));
      
      // Notify server about read status
      socket?.emit("mark_as_read", {
        room: [currentUser?.username, targetUser].sort().join('_'),
        user: currentUser?.username
      });
    }
  }, [targetUser, socket, currentUser]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen?.(true);
  }, [setIsSearchOpen]);

  const handleStartGroupChat = useCallback((groupData) => {
    console.log("Starting group chat:", groupData);
    setShowGroupModal(false);
    setActiveChat?.(`group_${groupData.name}`);
  }, [setActiveChat]);

  const handleCreatePoll = useCallback((pollData) => {
    console.log("Creating poll:", pollData);
    socket?.emit("send_poll", {
      ...pollData,
      room: targetUser ? [currentUser?.username, targetUser].sort().join('_') : null
    });
    setShowPollModal(false);
  }, [socket, targetUser, currentUser]);

  const handleVideoCall = useCallback(() => {
    if (!targetUser) return;
    
    socket?.emit("start_video_call", {
      caller: currentUser?.username,
      callee: targetUser,
      room: `video_${Date.now()}`
    });
    
    window.open(`/video-call/${targetUser}`, '_blank');
  }, [socket, targetUser, currentUser]);

  const handleVoiceCall = useCallback(() => {
    if (!targetUser) return;
    
    socket?.emit("start_voice_call", {
      caller: currentUser?.username,
      callee: targetUser,
      room: `voice_${Date.now()}`
    });
    
    window.open(`/voice-call/${targetUser}`, '_blank');
  }, [socket, targetUser, currentUser]);

  const handleContextMenu = useCallback((event, username, isGroup = false) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      username,
      isGroup
    });
  }, []);

  const handleArchiveConversation = useCallback((username) => {
    console.log("Archiving conversation with:", username);
    setContextMenu(null);
    
    if (targetUser === username) {
      setActiveChat?.(null);
    }
  }, [targetUser, setActiveChat]);

  const handleDeleteConversation = useCallback((username) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      console.log("Deleting conversation with:", username);
      setContextMenu(null);
      
      if (targetUser === username) {
        setActiveChat?.(null);
      }
    }
  }, [targetUser, setActiveChat]);

  // Get typing status for a user
  const getTypingStatus = (username) => {
    return typingUsers[username] ? "typing..." : null;
  };

  // Get last message preview with ellipsis
  const getMessagePreview = useCallback((username) => {
    const roomId = [currentUser?.username, username].sort().join('_');
    const message = lastMessages[roomId];
    
    if (!message) return "Start a conversation";
    
    return message.length > 30 
      ? `${message.substring(0, 30)}...` 
      : message;
  }, [lastMessages, currentUser]);

  // Get unread count for a conversation
  const getUnreadCountForUser = useCallback((username) => {
    return unreadConversations.includes(username) ? 1 : 0;
  }, [unreadConversations]);

  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu) return null;

    const { x, y, username, isGroup } = contextMenu;

    return (
      <div 
        className="conversation-context-menu"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => handleArchiveConversation(username)}>
          {isGroup ? "Leave Group" : "Archive"}
        </button>
        <button onClick={() => console.log("Mute conversation:", username)}>
          Mute Notifications
        </button>
        <button onClick={() => console.log("Pin conversation:", username)}>
          Pin Conversation
        </button>
        <div className="context-divider" />
        <button 
          className="danger"
          onClick={() => handleDeleteConversation(username)}
        >
          {isGroup ? "Delete Group" : "Delete Conversation"}
        </button>
      </div>
    );
  };

  return (
    <div className={`witbri-layout ${targetUser ? "chatting" : ""}`}>
      
      {/* --- SIDEBAR CONTAINER --- */}
      <aside className="sidebar-container">
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h2 className="sidebar-title">Messages</h2>
            <div className="sidebar-actions">
              <button 
                className="sidebar-action-btn"
                onClick={() => setShowGroupModal(true)}
                title="New Group"
              >
                <IoPeopleOutline size={22} />
              </button>
              <button 
                className="sidebar-action-btn"
                onClick={() => setShowPollModal(true)}
                title="Create Poll"
              >
                <IoAddOutline size={22} />
              </button>
              <button 
                className="sidebar-action-btn"
                onClick={openSearch}
                title="Search"
              >
                <IoSearchOutline size={22} />
              </button>
            </div>
          </div>
          
          {/* Quick Search */}
          <div className="sidebar-search">
            <div className="search-input-wrapper">
              <IoSearchOutline className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <div className="conversation-filters">
            {["all", "unread", "groups", "friends"].map(filter => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === "unread" && unreadConversations.length > 0 && (
                  <span className="filter-badge">{unreadConversations.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Sidebar 
          dbUsers={filteredConversations}
          onlineUsers={onlineUsers}
          lastMessages={lastMessages}
          currentUser={currentUser}
          activeChat={targetUser}
          setActiveChat={setActiveChat}
          isLoading={isLoading}
          socket={socket}
          getTypingStatus={getTypingStatus}
          getMessagePreview={getMessagePreview}
          getUnreadCount={getUnreadCountForUser}
          onContextMenu={handleContextMenu}
        />
        
        {/* Unread indicator */}
        {unreadConversations.length > 0 && targetUser && (
          <div className="unread-conversations-indicator">
            <IoNotificationsOutline />
            <span>{unreadConversations.length} unread conversation{unreadConversations.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </aside>
      
      {/* --- MAIN CHAT AREA --- */}
      <main className="chat-area">
        {targetUser ? (
          /* User/Group is selected: Show Enhanced Chat Window */
          <EnhancedChatWindow 
            socket={socket}
            currentUser={currentUser}
            targetUser={targetUser}
            onBack={() => setActiveChat?.(null)}
            onVideoCall={handleVideoCall}
            onVoiceCall={handleVoiceCall}
            isGroup={targetUser.startsWith('group_')}
          />
        ) : (
          /* No conversation selected: Show Enhanced Empty State */
          <div className="no-chat-selected">
            <div className="empty-state-container">
              <div className="empty-state-illustration">
                <div className="illustration-icon">
                  <IoChatbubblesOutline size={80} />
                </div>
                <div className="floating-message-bubbles">
                  <div className="bubble bubble-1">👋</div>
                  <div className="bubble bubble-2">💬</div>
                  <div className="bubble bubble-3">📷</div>
                </div>
              </div>
              
              <div className="empty-state-content">
                <h2 className="empty-title">Welcome to Messages</h2>
                <p className="empty-subtitle">
                  Start private conversations, share photos and videos, 
                  or create group chats with friends.
                </p>
                
                <div className="empty-state-features">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <IoPeopleOutline size={24} />
                    </div>
                    <h4>Group Chats</h4>
                    <p>Create groups for family, friends, or projects</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <IoVideocamOutline size={24} />
                    </div>
                    <h4>Video Calls</h4>
                    <p>High-quality video calls with friends</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <IoCallOutline size={24} />
                    </div>
                    <h4>Voice Messages</h4>
                    <p>Send quick voice messages anytime</p>
                  </div>
                </div>
                
                <div className="empty-state-actions">
                  <button 
                    className="primary-cta-btn"
                    onClick={openSearch}
                  >
                    <IoSearchOutline size={18} />
                    Find People
                  </button>
                  <button 
                    className="secondary-cta-btn"
                    onClick={() => setShowGroupModal(true)}
                  >
                    <IoPeopleOutline size={18} />
                    New Group
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="quick-tips">
              <h4>Quick Tips</h4>
              <ul>
                <li>Use <kbd>Ctrl/Cmd + K</kbd> to quickly search conversations</li>
                <li>Double-click on any message to react with an emoji</li>
                <li>Right-click on conversations for more options</li>
                <li>Drag and drop files to send them instantly</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {showGroupModal && (
        <GroupChat
          currentUser={currentUser}
          socket={socket}
          onCreateGroup={handleStartGroupChat}
          onClose={() => setShowGroupModal(false)}
          availableUsers={dbUsers}
        />
      )}
      
      {showPollModal && (
        <CreatePoll
          currentUser={currentUser}
          onCreatePoll={handleCreatePoll}
          onClose={() => setShowPollModal(false)}
        />
      )}

      {/* Context Menu */}
      {renderContextMenu()}
    </div>
  );
}

export default ChatLayout;