import React, { useState } from "react";
import axios from "axios";
import { 
  IoCloseOutline, 
  IoArrowBackOutline, 
  IoImageOutline, 
  IoHappyOutline, 
  IoLocationOutline 
} from "react-icons/io5";
import "./CreatePost.css";

const CreatePost = ({ currentUser, onShare, onClose }) => {
  const [step, setStep] = useState(1); // 1: Select, 2: Edit/Caption
  const [mediaPreview, setMediaPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // --- 1. HANDLE FILE SELECTION ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreview(event.target.result); // Base64 string for instant preview
        setStep(2);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }
  };

  // --- 2. SUBMIT TO DATABASE ---
  const handleFinalShare = async () => {
    if (!mediaPreview) return;
    
    setIsUploading(true);
    
    const postData = {
      image: mediaPreview, // Sending as Base64 to match server LONGTEXT column
      caption: caption,
    };

    try {
      const response = await axios.post("http://localhost:3001/api/posts", postData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`, // Required for authenticateToken middleware
          "Content-Type": "application/json"
        }
      });

      if (response.status === 201 || response.status === 200) {
        // response.data should return the new post object from MySQL
        onShare(response.data); 
        onClose();
      }
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to share post. Check server connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-modal-overlay">
      <div className={`create-modal-box ${step === 2 ? "expanded" : ""}`}>
        
        {/* MODAL HEADER */}
        <div className="create-modal-header">
          {step === 2 && !isUploading ? (
            <IoArrowBackOutline 
              onClick={() => setStep(1)} 
              className="back-icon" 
            />
          ) : step === 1 ? (
            <div style={{ width: 24 }}></div> 
          ) : null}
          
          <h3>{step === 1 ? "Create new post" : "Preview & Caption"}</h3>
          
          {step === 2 ? (
            <button 
              className="share-btn" 
              onClick={handleFinalShare}
              disabled={isUploading}
            >
              {isUploading ? "Sharing..." : "Share"}
            </button>
          ) : (
            <IoCloseOutline onClick={onClose} className="close-icon" />
          )}
        </div>

        {/* MODAL CONTENT */}
        <div className="create-modal-content">
          {step === 1 ? (
            /* STEP 1: UPLOAD AREA */
            <div className="upload-dropzone">
              <IoImageOutline size={64} strokeWidth={1} />
              <p>Select photos and videos here</p>
              <label htmlFor="file-upload" className="primary-cta-btn">
                Select from computer
              </label>
              <input 
                id="file-upload" 
                type="file" 
                hidden 
                onChange={handleFileSelect} 
                accept="image/*" 
              />
            </div>
          ) : (
            /* STEP 2: EDITOR LAYOUT */
            <div className="post-editor-layout">
              <div className="preview-container">
                <img src={mediaPreview} alt="Selected preview" />
              </div>

              <div className="caption-side-panel">
                <div className="user-mini-info">
                  <div className="mini-avatar">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="User" />
                    ) : (
                      currentUser.username?.[0].toUpperCase()
                    )}
                  </div>
                  <span className="editor-username">{currentUser.username}</span>
                </div>

                <textarea 
                  placeholder="Write a caption..." 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength="2200"
                />

                <div className="editor-footer-tools">
                  <div className="tool-item">
                    <IoHappyOutline />
                    <span className="char-count">{caption.length}/2,200</span>
                  </div>
                  <div className="tool-item border-top">
                    <span>Add location</span>
                    <IoLocationOutline />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;