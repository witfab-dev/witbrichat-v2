import React from "react";
import logo from "/logo.svg"; 
import "./Navigation.css"

import { 
  IoHomeOutline, IoHomeSharp, 
  IoPaperPlaneOutline, IoPaperPlaneSharp, 
  IoFilmOutline, IoFilmSharp, 
  IoHeartOutline, IoHeartSharp,
  IoSearchOutline, IoSearchSharp,
  IoCompassOutline, IoCompassSharp,
  IoMenuOutline, IoPersonCircleOutline,
  IoLogOutOutline, IoAddCircleOutline, IoAddCircleSharp 
} from "react-icons/io5";

function Navigation({ 
  activeTab, 
  setActiveTab, 
  isSearchOpen, 
  setIsSearchOpen, 
  isNotifOpen, 
  setIsNotifOpen, 
  setIsCreateOpen,
  currentUser,
  onLogout,
  unreadCount 
}) {
  
  // 1. Sidebar Links Configuration
  const menu = [
    { id: "home", label: "Home", icon: <IoHomeOutline />, active: <IoHomeSharp /> },
    { id: "search", label: "Search", icon: <IoSearchOutline />, active: <IoSearchSharp /> },
    { id: "explore", label: "Explore", icon: <IoCompassOutline />, active: <IoCompassSharp /> },
    { id: "reels", label: "Reels", icon: <IoFilmOutline />, active: <IoFilmSharp /> },
    { id: "messages", label: "Messages", icon: <IoPaperPlaneOutline />, active: <IoPaperPlaneSharp /> },
    { id: "notifications", label: "Notifications", icon: <IoHeartOutline />, active: <IoHeartSharp /> },
    { id: "create", label: "Create", icon: <IoAddCircleOutline />, active: <IoAddCircleSharp /> },
    { id: "profile", label: "Profile", icon: <IoPersonCircleOutline />, active: <IoPersonCircleOutline /> },
  ];

  // 2. Click Handler
  const handleItemClick = (id) => {
    if (id === "search") {
      setIsSearchOpen(!isSearchOpen);
      setIsNotifOpen(false);
    } else if (id === "notifications") {
      setIsNotifOpen(!isNotifOpen);
      setIsSearchOpen(false);
    } else if (id === "create") {
      setIsCreateOpen(true);
    } else {
      setActiveTab(id);
      setIsSearchOpen(false);
      setIsNotifOpen(false);
    }
  };

  // 3. UI State Helpers
  // The sidebar narrows if a search/notif panel is open OR if we are on the messages tab
  const isNarrow = isSearchOpen || isNotifOpen || activeTab === "messages";

  return (
    <nav className={`nav-sidebar ${isNarrow ? "narrow" : ""}`}>
      <div className="nav-top-section">
        
        {/* LOGO SECTION */}
        <div className="sidebar-header-top" onClick={() => handleItemClick("home")}>
          <div className="witbri-logo-container">
            <img 
               src={logo} 
               alt="Witbri Logo" 
               className="witbri-logo-img" 
            />
          </div>
          {!isNarrow && <span className="witbri-brand-name">WitbriChat</span>}
        </div>
        
        {/* NAVIGATION LINKS */}
        <div className="nav-links">
          {menu.map(item => {
            const isActive = activeTab === item.id;
            const isPanelOpen = (isSearchOpen && item.id === "search") || (isNotifOpen && item.id === "notifications");

            return (
              <div 
                key={item.id} 
                className={`nav-item ${isActive ? "active" : ""} ${isPanelOpen ? "panel-active" : ""}`} 
                onClick={() => handleItemClick(item.id)}
              >
                <span className="nav-icon">
                  {/* Show solid icon if tab is active or its side-panel is open */}
                  {isActive || isPanelOpen ? item.active : item.icon}
                  
                  {/* Notification Badge */}
                  {item.id === "notifications" && unreadCount > 0 && (
                    <span className="nav-badge-count">{unreadCount}</span>
                  )}
                  
                  {/* Small dot for Messages */}
                  {item.id === "messages" && unreadCount > 0 && !isActive && (
                    <span className="nav-badge-dot"></span>
                  )}
                </span>
                
                {!isNarrow && <span className="nav-label">{item.label}</span>}
                
                {/* Tooltip for narrow mode */}
                {isNarrow && <div className="nav-tooltip">{item.label}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="nav-bottom-section">
        <div className="nav-item logout-item" onClick={onLogout}>
          <span className="nav-icon"><IoLogOutOutline /></span>
          {!isNarrow && <span className="nav-label">Logout</span>}
          {isNarrow && <div className="nav-tooltip">Logout</div>}
        </div>

        <div className="nav-item more-menu">
          <span className="nav-icon"><IoMenuOutline /></span>
          {!isNarrow && <span className="nav-label">More</span>}
          {isNarrow && <div className="nav-tooltip">Settings</div>}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;