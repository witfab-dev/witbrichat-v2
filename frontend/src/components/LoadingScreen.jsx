import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingScreen;