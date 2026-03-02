import React, { useState, useEffect, useRef } from "react";
import { 
  IoCallOutline, IoVideocamOutline, IoInformationCircleOutline, 
  IoHappyOutline, IoImageOutline, IoHeartOutline, IoArrowBack 
} from "react-icons/io5";

function ChatWindow({ socket, user, room, onBack }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomRef = useRef();

  // Create a consistent Room ID between two users
  const privateRoomId = [user.username, room].sort().join("_");

  // --- 1. LOAD HISTORY & JOIN ROOM ---
  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const response = await fetch(`/messages/${privateRoomId}`);
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        if (isMounted) setChat(data);
      } catch (err) {
        console.error("Error loading chat history:", err);
        if (isMounted) setChat([]); 
      }
    };

    if (room) {
      loadHistory();
      socket.emit("join_room", privateRoomId);
    }

    return () => {
      isMounted = false;
      // Optionally emit a leave_room if your backend handles it
    };
  }, [room, privateRoomId, socket]);

  // --- 2. SOCKET LISTENERS (Centralized) ---
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // Only append if it's for this room AND not already in state 
      // (to prevent duplicates if you use optimistic updates)
      if (data.room === privateRoomId) {
        setChat((prev) => {
          // Check if message already exists (useful for optimistic UI)
          const isDuplicate = prev.some(m => m.id === data.id || (m.message === data.message && m.time === data.time && m.user === data.user));
          return isDuplicate ? prev : [...prev, data];
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [socket, privateRoomId]);

  // --- 3. AUTO SCROLL ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // --- 4. SEND MESSAGE HANDLER ---
  const sendMsg = () => {
    if (message.trim() === "") return;

    const msgData = {
      room: privateRoomId,
      user: user.username,
      message: message,
      // Use ISO string for backend sorting, format on display
      time: new Date().toISOString() 
    };

    // Emit to server
    socket.emit("send_message", msgData);
    
    // Optimistic Update: Add to UI immediately
    setChat((prev) => [...prev, msgData]);
    setMessage("");
  };

  // Helper to format time safely
  const formatTime = (timeStr) => {
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="chat-window">
      {/* --- HEADER --- */}
      <div className="chat-header">
        <div className="header-info">
          <button className="mobile-back-btn" onClick={onBack}>
            <IoArrowBack size={24} />
          </button>

          <div className="avatar-small">
            {room ? room[0].toUpperCase() : "?"}
          </div>
          
          <div className="header-text">
            <span className="username-title">{room}</span>
            <span className="active-status">Active now</span>
          </div>
        </div>

        <div className="header-actions">
          <IoCallOutline className="action-icon" />
          <IoVideocamOutline className="action-icon" />
          <IoInformationCircleOutline className="action-icon" />
        </div>
      </div>

      {/* --- MESSAGE LIST --- */}
      <div className="chat-messages">
        {chat.length === 0 ? (
          <div className="chat-begin-prompt">
            <div className="avatar-large">{room ? room[0].toUpperCase() : "!"}</div>
            <h3>{room}</h3>
            <p>WitbriChat user</p>
            <button className="view-profile-btn">View Profile</button>
          </div>
        ) : (
          chat.map((m, i) => (
            <div key={i} className={`msg-wrapper ${m.user === user.username ? "me" : "them"}`}>
              <div className="insta-bubble" title={formatTime(m.time)}>
                {m.message}
              </div>
              {/* Show timestamp/seen only on latest message */}
              {i === chat.length - 1 && m.user === user.username && (
                <span className="seen-status">Sent {formatTime(m.time)}</span>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* --- FOOTER INPUT --- */}
      <div className="chat-footer">
        <div className="pill-input">
          <button className="tool-btn"><IoHappyOutline /></button>
          
          <input 
            placeholder="Message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          />

          {message.trim() ? (
            <button className="send-link-btn" onClick={sendMsg}>Send</button>
          ) : (
            <div className="input-tools">
              <button className="tool-btn"><IoImageOutline /></button>
              <button className="tool-btn"><IoHeartOutline /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;