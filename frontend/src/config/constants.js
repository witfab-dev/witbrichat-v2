// config/constants.js

// Use window.location for API URLs or hardcode them for development
const getApiBaseUrl = () => {
  // For development, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:3001";
  }
  // For production, use the same origin or your API domain
  return ""; // Empty string means same origin
};

const getSocketUrl = () => {
  // For development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://127.0.0.1:3001";
  }
  // For production
  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();
export const APP_TITLE = "WitbriChat";
export const APP_VERSION = "1.0.0";
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const POLLING_INTERVAL = 30000; // 30 seconds
export const THEME_KEY = "witbri_theme";
export const USER_KEY = "witbriUser";
export const RECENT_SEARCHES_KEY = "recent_searches";

// Chat constants
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  VOICE: 'voice',
  FILE: 'file',
  POLL: 'poll',
  LOCATION: 'location'
};

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  MESSAGE: 'message',
  GROUP_INVITE: 'group_invite'
};

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER: 'user',
  RECENT_SEARCHES: 'recent_searches',
  CHAT_SETTINGS: 'chat_settings'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify'
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    SEARCH: '/users/search',
    ONLINE: '/users/online'
  },
  POSTS: {
    BASE: '/posts',
    USER: '/posts/user',
    FEED: '/posts/feed',
    LIKE: '/posts/like',
    COMMENT: '/posts/comment'
  },
  MESSAGES: {
    BASE: '/messages',
    CONVERSATION: '/messages/conversation',
    LAST: '/messages/last',
    UNREAD: '/messages/unread'
  },
  GROUPS: {
    BASE: '/groups',
    MEMBERS: '/groups/members',
    MESSAGES: '/groups/messages'
  }
};

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_APP: 'join_app',
  USER_LIST: 'user_list',
  NEW_MESSAGE: 'new_message',
  TYPING: 'typing',
  READ_RECEIPT: 'read_receipt',
  NEW_NOTIFICATION: 'new_notification',
  VIDEO_CALL: 'video_call',
  VOICE_CALL: 'voice_call'
};

// Theme colors
export const COLORS = {
  PRIMARY: '#0095f6',
  PRIMARY_HOVER: '#1877f2',
  SECONDARY: '#8a8d91',
  SUCCESS: '#31a24c',
  WARNING: '#f7b928',
  DANGER: '#f02849',
  INFO: '#17a2b8'
};

// Media breakpoints
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280
};