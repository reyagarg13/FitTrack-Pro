// activity.js
import { activitiesData } from '../../data/activitiesData.js';
import { loadActivities, saveActivities } from '../utilities/storage.js';
import { uid } from '../utilities/helpers.js';
import { openModal, closeModal } from '../utilities/modal.js';
import { el, elAll } from '../utilities/helpers.js';

let activities = [];

function persist(){ saveActivities(activities); }

function renderList(filter='all'){
  const ul = document.getElementById('activity-list');
  ul.innerHTML = '';
  const list = activities.filter(a=> filter==='all' ? true : a.timeOfDay===filter);
  
  if(list.length === 0){
    ul.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        <div class="text-lg font-medium">No activities found</div>
        <div class="text-sm mt-1">Add your first activity to get started!</div>
      </div>
    `;
    return;
  }
  
  list.forEach(a=>{
    const li = document.createElement('li');
    li.setAttribute('data-time', a.timeOfDay);
    
    // Get icon based on time of day
    const iconEmoji = a.timeOfDay === 'Morning' ? '🌅' : a.timeOfDay === 'Afternoon' ? '☀️' : '🌙';
    
    li.innerHTML = `
      <div class="flex items-center flex-1">
        <div class="activity-icon">${iconEmoji}</div>
        <div>
          <div class="font-semibold text-slate-800">${a.name}</div>
          <div class="activity-meta">${a.duration} min • ${a.calories} kcal • <span class="font-medium">${a.timeOfDay}</span></div>
        </div>
      </div>
      <div>
        <button class="btn-secondary hover:bg-red-50 hover:text-red-600 transition-colors" data-id="${a.id}">Delete</button>
      </div>
    `;
    ul.appendChild(li);
  });
}

function initData(){
  const stored = loadActivities();
  activities = stored || activitiesData.slice();
  persist();
}

function attachEvents(){
  document.getElementById('activity-filter').addEventListener('change',(e)=>{
    renderList(e.target.value);
  });

  document.getElementById('open-add-activity').addEventListener('click', ()=>{
    showAddActivityModal();
  });

  document.getElementById('activity-list').addEventListener('click',(e)=>{
    if(e.target.tagName==='BUTTON'){
      const id = e.target.dataset.id;
      activities = activities.filter(a=> a.id !== id);
      persist();
      renderList(document.getElementById('activity-filter').value);
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
});
