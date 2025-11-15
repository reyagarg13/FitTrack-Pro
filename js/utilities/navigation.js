// navigation.js
// Loads navbar component and handles page show/hide
import { openModal } from './modal.js';
import { loadMeals, loadActivities } from './storage.js';

const pageClass = 'page';

export async function loadNavbar() {
  const res = await fetch('./components/navbar.html');
  const html = await res.text();
  document.getElementById('navbar-root').innerHTML = html;
  attachNavHandlers();
  // update badge after navbar load
  updateBadge();
}

function attachNavHandlers(){
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      showPage(target);
    });
  });
}

function updateBadge(){
  const elConsumed = document.getElementById('nav-badge-consumed-value');
  const elActivity = document.getElementById('nav-badge-activity-value');
  if(!elConsumed || !elActivity) return;
  const meals = loadMeals() || { Breakfast: [], Lunch: [], Dinner: [] };
  const activities = loadActivities() || [];
  const consumed = ['Breakfast','Lunch','Dinner'].reduce((s,meal)=> s + (meals[meal] ? meals[meal].reduce((ss,m)=> ss + (Number(m.calories)||0),0) : 0), 0);
  const activityCalories = activities.reduce((s,a)=> s + (Number(a.calories)||0), 0);
  elConsumed.textContent = `${consumed} kcal`;
  elActivity.textContent = `+${activityCalories} kcal`;
  // pulse animation to draw attention
  const parentConsumed = document.getElementById('nav-badge-consumed');
  const parentActivity = document.getElementById('nav-badge-activity');
  if(parentConsumed){
    parentConsumed.classList.remove('badge-pulse');
    // force reflow
    void parentConsumed.offsetWidth;
    parentConsumed.classList.add('badge-pulse');
  }
  if(parentActivity){
    parentActivity.classList.remove('badge-pulse');
    void parentActivity.offsetWidth;
    parentActivity.classList.add('badge-pulse');
  }
}

export function showPage(pageId){
  const pages = Array.from(document.querySelectorAll('.'+pageClass));
  const target = document.getElementById(pageId);
  if(!target){
    openModal({title:'Navigation error', body:`Page ${pageId} not found.`});
    return;
  }

  // fade out current visible pages
  pages.forEach(p=>{
    if(!p.classList.contains('hidden')){
      p.classList.remove('visible');
      p.classList.add('entering');
      // after transition, hide
      setTimeout(()=>{
        p.classList.add('hidden');
        p.classList.remove('entering');
      }, 320);
    }
  });

  // show target with entering animation
  target.classList.remove('hidden');
  target.classList.add('entering');
  // force frame then mark visible
  requestAnimationFrame(()=>{
    target.classList.remove('entering');
    target.classList.add('visible');
  });

  window.location.hash = pageId;
}

export function initRoute(){
  const id = window.location.hash.replace('#','') || 'page-dashboard';
  showPage(id);
}

// Listen for storage updates to refresh badge
window.addEventListener('meals:updated', updateBadge);
window.addEventListener('activities:updated', updateBadge);
window.addEventListener('storage:reset', updateBadge);
