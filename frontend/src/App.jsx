import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import io from "socket.io-client";
import axios from "axios";

// Component Imports
import Navigation from "./components/Navigation.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import HomeFeed from "./components/HomeFeed.jsx";
import ChatLayout from "./components/ChatLayout.jsx";
import Auth from "./components/Auth.jsx";
import Explore from "./components/Explore.jsx";
import Search from "./components/Search.jsx";
import Notifications from "./components/Notifications.jsx";
import Profile from "./components/Profile.jsx";
import CreatePost from "./components/CreatePost.jsx";
import Stories from "./components/Stories.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Constants
import { 
  API_BASE_URL, 
  SOCKET_URL, 
  APP_TITLE,
  USER_KEY,
  THEME_KEY,
  POLLING_INTERVAL
} from "./config/constants.js";

// Utils
import { toast } from "./utils/toast.js";

import "./App.css";

// Enhanced socket connection with reconnection logic
const socket = io.connect(SOCKET_URL || "http://127.0.0.1:3001", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
  autoConnect: false
});

function App() {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme === "dark" || 
           (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  
  // --- DATA STATE ---
  const [dbUsers, setDbUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // --- AUTH STATE ---
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.error("Error parsing saved user:", err);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  // Refs for cleanup
  const dataFetchRef = useRef(null);
  const socketRef = useRef(socket);
  const pollingRef = useRef(null);
  const notificationPermissionRef = useRef(Notification.permission);

  // --- 1. THEME MANAGEMENT ---
  useEffect(() => {
    const themeClass = isDarkMode ? 'dark-mode' : 'light-mode';
    const oppositeClass = isDarkMode ? 'light-mode' : 'dark-mode';
    
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.remove(oppositeClass);
    document.body.classList.add(themeClass);
    
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // --- 2. DYNAMIC BROWSER TAB TITLE & FAVICON ---
  useEffect(() => {
    const originalTitle = APP_TITLE || "WitbriChat";
    const totalUnread = unreadNotifs + unreadMessages;
    
    const updateTabTitle = () => {
      if (document.hidden) {
        document.title = totalUnread > 0 
          ? `(${totalUnread}) ${originalTitle}` 
          : `👋 ${originalTitle}`;
      } else {
        document.title = totalUnread > 0 
          ? `(${totalUnread}) ${originalTitle}` 
          : originalTitle;
      }
    };

    // Update favicon based on notifications
    const updateFavicon = () => {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = totalUnread > 0 ? '/logo.svg' : '/logo.svg';
    };

    updateTabTitle();
    updateFavicon();

    const handleVisibilityChange = () => {
      updateTabTitle();
      // Refresh data when coming back online
      if (!document.hidden && isOnline && user) {
        fetchAppData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [unreadNotifs, unreadMessages, isOnline, user]);

  // --- 3. DATA FETCHING WITH DEBOUNCE & CACHING ---
  const fetchAppData = useCallback(async (force = false) => {
    if (!user?.token) return;

    // Don't fetch if offline
    if (!isOnline) {
      console.log("Skipping data fetch - offline");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use AbortController for request cancellation
      const controller = new AbortController();
      dataFetchRef.current = controller;

      const headers = {
        Authorization: `Bearer ${user.token}`,
        'Cache-Control': 'no-cache'
      };

      // Fetch all data in parallel with timeouts
      const requests = [
        axios.get(`${API_BASE_URL}/users`, { 
          headers, 
          signal: controller.signal,
          timeout: 10000 
        }),
        axios.get(`${API_BASE_URL}/posts/user/${user.username}`, { 
          headers, 
          signal: controller.signal,
          timeout: 10000 
        }),
        axios.get(`${API_BASE_URL}/messages/last`, { 
          headers, 
          signal: controller.signal,
          timeout: 10000 
        })
      ];

      // Only fetch stories if on home tab
      if (activeTab === 'home' || force) {
        requests.push(
          axios.get(`${API_BASE_URL}/stories/feed`, { 
            headers, 
            signal: controller.signal,
            timeout: 10000 
          })
        );
      }

      const results = await Promise.allSettled(requests);

      // Handle responses
      const [usersRes, postsRes, lastMessagesRes, storiesRes] = results;

      if (usersRes.status === 'fulfilled') {
        setDbUsers(usersRes.value.data);
      }

      if (postsRes.status === 'fulfilled') {
        const sortedPosts = postsRes.value.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUserPosts(sortedPosts);
      }

      if (lastMessagesRes.status === 'fulfilled') {
        const messagesMap = {};
        lastMessagesRes.value.data.forEach(msg => {
          messagesMap[msg.room_name] = msg.message_text;
        });
        setLastMessages(messagesMap);
      }

      if (storiesRes && storiesRes.status === 'fulfilled') {
        setStories(storiesRes.value.data);
      }

      // Check for any rejected promises
      const errors = results
        .filter(res => res.status === 'rejected')
        .map(res => res.reason.message);

      if (errors.length > 0) {
        console.warn("Partial data load errors:", errors);
        if (errors.length === results.length) {
          throw new Error("Failed to load app data");
        }
      }

    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled:", err.message);
      } else {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load app data";
        setError(errorMessage);
        console.error("Data fetch error:", err);
        
        // Show toast for non-cancel errors
        if (!axios.isCancel(err)) {
          toast.error(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline, activeTab]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAppData(true); // Force fetch on mount
    }
    
    return () => {
      if (dataFetchRef.current) {
        dataFetchRef.current.abort();
      }
    };
  }, [user]);

  // Poll for new data when tab is active
  useEffect(() => {
    if (!user || !isOnline) return;

    const pollData = () => {
      if (!document.hidden) {
        fetchAppData();
      }
    };

    // Clear existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Set new interval
    pollingRef.current = setInterval(pollData, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [user, isOnline, fetchAppData]);

  // --- 4. ENHANCED SOCKET LOGIC ---
  useEffect(() => {
    if (!user) {
      socketRef.current.disconnect();
      return;
    }

    const currentSocket = socketRef.current;

    // Connect socket
    if (!currentSocket.connected) {
      currentSocket.connect();
    }

    // Connection events
    const handleConnect = () => {
      console.log('Socket connected:', currentSocket.id);
      currentSocket.emit("join_app", {
        username: user.username,
        userId: user.userId || user.id,
        token: user.token
      });
      
      if (showOfflineToast) {
        toast.success("Reconnected to server");
        setShowOfflineToast(false);
      }
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        currentSocket.connect();
      }
    };

    const handleConnectError = (err) => {
      console.error('Socket connection error:', err.message);
      if (!showOfflineToast && isOnline) {
        toast.warning("Connection issues. Trying to reconnect...");
        setShowOfflineToast(true);
      }
    };

    // Data events
    const handleUserList = (users) => {
      setOnlineUsers(users);
    };

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      if (!isNotifOpen) {
        setUnreadNotifs(prev => prev + 1);
        
        // Show desktop notification if permitted
        if (notificationPermissionRef.current === "granted" && document.hidden) {
          try {
            new Notification("WitbriChat", {
              body: notification.message || "You have a new notification",
              icon: "/logo.svg",
              tag: 'witbri-notification'
            });
          } catch (err) {
            console.error("Failed to show notification:", err);
          }
        }
        
        // Show in-app toast
        if (!document.hidden) {
          toast.info(notification.message || "New notification");
        }
      }
    };

    const handleNewMessage = (message) => {
      // Update last messages
      setLastMessages(prev => ({
        ...prev,
        [message.room]: message.message || message.text
      }));
      
      // Increment unread if not in this conversation
      if (activeTab !== "messages" || selectedUser !== message.sender) {
        setUnreadMessages(prev => prev + 1);
        
        // Show notification for new message
        if (!document.hidden && message.sender !== user.username) {
          toast.info(`New message from ${message.sender}`);
        }
      }
    };

    // Register event listeners
    currentSocket.on('connect', handleConnect);
    currentSocket.on('disconnect', handleDisconnect);
    currentSocket.on('connect_error', handleConnectError);
    currentSocket.on("user_list", handleUserList);
    currentSocket.on("new_notification", handleNewNotification);
    currentSocket.on("new_message", handleNewMessage);

    // Request notification permission if not already done
    if ("Notification" in window && notificationPermissionRef.current === "default") {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission;
      });
    }

    // Cleanup
    return () => {
      currentSocket.off('connect', handleConnect);
      currentSocket.off('disconnect', handleDisconnect);
      currentSocket.off('connect_error', handleConnectError);
      currentSocket.off("user_list", handleUserList);
      currentSocket.off("new_notification", handleNewNotification);
      currentSocket.off("new_message", handleNewMessage);
    };
  }, [user, isNotifOpen, activeTab, selectedUser, isOnline, showOfflineToast]);

  // --- 5. OFFLINE/ONLINE DETECTION ---
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online");
      setIsOnline(true);
      toast.success("You're back online!");
      
      // Reconnect socket
      if (socketRef.current.disconnected) {
        socketRef.current.connect();
      }
      
      // Refresh data
      if (user) {
        fetchAppData();
      }
    };

    const handleOffline = () => {
      console.log("App is offline");
      setIsOnline(false);
      toast.warning("You're offline. Some features may be unavailable.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, fetchAppData]);

  // --- 6. SYSTEM LOGIC HANDLERS ---
  const handlePostCreated = useCallback((newPost) => {
    setUserPosts(prev => [newPost, ...prev]);
    setIsCreateOpen(false);
    setActiveTab("profile");
    
    toast.success("Post created successfully!");
  }, []);

  const handleProfileUpdate = useCallback(async (updatedData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        updatedData,
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      // Update user in online users list
      socketRef.current.emit("user_update", updatedUser);
      
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (err) {
      console.error("Profile update failed:", err);
      const errorMsg = err.response?.data?.error || "Failed to update profile";
      toast.error(errorMsg);
      throw err;
    }
  }, [user]);

  const handleLogin = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setError(null);
    
    // Reset unread counts
    setUnreadNotifs(0);
    setUnreadMessages(0);
    
    // Clear any existing notifications
    setNotifications([]);
    
    toast.success(`Welcome back, ${userData.username}!`);
  }, []);

  const handleLogout = useCallback(() => {
    // Notify server about logout
    if (socketRef.current.connected) {
      socketRef.current.emit("user_logout", user?.username);
    }
    
    // Disconnect socket
    socketRef.current.disconnect();
    
    // Clear local state
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("recent_searches");
    setUser(null);
    setActiveTab("home");
    setSelectedUser(null);
    setDbUsers([]);
    setUserPosts([]);
    setStories([]);
    setNotifications([]);
    setUnreadNotifs(0);
    setUnreadMessages(0);
    
    toast.info("Logged out successfully");
  }, [user]);

  const startConversation = useCallback((targetUsername) => {
    setSelectedUser(targetUsername);
    setActiveTab("messages");
    setIsSearchOpen(false);
    setIsNotifOpen(false);
    
    // Reset unread messages when opening chat
    if (unreadMessages > 0) {
      setUnreadMessages(0);
    }
  }, [unreadMessages]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
    toast.info(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
  }, [isDarkMode]);

  const retryDataFetch = useCallback(() => {
    setError(null);
    fetchAppData(true);
  }, [fetchAppData]);

  // --- 7. KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (isNotifOpen) setIsNotifOpen(false);
        if (isCreateOpen) setIsCreateOpen(false);
      }
      // Ctrl/Cmd + N for new post
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsCreateOpen(true);
      }
      // Ctrl/Cmd + M for messages
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setActiveTab("messages");
      }
      // Ctrl/Cmd + P for profile
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setActiveTab("profile");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isNotifOpen, isCreateOpen]);

  // --- 8. NOTIFICATION PERMISSION ---
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default" && user) {
      // Ask for permission after a short delay
      const timer = setTimeout(() => {
        Notification.requestPermission().then(permission => {
          notificationPermissionRef.current = permission;
          if (permission === "granted") {
            console.log("Notification permission granted");
          }
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  // --- 9. MEMOIZED VALUES ---
  const totalUnreadCount = useMemo(() => {
    return unreadNotifs + unreadMessages;
  }, [unreadNotifs, unreadMessages]);

  const isChattingActive = useMemo(() => {
    return selectedUser && activeTab === 'messages';
  }, [selectedUser, activeTab]);

  // --- 10. RENDER LOGIC ---
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isLoading && activeTab !== "messages" && !dbUsers.length) {
    return <LoadingScreen message="Loading your feed..." />;
  }

  if (error && !dbUsers.length && activeTab !== "messages") {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={retryDataFetch}>Retry</button>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            <Stories 
              currentUser={user} 
              stories={stories}
              onStoryCreated={() => fetchAppData(true)}
            />
            <HomeFeed 
              onDirectMessage={startConversation} 
              currentUser={user} 
              socket={socketRef.current}
            />
          </>
        );
      case "messages":
        return (
          <ChatLayout
            socket={socketRef.current}
            currentUser={user}
            targetUser={selectedUser}
            setActiveChat={setSelectedUser}
            dbUsers={dbUsers}
            onlineUsers={onlineUsers}
            lastMessages={lastMessages}
            setIsSearchOpen={setIsSearchOpen}
            isLoading={isLoading}
            unreadCount={unreadMessages}
          />
        );
      case "explore":
        return <Explore currentUser={user} />;
      case "profile":
        return (
          <Profile
            currentUser={user}
            onLogout={handleLogout}
            onUpdateProfile={handleProfileUpdate}
            setIsCreateOpen={setIsCreateOpen}
            userPosts={userPosts}
            refreshData={() => fetchAppData(true)}
          />
        );
      default:
        return <HomeFeed onDirectMessage={startConversation} currentUser={user} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className={`main-structure ${isChattingActive ? 'chatting-active' : ''}`}>
        <MobileHeader
          onSearchClick={() => setIsSearchOpen(true)}
          onNotifClick={() => {
            setIsNotifOpen(true);
            setUnreadNotifs(0);
          }}
          unreadCount={unreadNotifs}
          currentUser={user}
          isDarkMode={isDarkMode}
        />

        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isNotifOpen={isNotifOpen}
          setIsNotifOpen={setIsNotifOpen}
          setIsCreateOpen={setIsCreateOpen}
          unreadCount={totalUnreadCount}
          currentUser={user}
          onLogout={handleLogout}
          extraActions={
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          }
          isDarkMode={isDarkMode}
        />

        {/* SEARCH OVERLAY */}
        <Search
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onUserClick={startConversation}
          dbUsers={dbUsers}
          currentUser={user}
        />

        {/* NOTIFICATIONS OVERLAY */}
        <Notifications
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          currentUser={user}
          socket={socketRef.current}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        {/* CREATE POST MODAL */}
        {isCreateOpen && (
          <CreatePost
            currentUser={user}
            onClose={() => setIsCreateOpen(false)}
            onShare={handlePostCreated}
          />
        )}

        <main className={`content-area ${(isSearchOpen || isNotifOpen) ? 'shifted' : ''}`}>
          {error && (
            <div className="app-error-banner">
              <span>{error}</span>
              <button onClick={retryDataFetch}>Retry</button>
              <button onClick={() => setError(null)} className="close-error-btn">×</button>
            </div>
          )}
          
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="offline-indicator">
              ⚠️ You're offline. Some features may be unavailable.
            </div>
          )}
          
          {renderContent()}
        </main>

        {/* Toast Container */}
        <div id="toast-container"></div>

        {/* Keyboard Shortcuts Hint */}
        {!isSearchOpen && !isNotifOpen && !isCreateOpen && (
          <div className="kbd-hint">
            <kbd>Ctrl/Cmd</kbd> + <kbd>K</kbd> to search • 
            <kbd>Ctrl/Cmd</kbd> + <kbd>M</kbd> for messages
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;