// keyboard.js - Keyboard shortcuts handler
import { showPage } from './navigation.js';

const shortcuts = {
  '1': 'page-dashboard',
  '2': 'page-activity',
  '3': 'page-meals',
  '4': 'page-insights'
};

function initKeyboardShortcuts(){
  document.addEventListener('keydown', (e)=> {
    // Alt + number to switch pages
    if(e.altKey && shortcuts[e.key]){
      e.preventDefault();
      showPage(shortcuts[e.key]);
      
      // Update active nav button
      const btn = document.querySelector(`.nav-btn[data-target="${shortcuts[e.key]}"]`);
      if(btn){
        document.querySelectorAll('.nav-btn').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);

export { initKeyboardShortcuts };
