import React, { useState } from "react";
import { 
  IoCloseOutline, IoHeartOutline, IoHeart, 
  IoChatbubbleOutline, IoPaperPlaneOutline, IoBookmarkOutline,
  IoEllipsisHorizontal 
} from "react-icons/io5";

const PostDetail = ({ post, onClose, currentUser }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");

  // Logic: Formats the date to look like "2 DAYS AGO"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
  };

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      {/* StopPropagation prevents the modal from closing when clicking inside the box */}
      <div className="post-detail-box" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-post-btn" onClick={onClose}>
          <IoCloseOutline size={30} />
        </button>

        <div className="post-detail-content">
          {/* Left Side: Media */}
          <div className="post-media-side">
            <img 
              src={post.image_url.startsWith('data') ? post.image_url : `http://localhost:3001${post.image_url}`} 
              alt="Post content" 
            />
          </div>

          {/* Right Side: Interactions & Comments */}
          <div className="post-info-side">
            {/* Header: User Info */}
            <div className="post-info-header">
              <div className="user-profile-info">
                <div className="mini-avatar">
                  {post.username ? post.username[0].toUpperCase() : "U"}
                </div>
                <span className="bold-username">{post.username}</span>
                <span className="dot">•</span>
                <button className="follow-link-btn">Following</button>
              </div>
              <IoEllipsisHorizontal className="more-options" />
            </div>

            {/* Comments Area */}
            <div className="comments-scroll-area">
              {/* The Caption is the "first comment" */}
              <div className="comment-item">
                <div className="mini-avatar">{post.username[0].toUpperCase()}</div>
                <div className="comment-text">
                  <span className="bold-username">{post.username}</span> {post.caption}
                  <div className="comment-meta">{formatDate(post.createdAt || new Date())}</div>
                </div>
              </div>
              
              {/* Placeholder for real comments from your database */}
              <div className="empty-comments">
                <p>No comments yet.</p>
                <span>Start the conversation.</span>
              </div>
            </div>

            {/* Interaction Footer */}
            <div className="post-detail-footer">
              <div className="action-buttons">
                <div className="left-actions">
                  <button onClick={() => setIsLiked(!isLiked)}>
                    {isLiked ? <IoHeart className="liked-heart" /> : <IoHeartOutline />}
                  </button>
                  <IoChatbubbleOutline />
                  <IoPaperPlaneOutline />
                </div>
                <IoBookmarkOutline />
              </div>
              
              <div className="likes-count">
                <strong>{isLiked ? (post.likes || 0) + 1 : (post.likes || 0)} likes</strong>
              </div>
              
              <div className="timestamp-footer">
                {formatDate(post.createdAt || new Date())}
              </div>

              {/* Add Comment Input */}
              <div className="add-comment-box">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button 
                  className="post-comment-btn" 
                  disabled={!comment.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;