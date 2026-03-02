// utils/toast.js
export const toast = {
  success: (message, options = {}) => showToast(message, 'success', options),
  error: (message, options = {}) => showToast(message, 'error', options),
  warning: (message, options = {}) => showToast(message, 'warning', options),
  info: (message, options = {}) => showToast(message, 'info', options),
};

function showToast(message, type, options = {}) {
  const duration = options.duration || 5000;
  const container = document.getElementById('toast-container') || createToastContainer();
  
  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${type}`;
  toastEl.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${getIcon(type)}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close">×</button>
    </div>
  `;
  
  container.appendChild(toastEl);
  
  // Auto remove
  const timeout = setTimeout(() => {
    removeToast(toastEl);
  }, duration);
  
  // Close button
  toastEl.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeout);
    removeToast(toastEl);
  });
  
  // Touch to dismiss on mobile
  toastEl.addEventListener('click', (e) => {
    if (!e.target.classList.contains('toast-close')) {
      clearTimeout(timeout);
      removeToast(toastEl);
    }
  });
}

function removeToast(toastEl) {
  toastEl.style.animation = 'toastOut 0.3s ease forwards';
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
  }, 300);
}

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || '•';
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  
  // Add animation styles if not already present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to { opacity: 0; transform: translateY(20px) scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }
  
  return container;
}

// Make it globally available
if (typeof window !== 'undefined') {
  window.Toast = toast;
}