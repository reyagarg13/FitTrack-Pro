// toast.js - Simple toast notification system
let toastContainer = null;

function createToastContainer(){
  if(toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, type = 'success', duration = 3000){
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast-item px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-64 transform translate-x-full transition-transform duration-300`;
  
  // Set colors based on type
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  toast.classList.add(...colors[type].split(' '));
  
  toast.innerHTML = `
    <span class="text-xl">${icons[type]}</span>
    <span class="flex-1">${message}</span>
    <button class="toast-close text-xl opacity-70 hover:opacity-100 transition-opacity">×</button>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(()=> {
    toast.style.transform = 'translateX(0)';
  });
  
  // Close button
  toast.querySelector('.toast-close').addEventListener('click', ()=> {
    removeToast(toast);
  });
  
  // Auto remove
  if(duration > 0){
    setTimeout(()=> removeToast(toast), duration);
  }
  
  return toast;
}

function removeToast(toast){
  toast.style.transform = 'translateX(120%)';
  toast.style.opacity = '0';
  setTimeout(()=> {
    if(toast.parentNode){
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Listen for custom toast events
window.addEventListener('show-toast', (e)=> {
  const { message, type, duration } = e.detail;
  showToast(message, type, duration);
});
