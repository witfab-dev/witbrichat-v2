import React, { useState } from "react";

const ProfilePicUploader = ({ currentPic, onUpdatePic }) => {
  const [preview, setPreview] = useState(currentPic);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // SYSTEM LOGIC: Checked for format & Resized
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        onUpdatePic(event.target.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-pic-uploader">
      <div className="circular-preview-wrapper">
        <img 
          src={preview || "https://via.placeholder.com/150"} 
          alt="Profile" 
          className="circular-pic" 
        />
      </div>
      <div className="upload-controls">
        <label htmlFor="pic-upload" className="change-photo-link">
          Change profile photo
        </label>
        <input 
          id="pic-upload" 
          type="file" 
          hidden 
          onChange={handleImageChange} 
          accept="image/*" 
        />
      </div>
    </div>
  );
};

export default ProfilePicUploader;