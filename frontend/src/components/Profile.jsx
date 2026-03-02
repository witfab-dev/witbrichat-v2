import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  IoGridOutline, IoBookmarkOutline, IoSettingsOutline, 
  IoShieldCheckmark, IoAddCircle, IoHeart, IoChatbubble,
  IoArrowBackOutline
} from "react-icons/io5";

// Child Components
import PostDetail from "./PostDetail.jsx";
import BioEditor from "./BioEditor.jsx";
import ProfilePicUploader from "./ProfilePicUploader.jsx";
import "./Profile.css";

const Profile = ({ currentUser, setIsCreateOpen, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- 1. DATA RETRIEVAL LOGIC ---
  const fetchMyPosts = async () => {
    if (!currentUser?.username) return;
    
    setLoading(true);
    try {
      // Fetching from your Node/Express backend
      const res = await axios.get(`http://localhost:3001/api/posts/user/${currentUser.username}`);
      
      // Sort: Newest posts first (descending by date)
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUserPosts(sorted);
    } catch (err) {
      console.error("Error retrieving posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run fetch whenever the username changes (or component mounts)
  useEffect(() => {
    fetchMyPosts();
  }, [currentUser.username]);

  // --- 2. ACTION HANDLERS ---
  const handleBioSave = async (newBio) => {
    // Call parent update function to sync with DB and App state
    await onUpdateProfile({ bio: newBio });
    setIsEditMode(false);
  };

  const handlePicUpdate = async (newPic) => {
    await onUpdateProfile({ avatar: newPic });
  };

  // --- 3. SUB-RENDER: EDIT PROFILE VIEW ---
  if (isEditMode) {
    return (
      <div className="profile-wrapper edit-mode">
        <header className="edit-header">
          <button className="back-btn" onClick={() => setIsEditMode(false)}>
            <IoArrowBackOutline /> Back to Profile
          </button>
          <h2>Edit Profile</h2>
          <div style={{ width: 40 }}></div>
        </header>

        <div className="edit-container">
          <ProfilePicUploader 
            currentPic={currentUser.avatar} 
            onUpdatePic={handlePicUpdate} 
          />
          <hr className="edit-divider" />
          <BioEditor 
            currentBio={currentUser.bio} 
            onSaveBio={handleBioSave} 
          />
        </div>
      </div>
    );
  }

  // --- 4. MAIN RENDER: PROFILE VIEW ---
  return (
    <div className="profile-wrapper">
      <header className="profile-header-main">
        {/* Avatar Section */}
        <div className="profile-pic-container">
          <div className="profile-pic-gradient">
            <div className="profile-pic-internal">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="avatar-img-fixed" />
              ) : (
                <span className="avatar-initial">
                  {currentUser.username?.[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button 
            className="avatar-add-badge" 
            onClick={() => setIsCreateOpen(true)}
          >
            <IoAddCircle />
          </button>
        </div>

        {/* User Info Section */}
        <section className="profile-details">
          <div className="details-top">
            <h2 className="profile-username">
              {currentUser.username} <IoShieldCheckmark className="verified-icon" />
            </h2>
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={() => setIsEditMode(true)}>
                Edit Profile
              </button>
              <button className="settings-icon-btn"><IoSettingsOutline /></button>
            </div>
          </div>

          <div className="details-stats">
            <span><strong>{userPosts.length}</strong> posts</span>
            <span><strong>254</strong> followers</span>
            <span><strong>180</strong> following</span>
          </div>

          <div className="details-bio">
            <p className="bio-name">{currentUser.name || currentUser.username}</p>
            <p className="bio-text">{currentUser.bio || "No bio yet."}</p>
          </div>
        </section>
      </header>

      {/* Tabs Navigation */}
      <div className="profile-tabs-nav">
        <button 
          className={activeTab === "posts" ? "active" : ""} 
          onClick={() => setActiveTab("posts")}
        >
          <IoGridOutline /> POSTS
        </button>
        <button 
          className={activeTab === "saved" ? "active" : ""} 
          onClick={() => setActiveTab("saved")}
        >
          <IoBookmarkOutline /> SAVED
        </button>
      </div>

      {/* Posts Grid Area */}
      <div className="profile-posts-grid">
        {loading ? (
          <div className="grid-loader">
            <div className="spinner"></div>
            <p>Loading your moments...</p>
          </div>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div 
              key={post._id || post.id} 
              className="grid-item" 
              onClick={() => setSelectedPost(post)}
            >
              <img 
                src={post.image.startsWith('data') ? post.image : `http://localhost:3001${post.image}`} 
                alt="Post Preview" 
              />
              <div className="grid-overlay">
                <div className="overlay-stat"><IoHeart /> {post.likes || 0}</div>
                <div className="overlay-stat"><IoChatbubble /> {post.comments?.length || 0}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-grid-state">
            <div className="empty-icon-circle"><IoGridOutline /></div>
            <h3>Share Photos</h3>
            <p>When you share photos, they will appear on your profile.</p>
            <button onClick={() => setIsCreateOpen(true)} className="create-first-btn">
              Share your first photo
            </button>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetail 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
          currentUser={currentUser} 
          refreshPosts={fetchMyPosts}
        />
      )}
    </div>
  );
};

export default Profile;