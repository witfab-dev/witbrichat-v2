import React from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button 
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <IoSunnyOutline size={22} />
      ) : (
        <IoMoonOutline size={22} />
      )}
    </button>
  );
};

export default ThemeToggle;