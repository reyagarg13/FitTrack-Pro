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
  attachHelpButton();
  // update badge after navbar load
  updateBadge();
}

function attachHelpButton(){
  const helpBtn = document.getElementById('help-btn');
  if(helpBtn){
    helpBtn.addEventListener('click', ()=> {
      const helpContent = `
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg mb-2">⌨️ Keyboard Shortcuts</h3>
            <ul class="space-y-1 text-sm">
              <li><kbd class="px-2 py-1 bg-slate-100 rounded">Alt + 1</kbd> - Dashboard</li>
              <li><kbd class="px-2 py-1 bg-slate-100 rounded">Alt + 2</kbd> - Activity Log</li>
              <li><kbd class="px-2 py-1 bg-slate-100 rounded">Alt + 3</kbd> - Meal Planner</li>
              <li><kbd class="px-2 py-1 bg-slate-100 rounded">Alt + 4</kbd> - Insights</li>
              <li><kbd class="px-2 py-1 bg-slate-100 rounded">Esc</kbd> - Close Modal</li>
              <li><kbd class="px-2 py-1 bg-slate-100 rounded">Tab</kbd> - Navigate Modal</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-lg mb-2">💡 Quick Tips</h3>
            <ul class="space-y-1 text-sm text-slate-600">
              <li>• All data is saved automatically to your browser</li>
              <li>• Click on charts to see detailed values</li>
              <li>• Download your summary from Insights page</li>
              <li>• Filter activities by time of day</li>
              <li>• Total calories update in real-time</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-lg mb-2">📊 Features</h3>
            <ul class="space-y-1 text-sm text-slate-600">
              <li>✅ Track steps, calories, and water intake</li>
              <li>✅ Log activities with duration and calories</li>
              <li>✅ Plan meals for breakfast, lunch, and dinner</li>
              <li>✅ View weekly insights and statistics</li>
              <li>✅ Export data as JSON file</li>
            </ul>
          </div>
        </div>
      `;
      openModal({
        title: '❓ Help & Information',
        body: helpContent
      });
    });
  }
}

function attachNavHandlers(){
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      showPage(target);
      // Update active state
      document.querySelectorAll('.nav-btn').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
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
  // Set initial active state
  const activeBtn = document.querySelector(`.nav-btn[data-target="${id}"]`);
  if(activeBtn){
    document.querySelectorAll('.nav-btn').forEach(b=> b.classList.remove('active'));
    activeBtn.classList.add('active');
  }
}

// Listen for storage updates to refresh badge
window.addEventListener('meals:updated', updateBadge);
window.addEventListener('activities:updated', updateBadge);
window.addEventListener('storage:reset', updateBadge);
