// activity.js
import { activitiesData } from '../../data/activitiesData.js';
import { loadActivities, saveActivities } from '../utilities/storage.js';
import { uid } from '../utilities/helpers.js';
import { openModal, closeModal } from '../utilities/modal.js';
import { el, elAll } from '../utilities/helpers.js';

let activities = [];

/**
 * Persists activities and updates navbar calorie total
 */
function persist(){ 
  saveActivities(activities);
  updateNavbarCalories();
}

/**
 * Updates the navbar with total calories burned
 */
function updateNavbarCalories(){
  const totalCalories = activities.reduce((sum, a) => sum + Number(a.calories || 0), 0);
  const navbarCaloriesEl = document.querySelector('[data-navbar-calories]');
  if(navbarCaloriesEl){
    navbarCaloriesEl.textContent = `🔥 ${totalCalories} kcal burned`;
    navbarCaloriesEl.style.animation = 'pulse-glow 600ms ease-out';
  }
}

/**
 * Renders activity list with slide animations and color-coded badges
 * @param {string} filter - Filter type: 'all', 'Morning', 'Afternoon', 'Evening'
 */
function renderList(filter='all'){
  const ul = document.getElementById('activity-list');
  
  // Fade out animation before re-render
  ul.style.opacity = '0';
  ul.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    ul.innerHTML = '';
    const list = activities.filter(a=> filter==='all' ? true : a.timeOfDay===filter);
    
    if(list.length === 0){
      ul.innerHTML = `
        <div class="empty-state" style="animation: fadeIn 500ms ease-out;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <div class="text-lg font-medium">No activities found</div>
          <div class="text-sm mt-1">Add your first activity to get started!</div>
        </div>
      `;
      ul.style.opacity = '1';
      ul.style.transform = 'translateY(0)';
      return;
    }
    
    list.forEach((a, idx) => {
      const li = document.createElement('li');
      li.className = 'activity-card';
      li.setAttribute('data-time', a.timeOfDay);
      li.style.animation = `slideInFromLeft 400ms cubic-bezier(0.4, 0, 0.2, 1) ${idx * 50}ms backwards`;
      
      // Get icon and badge color based on time of day
      const timeConfig = {
        'Morning': { icon: '🌅', badge: 'badge-morning', color: '#fbbf24' },
        'Afternoon': { icon: '☀️', badge: 'badge-afternoon', color: '#f97316' },
        'Evening': { icon: '🌙', badge: 'badge-evening', color: '#8b5cf6' }
      };
      const config = timeConfig[a.timeOfDay] || timeConfig['Morning'];
      
      li.innerHTML = `
        <div class="flex items-center flex-1">
          <div class="activity-icon" style="animation: iconBounce 600ms ease-out ${idx * 50}ms backwards;">${config.icon}</div>
          <div class="flex-1">
            <div class="font-bold text-slate-900 mb-1">${a.name}</div>
            <div class="activity-meta">
              ${a.duration} min • <strong class="text-orange-600">${a.calories} kcal</strong> • 
              <span class="time-badge ${config.badge}" style="background-color: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color};">${a.timeOfDay}</span>
            </div>
          </div>
        </div>
        <div>
          <button class="btn-delete hover:bg-red-100 hover:text-red-700 transition-all duration-300 hover:scale-110" data-id="${a.id}" title="Delete activity">🗑️ Delete</button>
        </div>
      `;
      ul.appendChild(li);
    });
    
    // Fade in after content loaded
    setTimeout(() => {
      ul.style.opacity = '1';
      ul.style.transform = 'translateY(0)';
    }, 50);
  }, 200);
}

function initData(){
  const stored = loadActivities();
  if(stored){
    activities = stored;
  } else {
    activities = activitiesData.slice();
    // Only persist if there's actual data
    if(activities.length > 0){
      persist();
    }
  }
}

/**
 * Attaches event listeners for filter and delete actions
 */
function attachEvents(){
  // Filter dropdown with smooth transition
  const filterSelect = document.getElementById('activity-filter');
  filterSelect.addEventListener('change',(e)=>{
    filterSelect.style.animation = 'pulse-glow 300ms ease-out';
    renderList(e.target.value);
  });

  document.getElementById('open-add-activity').addEventListener('click', ()=>{
    showAddActivityModal();
  });

  // Delete button with confirmation
  document.getElementById('activity-list').addEventListener('click',(e)=>{
    if(e.target.tagName==='BUTTON' || e.target.closest('.btn-delete')){
      const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('.btn-delete');
      const id = button.dataset.id;
      const activity = activities.find(a => a.id === id);
      
      if(activity && confirm(`Delete "${activity.name}"?\n\nThis will remove ${activity.calories} kcal from your total.`)){
        // Animate removal
        const card = button.closest('.activity-card');
        if(card){
          card.style.animation = 'slideOutToRight 300ms ease-out forwards';
          setTimeout(() => {
            activities = activities.filter(a=> a.id !== id);
            persist();
            renderList(filterSelect.value);
            
            // Show toast notification
            const event = new CustomEvent('show-toast', {
              detail: { message: `🗑️ "${activity.name}" deleted`, type: 'info' }
            });
            window.dispatchEvent(event);
          }, 300);
        } else {
          activities = activities.filter(a=> a.id !== id);
          persist();
          renderList(filterSelect.value);
        }
      }
    }
  });
}

function showAddActivityModal(){
  const container = document.createElement('div');
  container.innerHTML = `
    <form id="add-act-form" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Activity Name</label>
        <input name="name" placeholder="e.g., Morning Yoga" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
        <input name="duration" placeholder="e.g., 30" type="number" min="1" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Calories Burned</label>
        <input name="calories" placeholder="e.g., 150" type="number" min="0" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Time of Day</label>
        <select name="timeOfDay" class="input" required>
          <option value="">Select time</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
      </div>
    </form>
  `;

  openModal({ 
    title:'Add New Activity', 
    body:container, 
    actions:[
      {
        label:'Cancel', 
        className:'btn-secondary', 
        onClick:()=>{
          closeModal();
        }
      },
      {
        label:'Add Activity', 
        className:'btn-primary', 
        onClick:()=>{
          const form = container.querySelector('#add-act-form');
          if(!form.checkValidity()){
            form.reportValidity();
            return;
          }
          const fd = new FormData(form);
          const name = fd.get('name').trim();
          const duration = Number(fd.get('duration'));
          const calories = Number(fd.get('calories'));
          const timeOfDay = fd.get('timeOfDay');
          
          // Enhanced validation
          if(!name || name.length < 2){
            openModal({title:'Validation Error', body:'Please enter a valid activity name (at least 2 characters).'});
            return;
          }
          if(!duration || duration<=0 || duration > 1440){
            openModal({title:'Validation Error', body:'Duration must be between 1 and 1440 minutes (24 hours).'});
            return;
          }
          if(!calories || calories<0 || calories > 10000){
            openModal({title:'Validation Error', body:'Calories must be between 0 and 10000.'});
            return;
          }
          if(!timeOfDay){
            openModal({title:'Validation Error', body:'Please select a time of day.'});
            return;
          }
          
          const newAct = { id: uid('a'), name, duration, calories, timeOfDay };
          activities.unshift(newAct);
          persist();
          renderList(document.getElementById('activity-filter').value);
          
          openModal({
            title:'✅ Success', 
            body:`<div class="text-center"><p class="text-lg mb-2">Activity Added Successfully!</p><p class="text-sm text-slate-600">"${name}" has been added to your activity log.</p></div>`
          });
        }
      }
    ]
  });
}

// initialize
document.addEventListener('DOMContentLoaded', ()=>{
  initData();
  renderList();
  attachEvents();
  updateNavbarCalories(); // Update navbar with total calories
});
