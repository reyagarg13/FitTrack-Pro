// Main script to initialize components and routing
import { loadNavbar, initRoute } from './js/utilities/navigation.js';
import { initModal } from './js/utilities/modal.js';

async function initApp(){
  // Load and wire navbar
  await loadNavbar();
  // Initialize modal component
  await initModal();
  // init route
  initRoute();
}

document.addEventListener('DOMContentLoaded', ()=>{
  initApp().catch(err=> console.error('Init error', err));
});
