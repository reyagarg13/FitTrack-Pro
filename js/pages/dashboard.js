// dashboard.js
import { wellnessData } from '../../data/wellnessData.js';
import { el, fmtNumber } from '../utilities/helpers.js';
import { loadActivities, loadMeals } from '../utilities/storage.js';


function createCard(title, value, sub, progressPercent){
  const div = document.createElement('div');
  div.className = 'card flex flex-col items-center justify-center';
  // Build an SVG progress ring if progressPercent is provided
  let progressHtml = '';
  if(typeof progressPercent === 'number'){
    const size = 110;
    const r = 48;
    const c = Math.PI * 2 * r;
    const targetOffset = Math.max(0, Math.min(1, 1 - (progressPercent/100))) * c;
    // unique gradient id to avoid duplicate ids
    const gradId = 'grad-' + Math.random().toString(36).slice(2,8);
    // start full (offset = c) then animate to targetOffset
    progressHtml = `
      <svg class="progress-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <defs>
          <linearGradient id="${gradId}" x1="0" x2="1">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#0891b2" />
          </linearGradient>
        </defs>
        <circle class="progress-bg" cx="55" cy="55" r="${r}" stroke-width="12" fill="none" />
        <circle class="progress-fg" cx="55" cy="55" r="${r}" stroke-width="12" fill="none"
          stroke="url(#${gradId})" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${c.toFixed(2)}"></circle>
        <text x="55" y="60" text-anchor="middle" class="progress-value-svg">${Math.round(progressPercent)}%</text>
      </svg>
    `;
    // we'll animate after insertion by setting stroke-dashoffset to target
    // use a small helper attached to div
    div.dataset.progressTarget = targetOffset.toFixed(2);
    div.dataset.progressCirc = c.toFixed(2);
  }

  div.innerHTML = `
    <div class="text-sm text-slate-500">${title}</div>
    <div class="text-2xl font-bold mt-2">${value}</div>
    <div class="text-sm text-slate-400 mt-1">${sub}</div>
    <div class="mt-3">${progressHtml}</div>
  `;
  return div;
}

function renderDashboard(){
  const root = document.getElementById('dashboard-cards');
  root.innerHTML = '';

  // compute derived values from stored activities/meals
  const storedActivities = loadActivities() || [];
  const storedMeals = loadMeals() || { Breakfast: [], Lunch: [], Dinner: [] };

  const activityCalories = storedActivities.reduce((s,a)=> s + (Number(a.calories)||0), 0);
  const consumedCalories = ['Breakfast','Lunch','Dinner'].reduce((s,meal)=> s + (storedMeals[meal] ? storedMeals[meal].reduce((ss,m)=> ss + (Number(m.calories)||0),0) : 0), 0);

  const stepsPct = Math.min(100,(wellnessData.stepsTaken / wellnessData.stepGoal)*100);
  const baseBurn = Number(wellnessData.caloriesBurned) || 0;
  const totalBurn = baseBurn + activityCalories; // include logged activities
  const calPct = Math.min(100,(totalBurn / (wellnessData.caloriesGoal||1))*100);
  const waterPct = Math.min(100,(wellnessData.waterIntakeMl / wellnessData.waterGoalMl)*100);

  root.appendChild(createCard('Steps taken', fmtNumber(wellnessData.stepsTaken), `${fmtNumber(wellnessData.stepGoal)} goal`, stepsPct));
  root.appendChild(createCard('Calories burned', `${fmtNumber(totalBurn)} kcal`, `${fmtNumber(wellnessData.caloriesGoal)} goal`, calPct));
  root.appendChild(createCard('Calories consumed', `${fmtNumber(consumedCalories)} kcal`, `meals today`, Math.min(100, (consumedCalories/2500)*100)));
  root.appendChild(createCard('Water intake', `${Math.round(wellnessData.waterIntakeMl/1000*100)/100} L`, `${Math.round(wellnessData.waterGoalMl/1000*100)/100} L goal`, waterPct));

  // animate SVG progress rings after they are in the DOM
  requestAnimationFrame(()=>{
    root.querySelectorAll('[data-progress-target]').forEach(div=>{
      const target = parseFloat(div.dataset.progressTarget);
      const c = parseFloat(div.dataset.progressCirc);
      const circle = div.querySelector('.progress-fg');
      if(circle){
          // trigger transition by setting to target offset
          circle.style.transition = 'stroke-dashoffset 700ms cubic-bezier(.2,.9,.2,1)';
          circle.setAttribute('stroke-dashoffset', String(target));
        }
    });
  });
}

function startClock(){
  const elClock = document.getElementById('live-clock');
  function tick(){
    const d = new Date();
    elClock.textContent = d.toLocaleTimeString();
  }
  tick();
  setInterval(tick,1000);
}

// Listen for updates to activities/meals to re-render in real-time
function attachUpdateListeners(){
  window.addEventListener('activities:updated', ()=> renderDashboard());
  window.addEventListener('meals:updated', ()=> renderDashboard());
  window.addEventListener('storage:reset', ()=> renderDashboard());
}

// initialize
export function initDashboard(){
  renderDashboard();
  startClock();
  attachUpdateListeners();
  // expose wellness data for other modules (download summary)
  try{ window.wellnessData = wellnessData; }catch(e){}
}

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
  initDashboard();
});
