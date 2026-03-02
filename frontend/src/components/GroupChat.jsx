import React, { useState } from "react";
import { IoPeople, IoAdd, IoSearch, IoVideocam, IoCall, IoInformationCircle } from "react-icons/io5";
import "./GroupChat.css";

const GroupChat = ({ currentUser, socket, onCreateGroup }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([
    { id: 1, username: "alex_w", avatar: null, online: true },
    { id: 2, username: "sarah_m", avatar: null, online: true },
    { id: 3, username: "mike_t", avatar: null, online: false },
    { id: 4, username: "julia_r", avatar: null, online: true },
    { id: 5, username: "tom_k", avatar: null, online: false },
  ]);

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const createGroup = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      const groupData = {
        name: groupName,
        members: [...selectedUsers.map(u => u.username), currentUser.username],
        createdBy: currentUser.username,
        avatar: null
      };
      
      socket.emit("create_group", groupData);
      onCreateGroup?.(groupData);
      setShowCreateModal(false);
      setGroupName("");
      setSelectedUsers([]);
    }
  };

  return (
    <>
      <button 
        className="create-group-btn"
        onClick={() => setShowCreateModal(true)}
      >
        <IoPeople size={20} />
        <span>New Group</span>
      </button>

      {showCreateModal && (
        <div className="group-modal-overlay">
          <div className="group-modal">
            <div className="group-modal-header">
              <h3>New Group Chat</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="group-form">
              <div className="form-section">
                <label>Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="form-section">
                <label>Add Members ({selectedUsers.length} selected)</label>
                <div className="search-members">
                  <IoSearch />
                  <input type="text" placeholder="Search users..." />
                </div>
              </div>

              <div className="selected-users-display">
                {selectedUsers.map(user => (
                  <div key={user.id} className="selected-user-chip">
                    <span>{user.username}</span>
                    <button onClick={() => toggleUserSelection(user)}>×</button>
                  </div>
                ))}
              </div>

              <div className="users-list">
                {availableUsers.map(user => (
                  <div 
                    key={user.id} 
                    className={`user-select-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="user-select-avatar">
                      {user.username[0].toUpperCase()}
                      {user.online && <span className="online-dot" />}
                    </div>
                    <div className="user-select-info">
                      <span className="username">{user.username}</span>
                      <span className="status">{user.online ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="selection-checkbox">
                      {selectedUsers.some(u => u.id === user.id) && (
                        <div className="checkmark">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="create-btn"
                  onClick={createGroup}
                  disabled={!groupName.trim() || selectedUsers.length < 2}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChat;