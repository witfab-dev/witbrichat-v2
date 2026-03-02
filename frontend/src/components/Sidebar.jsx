import React, { useState, useEffect } from "react";
import { 
  IoCreateOutline, 
  IoSearchOutline, 
  IoPersonCircleOutline, 
  IoChevronDownOutline 
} from "react-icons/io5";

function Sidebar({ 
  dbUsers = [], 
  onlineUsers = [], 
  lastMessages = [], 
  activeChat, 
  setActiveChat, 
  currentUser,
  isLoading,
  socket 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [livePreviews, setLivePreviews] = useState({});

  // 1. Sync Last Messages from Database (Initial Load)
  useEffect(() => {
    if (lastMessages && Array.isArray(lastMessages)) {
      const initialMap = {};
      lastMessages.forEach(m => {
        initialMap[m.room_name] = m.message_text;
      });
      setLivePreviews(initialMap);
    }
  }, [lastMessages]);

  // 2. Real-time Socket Listener for Live Previews (While App is Open)
  useEffect(() => {
    if (!socket) return;
    
    const handleLiveMsg = (data) => {
      // data typically contains { room, message, sender }
      setLivePreviews(prev => ({
        ...prev,
        [data.room]: data.message
      }));
    };

    socket.on("receive_message", handleLiveMsg);
    return () => socket.off("receive_message", handleLiveMsg);
  }, [socket]);

  // 3. Filter Logic
  // We filter out the current user and filter by the search term
  const filteredUsers = (dbUsers || []).filter((u) => {
    if (!u || !u.username || !currentUser) return false;
    const isNotMe = u.username !== currentUser.username;
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotMe && matchesSearch;
  });

  // 4. Helper to get preview text using the generated Room ID
  const getLastMsg = (targetUsername) => {
    if (!currentUser) return "Loading...";
    // Room naming convention: alpha-sorted usernames joined by underscore
    const roomId = [currentUser.username, targetUsername].sort().join("_");
    const msgText = livePreviews[roomId];
    
    if (!msgText) return "Active now"; 
    
    return msgText.length > 25 ? msgText.substring(0, 25) + "..." : msgText;
  };

  return (
    <div className="sidebar">
      {/* --- HEADER --- */}
      <div className="sidebar-header">
        <div className="header-top">
          <div className="username-section">
            <span className="username-display">
              {currentUser?.username || "Loading..."}
            </span>
            <IoChevronDownOutline className="dropdown-arrow" />
          </div>
          <IoCreateOutline className="create-icon" title="New Message" />
        </div>
      </div>

      {/* --- SEARCH BOX --- */}
      <div className="sidebar-search">
        <div className="search-box">
          <IoSearchOutline className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* --- USER LIST --- */}
      <div className="user-list">
        <div className="list-title">
          <span className="title-bold">Messages</span>
          <span className="requests-link">Requests</span>
        </div>
        
        {isLoading ? (
          <div className="sidebar-loader-container">
            <div className="insta-spinner"></div>
            <p className="loading-text">Finding friends...</p>
          </div>
        ) : (
          <div className="scrollable-users">
            {filteredUsers.length === 0 ? (
              <div className="no-users-found">
                <div className="empty-icon-circle">
                  <IoSearchOutline size={30} />
                </div>
                <p>
                  {searchTerm 
                    ? `No results for "${searchTerm}"` 
                    : "No conversations yet."}
                </p>
                {!searchTerm && (
                  <button className="primary-cta-btn">Find People</button>
                )}
              </div>
            ) : (
              filteredUsers.map((userObj) => {
                const isOnline = onlineUsers.includes(userObj.username);
                const isActive = activeChat === userObj.username;

                return (
                  <div 
                    key={userObj.id || userObj.username} 
                    className={`user-item ${isActive ? "active-item" : ""}`}
                    onClick={() => setActiveChat(userObj.username)}
                  >
                    {/* Avatar with dynamic ring */}
                    <div className={`avatar-ring ${isOnline ? "online" : ""}`}>
                      <div className="avatar-white-border">
                        <div className="avatar-img">
                          {userObj.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* User Info & Preview */}
                    <div className="user-info">
                      <span className="user-name">{userObj.username}</span>
                      <div className="last-msg-row">
                        <span className={`last-message-preview ${!livePreviews[[currentUser.username, userObj.username].sort().join("_")] ? 'active-status' : ''}`}>
                          {getLastMsg(userObj.username)}
                        </span>
                        <span className="time-divider">·</span>
                        <span className="msg-time-stamp">now</span>
                      </div>
                    </div>

                    {/* Unread/Status Indicator */}
                    {isOnline && <div className="online-indicator-dot"></div>}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;