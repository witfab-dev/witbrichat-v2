import React, { useState, useEffect } from "react";
import { 
  IoHeart, 
  IoPersonAdd, 
  IoChatbubble, 
  IoCloseOutline, 
  IoEllipsisHorizontal 
} from "react-icons/io5";
import "./Notifications.css";

const Notifications = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState("All");
  
  // 1. Initial State (This would eventually be fetched from your MySQL 'notifications' table)
  const [notifications, setNotifications] = useState([
    { id: 1, type: "like", user: "alex_dev", avatar: null, text: "liked your post.", time: "2h", read: false },
    { id: 2, type: "follow", user: "sarah_j", avatar: null, text: "started following you.", time: "5h", read: true },
    { id: 3, type: "comment", user: "mike_codes", avatar: null, text: 'commented: "This looks amazing! 🔥"', time: "1d", read: true },
    { id: 4, type: "follow", user: "creative_mind", avatar: null, text: "requested to follow you.", time: "2d", read: false },
  ]);

  // 2. Remove Individual Notification
  const handleRemoveItem = (id, e) => {
    e.stopPropagation(); // Prevent navigation/read triggers
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  // 3. Icon Helper
  const getActionIcon = (type) => {
    switch (type) {
      case "like": return <IoHeart className="notif-icon-like" />;
      case "follow": return <IoPersonAdd className="notif-icon-follow" />;
      case "comment": return <IoChatbubble className="notif-icon-comment" />;
      default: return null;
    }
  };

  return (
    <div className={`notifications-panel ${isOpen ? "open" : ""}`}>
      {/* HEADER SECTION */}
      <div className="notif-header">
        <div className="notif-title-row">
          <h2>Notifications</h2>
          {/* Main Panel Close Cross */}
          <IoCloseOutline className="panel-close-x" onClick={onClose} />
        </div>

        <div className="notif-filters">
          {["All", "Following", "Posts"].map((tab) => (
            <button 
              key={tab} 
              className={filter === tab ? "active" : ""} 
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="notif-list">
        {notifications.length > 0 ? (
          <div className="notif-section">
            <h3 className="notif-section-title">Newest</h3>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notif-item ${!notif.read ? "unread" : ""}`}
              >
                {/* Avatar with Action Badge */}
                <div className="notif-avatar-container">
                  <div className="notif-avatar-inner">
                    {notif.avatar ? (
                      <img src={notif.avatar} alt={notif.user} />
                    ) : (
                      notif.user[0].toUpperCase()
                    )}
                  </div>
                  <div className="notif-type-icon">
                    {getActionIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="notif-content">
                  <p>
                    <span className="notif-user">{notif.user}</span>
                    <span className="notif-text">{notif.text}</span>
                    <span className="notif-timestamp">{notif.time}</span>
                  </p>
                </div>

                {/* Right Side Actions */}
                <div className="notif-actions">
                  {notif.type === "follow" && (
                    <button className="notif-btn-primary">Follow</button>
                  )}
                  {/* Individual Close Cross */}
                  <IoCloseOutline 
                    className="notif-remove-btn" 
                    onClick={(e) => handleRemoveItem(notif.id, e)} 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notifs">
            <IoHeart className="empty-icon" />
            <p>No new activity yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;