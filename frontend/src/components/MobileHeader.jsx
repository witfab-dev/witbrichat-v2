import React from "react";
import logo from "/logo.svg";
import "./MobileHeader.css";
import { IoSearchOutline, IoHeartOutline } from "react-icons/io5";

function MobileHeader({ onSearchClick, onNotifClick }) {
  return (
    <header className="mobile-header">
      <div className="mobile-logo-section">
        <img src={logo} alt="Witbri Logo" className="mobile-logo-img" />
        <span className="mobile-brand-name">WitbriChat</span>
      </div>
      
      <div className="mobile-actions">
        <button className="mobile-icon-btn" onClick={onSearchClick}>
          <IoSearchOutline size={24} />
        </button>
        <button className="mobile-icon-btn" onClick={onNotifClick}>
          <IoHeartOutline size={24} />
        </button>
      </div>
    </header>
  );
}

export default MobileHeader;