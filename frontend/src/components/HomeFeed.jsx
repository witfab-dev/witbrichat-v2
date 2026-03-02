import React, { useState } from "react";
import { 
  IoHeartOutline, IoHeart, 
  IoChatbubbleOutline, 
  IoPaperPlaneOutline, 
  IoBookmarkOutline,
  IoStatsChartOutline 
} from "react-icons/io5";

function HomeFeed({ onDirectMessage }) {
  const [likedPosts, setLikedPosts] = useState({});
  const [showPulse, setShowPulse] = useState(null);

  const posts = [
    { id: 1, user: "Witbri_Dev", img: "https://picsum.photos/600/700?random=1", likes: 1240, caption: "Building the future of social tech. 🚀", pulse: { inspired: 85, curious: 15 } },
    { id: 2, user: "React_Master", img: "https://picsum.photos/600/700?random=2", likes: 850, caption: "Clean code is poetry. 💻", pulse: { inspired: 60, curious: 40 } }
  ];

  const toggleLike = (id) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="home-feed-container">
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="insta-post">
            {/* Header */}
            <div className="post-header">
              <div className="post-user-info">
                <div className="post-avatar-small">{post.user[0]}</div>
                <strong>{post.user}</strong>
              </div>
              <IoStatsChartOutline 
                className={`pulse-trigger ${showPulse === post.id ? 'active' : ''}`} 
                onClick={() => setShowPulse(showPulse === post.id ? null : post.id)}
              />
            </div>

            {/* Image Content with Innovation Overlay */}
            <div className="post-image-container">
              <img src={post.img} alt="post" onDoubleClick={() => toggleLike(post.id)} />
              
              {/* Pulse Insight Overlay */}
              {showPulse === post.id && (
                <div className="pulse-overlay">
                  <h4>Live Pulse</h4>
                  <div className="pulse-bar">
                    <div className="pulse-fill inspired" style={{ width: `${post.pulse.inspired}%` }}>
                      Inspired {post.pulse.inspired}%
                    </div>
                  </div>
                  <div className="pulse-bar">
                    <div className="pulse-fill curious" style={{ width: `${post.pulse.curious}%` }}>
                      Curious {post.pulse.curious}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="post-footer">
              <div className="post-actions">
                <div className="left-actions">
                  {likedPosts[post.id] ? (
                    <IoHeart className="post-icon liked" onClick={() => toggleLike(post.id)} />
                  ) : (
                    <IoHeartOutline className="post-icon" onClick={() => toggleLike(post.id)} />
                  )}
                  <IoChatbubbleOutline className="post-icon" />
                  <IoPaperPlaneOutline className="post-icon" onClick={() => onDirectMessage(post.user)} />
                </div>
                <IoBookmarkOutline className="post-icon" />
              </div>

              <div className="post-details">
                <span className="post-likes">
                  {likedPosts[post.id] ? post.likes + 1 : post.likes} likes
                </span>
                <p className="post-caption">
                  <strong>{post.user}</strong> {post.caption}
                </p>
                <span className="view-comments">View all comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeFeed;