import React, { useState, useRef, useEffect } from "react";
import { 
  IoHeartOutline, IoHeart, IoChatbubbleOutline, 
  IoPaperPlaneOutline, IoEllipsisHorizontal, IoMusicalNotesOutline 
} from "react-icons/io5";

const VIDEO_DATA = [
  {
    id: 1,
    url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-4725-large.mp4",
    user: "nature_vibes",
    caption: "Golden hour is the best hour 🍂✨ #nature #goldenhour",
    likes: "42.1k",
  },
  {
    id: 2,
    url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-near-the-shore-34254-large.mp4",
    user: "ocean_traveler",
    caption: "Deep blue therapy. 🌊 Who else misses the beach?",
    likes: "18.5k",
  },
  {
    id: 3,
    url: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-mountain-landscape-42526-large.mp4",
    user: "alpine_explorer",
    caption: "Above the clouds. 🏔️ Exploring the peaks today.",
    likes: "31.2k",
  }
];

function ReelItem({ video }) {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="reel-item">
      <video
        ref={videoRef}
        onClick={togglePlay}
        className="reel-video"
        src={video.url}
        loop
      />
      
      {/* Interaction Overlay (Right Side) */}
      <div className="reel-actions">
        <div className="action-btn" onClick={() => setLiked(!liked)}>
          {liked ? <IoHeart color="#ff3040" size={32} /> : <IoHeartOutline size={32} />}
          <span>{video.likes}</span>
        </div>
        <div className="action-btn">
          <IoChatbubbleOutline size={30} />
          <span>842</span>
        </div>
        <div className="action-btn">
          <IoPaperPlaneOutline size={30} />
        </div>
        <div className="action-btn">
          <IoEllipsisHorizontal size={24} />
        </div>
      </div>

      {/* User Info Overlay (Bottom) */}
      <div className="reel-details">
        <div className="reel-user-row">
          <div className="user-avatar-mini">{video.user[0].toUpperCase()}</div>
          <span className="reel-username">{video.user}</span>
          <button className="reel-follow-btn">Follow</button>
        </div>
        <p className="reel-caption">{video.caption}</p>
        <div className="reel-music-bar">
          <IoMusicalNotesOutline />
          <div className="music-scroll">
            <span>{video.user} • Original Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reels() {
  return (
    <div className="reels-feed">
      {VIDEO_DATA.map((video) => (
        <ReelItem key={video.id} video={video} />
      ))}
    </div>
  );
}

export default Reels;