import React, { useState } from "react";
import { 
  IoCallOutline, IoVideocamOutline, IoInformationCircleOutline, 
  IoHappyOutline, IoImageOutline, IoHeartOutline, IoArrowBack,
  IoMicOutline, IoDocumentOutline, IoGiftOutline, IoTimeOutline
} from "react-icons/io5";
import VoiceMessage from "./VoiceMessage";
import GroupChat from "./GroupChat";
import Poll from "./Poll";
import "./EnhancedChatWindow.css";

const EnhancedChatWindow = ({ socket, user, room, onBack }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  // Handle voice message sending
  const handleSendVoice = (audioBlob) => {
    const voiceData = {
      room: room,
      user: user.username,
      audio: audioBlob,
      time: new Date().toISOString(),
      type: 'voice'
    };
    socket.emit("send_voice_message", voiceData);
    setShowVoiceRecorder(false);
  };

  // Handle poll creation
  const handleSendPoll = (pollData) => {
    const pollMessage = {
      room: room,
      user: user.username,
      poll: pollData,
      time: new Date().toISOString(),
      type: 'poll'
    };
    socket.emit("send_poll", pollMessage);
  };

  // Handle file upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      // Preview and upload files
      files.forEach(file => {
        const fileData = {
          room: room,
          user: user.username,
          file: file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          time: new Date().toISOString(),
          type: 'file'
        };
        socket.emit("send_file", fileData);
      });
      setShowFilePicker(false);
    }
  };

  // Typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { room, user: user.username });
      setTimeout(() => {
        setIsTyping(false);
        socket.emit("stop_typing", { room, user: user.username });
      }, 3000);
    }
  };

  return (
    <div className="enhanced-chat-window">
      {/* Header */}
      <div className="enhanced-chat-header">
        <div className="header-left-section">
          <button className="mobile-back-btn" onClick={onBack}>
            <IoArrowBack size={24} />
          </button>

          <div className="user-info-avatar">
            <div className="user-avatar-large">
              {room ? room[0].toUpperCase() : "?"}
            </div>
            <div className="user-status">
              <span className="username-display">{room}</span>
              <span className={`typing-indicator ${otherTyping ? 'visible' : ''}`}>
                {otherTyping ? "typing..." : "Active now"}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <GroupChat currentUser={user} socket={socket} />
          <button className="action-btn" title="Voice Call">
            <IoCallOutline size={22} />
          </button>
          <button className="action-btn" title="Video Call">
            <IoVideocamOutline size={22} />
          </button>
          <button className="action-btn" title="Info">
            <IoInformationCircleOutline size={22} />
          </button>
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="enhanced-chat-area">
        {/* Features Bar */}
        <div className="features-bar">
          <Poll onSend={handleSendPoll} currentUser={user} />
          <button className="feature-btn" onClick={() => setShowVoiceRecorder(true)}>
            <IoMicOutline size={20} />
            <span>Voice</span>
          </button>
          <button className="feature-btn" onClick={() => setShowFilePicker(true)}>
            <IoDocumentOutline size={20} />
            <span>File</span>
          </button>
          <button className="feature-btn">
            <IoGiftOutline size={20} />
            <span>Gift</span>
          </button>
          <button className="feature-btn">
            <IoTimeOutline size={20} />
            <span>Schedule</span>
          </button>
        </div>

        {/* Message Area */}
        <div className="messages-container">
          {/* Messages will be rendered here */}
        </div>

        {/* Voice Recorder Modal */}
        {showVoiceRecorder && (
          <div className="voice-recorder-modal">
            <VoiceMessage 
              onSend={handleSendVoice}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* File Picker */}
        {showFilePicker && (
          <div className="file-picker-overlay" onClick={() => setShowFilePicker(false)}>
            <div className="file-picker" onClick={(e) => e.stopPropagation()}>
              <div className="file-picker-header">
                <h4>Send Files</h4>
                <button onClick={() => setShowFilePicker(false)}>×</button>
              </div>
              <div className="file-options">
                <label className="file-option-btn">
                  <IoDocumentOutline size={32} />
                  <span>Document</span>
                  <input 
                    type="file" 
                    hidden 
                    multiple 
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
                <label className="file-option-btn">
                  <IoImageOutline size={32} />
                  <span>Photos</span>
                  <input 
                    type="file" 
                    hidden 
                    multiple 
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="enhanced-input-area">
        <button 
          className="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <IoHappyOutline size={24} />
        </button>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Send message
                setMessage("");
              }
            }}
          />
          <div className="input-actions">
            <button className="input-action-btn" onClick={() => setShowFilePicker(true)}>
              <IoImageOutline size={20} />
            </button>
            <button className="input-action-btn" onClick={() => setShowVoiceRecorder(true)}>
              <IoMicOutline size={20} />
            </button>
          </div>
        </div>

        <button className="send-btn">
          <IoHeartOutline size={20} />
        </button>
      </div>
    </div>
  );
};

export default EnhancedChatWindow;