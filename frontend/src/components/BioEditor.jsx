import React, { useState, useEffect } from "react";
import { IoCheckmarkCircle, IoAlertCircleOutline, IoSparklesOutline } from "react-icons/io5";

const BioEditor = ({ currentBio, onSaveBio }) => {
  const [bioText, setBioText] = useState(currentBio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const LIMIT = 150;

  // Auto-hide success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleChange = (e) => {
    if (e.target.value.length <= LIMIT) {
      setBioText(e.target.value);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    // Simulate network delay for professional feel
    await new Promise(resolve => setTimeout(resolve, 800));
    onSaveBio(bioText);
    setIsSaving(false);
    setShowSuccess(true);
  };

  const isNearLimit = bioText.length >= LIMIT - 15;

  return (
    <div className="professional-bio-container">
      <div className="bio-header-row">
        <label className="bio-label">
          <IoSparklesOutline /> Public Bio
        </label>
        {showSuccess && (
          <span className="bio-success-tag">
            <IoCheckmarkCircle /> Saved
          </span>
        )}
      </div>

      <div className={`bio-input-wrapper ${isNearLimit ? "bio-warning" : ""}`}>
        <textarea
          className="professional-textarea"
          value={bioText}
          onChange={handleChange}
          placeholder="Write something professional about yourself..."
        />
        <div className={`bio-char-counter ${isNearLimit ? "danger" : ""}`}>
          {isNearLimit && <IoAlertCircleOutline />}
          {bioText.length} / {LIMIT}
        </div>
      </div>

      <p className="bio-help-text">
        Pro tip: Mention your role or use #hashtags to be discoverable.
      </p>

      <button 
        className={`bio-save-btn ${isSaving ? "btn-loading" : ""}`}
        onClick={handleUpdate}
        disabled={isSaving || bioText === currentBio}
      >
        {isSaving ? "Syncing..." : "Update Bio"}
      </button>
    </div>
  );
};

export default BioEditor;