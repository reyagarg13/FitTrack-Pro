// activity.js
import { activitiesData } from '../../data/activitiesData.js';
import { loadActivities, saveActivities } from '../utilities/storage.js';
import { uid } from '../utilities/helpers.js';
import { openModal } from '../utilities/modal.js';
import { el, elAll } from '../utilities/helpers.js';

let activities = [];

function persist(){ saveActivities(activities); }

function renderList(filter='all'){
  const ul = document.getElementById('activity-list');
  ul.innerHTML = '';
  const list = activities.filter(a=> filter==='all' ? true : a.timeOfDay===filter);
  list.forEach(a=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div class="font-semibold">${a.name}</div>
        <div class="activity-meta">${a.duration} min • ${a.calories} kcal • ${a.timeOfDay}</div>
      </div>
      <div>
        <button class="btn-secondary" data-id="${a.id}">Delete</button>
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
    <form id="add-act-form" class="space-y-2">
      <input name="name" placeholder="Activity name" class="input" required />
      <input name="duration" placeholder="Duration (mins)" type="number" class="input" required />
      <input name="calories" placeholder="Calories burned" type="number" class="input" required />
      <select name="timeOfDay" class="input" required>
        <option value="Morning">Morning</option>
        <option value="Afternoon">Afternoon</option>
        <option value="Evening">Evening</option>
      </select>
    </form>
  `;

  openModal({ title:'Add Activity', body:container, actions:[{label:'Add', className:'btn-primary', onClick:()=>{
    const form = container.querySelector('#add-act-form');
    const fd = new FormData(form);
    const name = fd.get('name').trim();
    const duration = Number(fd.get('duration'));
    const calories = Number(fd.get('calories'));
    const timeOfDay = fd.get('timeOfDay');
    // Basic validation
    if(!name || !duration || duration<=0 || !calories || calories<0){
      openModal({title:'Validation', body:'Please fill all fields with valid values.'});
      return;
    }
    const newAct = { id: uid('a'), name, duration, calories, timeOfDay };
    activities.unshift(newAct);
    persist();
    renderList(document.getElementById('activity-filter').value);
    openModal({title:'Success', body:'Activity Added Successfully'});
  }}]});
}

// initialize
document.addEventListener('DOMContentLoaded', ()=>{
  initData();
  renderList();
  attachEvents();
});
