// Main script to initialize components and routing
import { loadNavbar, initRoute } from './js/utilities/navigation.js';
import { initModal } from './js/utilities/modal.js';
import './js/utilities/toast.js';
import './js/utilities/keyboard.js';

async function initApp(){
  // Load and wire navbar
  await loadNavbar();
  // Initialize modal component
  await initModal();
  // init route
  initRoute();
  
  // Hide loading screen
  setTimeout(()=> {
    const loader = document.getElementById('loading-screen');
    if(loader){
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 300ms';
      setTimeout(()=> loader.remove(), 300);
    }
  }, 500);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initApp().catch(err=> console.error('Init error', err));
});
