import React, { useState } from "react";
import { IoAddCircleOutline, IoPlay, IoClose } from "react-icons/io5";
import "./Stories.css";

const Stories = ({ currentUser, stories = [] }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const userStories = [
    { id: 1, user: "jessica_", avatar: null, type: "image", url: "https://picsum.photos/400/700?random=1", duration: 5000 },
    { id: 2, user: "mike_design", avatar: null, type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-near-the-shore-34254-large.mp4", duration: 10000 },
    { id: 3, user: "travel_buddy", avatar: null, type: "image", url: "https://picsum.photos/400/700?random=3", duration: 5000 },
    { id: 4, user: "tech_guru", avatar: null, type: "image", url: "https://picsum.photos/400/700?random=4", duration: 5000 },
    { id: 5, user: "foodie_joy", avatar: null, type: "image", url: "https://picsum.photos/400/700?random=5", duration: 5000 },
  ];

  const openStory = (story, index) => {
    setSelectedStory(story);
    setCurrentIndex(index);
  };

  const closeStory = () => {
    setSelectedStory(null);
    setCurrentIndex(0);
  };

  const nextStory = () => {
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedStory(userStories[currentIndex + 1]);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedStory(userStories[currentIndex - 1]);
    }
  };

  return (
    <div className="stories-container">
      <div className="stories-scroll">
        {/* Your Story */}
        <div className="story-item your-story">
          <div className="story-avatar-wrapper">
            <div className="story-avatar-inner">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="You" />
              ) : (
                <span>{currentUser?.username?.[0]?.toUpperCase() || "Y"}</span>
              )}
            </div>
            <button className="add-story-btn">
              <IoAddCircleOutline size={24} />
            </button>
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* Other Stories */}
        {userStories.map((story, index) => (
          <div 
            key={story.id} 
            className="story-item"
            onClick={() => openStory(story, index)}
          >
            <div className="story-avatar-wrapper has-story">
              <div className="story-avatar-inner">
                {story.avatar ? (
                  <img src={story.avatar} alt={story.user} />
                ) : (
                  <span>{story.user[0].toUpperCase()}</span>
                )}
              </div>
              {story.type === "video" && (
                <div className="story-type-indicator">
                  <IoPlay size={12} />
                </div>
              )}
            </div>
            <span className="story-username">{story.user}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="story-viewer-overlay">
          <div className="story-viewer">
            {/* Progress Bars */}
            <div className="story-progress-bars">
              {userStories.map((_, index) => (
                <div key={index} className="progress-bar-container">
                  <div 
                    className={`progress-bar ${index < currentIndex ? "completed" : ""} ${index === currentIndex ? "active" : ""}`}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="story-header">
              <div className="story-user-info">
                <div className="story-viewer-avatar">
                  {selectedStory.user[0].toUpperCase()}
                </div>
                <span className="story-viewer-username">{selectedStory.user}</span>
                <span className="story-time">2h ago</span>
              </div>
              <button className="close-story-btn" onClick={closeStory}>
                <IoClose size={28} />
              </button>
            </div>

            {/* Story Content */}
            <div className="story-content">
              {selectedStory.type === "image" ? (
                <img src={selectedStory.url} alt="Story" />
              ) : (
                <video src={selectedStory.url} autoPlay controls />
              )}
            </div>

            {/* Interaction Area */}
            <div className="story-interactions">
              <div className="story-left-area" onClick={prevStory}></div>
              <div className="story-right-area" onClick={nextStory}></div>
              <div className="story-reply-box">
                <input type="text" placeholder="Send message" />
                <button className="send-reply-btn">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;