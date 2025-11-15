// dashboard.js
import { wellnessData } from '../../data/wellnessData.js';
import { el, fmtNumber } from '../utilities/helpers.js';
import { loadActivities, loadMeals } from '../utilities/storage.js';

/**
 * Animates a number from 0 to target value
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (e.g., ' kcal', ' L')
 */
function animateValue(element, target, duration = 1000, suffix = '') {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(start + (target - start) * easeOutQuart);
    
    element.textContent = fmtNumber(current) + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = fmtNumber(target) + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Creates a dashboard card with animated progress circle
 */
function createCard(title, value, sub, progressPercent){
  const div = document.createElement('div');
  div.className = 'card flex flex-col items-center justify-center dashboard-card';
  
  // Build SVG progress ring
  let progressHtml = '';
  if(typeof progressPercent === 'number'){
    const size = 120;
    const r = 50;
    const c = Math.PI * 2 * r;
    const targetOffset = Math.max(0, Math.min(1, 1 - (progressPercent/100))) * c;
    const gradId = 'grad-' + Math.random().toString(36).slice(2,8);
    
    progressHtml = `
      <svg class="progress-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#0891b2" />
          </linearGradient>
          <filter id="glow-${gradId}">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle class="progress-bg" cx="60" cy="60" r="${r}" stroke-width="10" fill="none" />
        <circle class="progress-fg" cx="60" cy="60" r="${r}" stroke-width="10" fill="none"
          stroke="url(#${gradId})" 
          stroke-dasharray="${c.toFixed(2)}" 
          stroke-dashoffset="${c.toFixed(2)}"
          filter="url(#glow-${gradId})"></circle>
        <text x="60" y="67" text-anchor="middle" class="progress-value-svg">${Math.round(progressPercent)}%</text>
      </svg>
    `;
    
    div.dataset.progressTarget = targetOffset.toFixed(2);
    div.dataset.progressCirc = c.toFixed(2);
  }

  div.innerHTML = `
    <div class="text-sm text-slate-500 uppercase tracking-wide">${title}</div>
    <div class="text-3xl font-bold mt-2 dashboard-value" data-value="${value}">${value}</div>
    <div class="text-sm text-slate-400 mt-1">${sub}</div>
    <div class="mt-4">${progressHtml}</div>
  `;
  return div;
}

/**
 * Renders the main dashboard with animated elements
 */
function renderDashboard(){
  const root = document.getElementById('dashboard-cards');
  root.innerHTML = '';

  // Compute derived values from stored activities/meals
  const storedActivities = loadActivities() || [];
  const storedMeals = loadMeals() || { Breakfast: [], Lunch: [], Dinner: [] };

  const activityCalories = storedActivities.reduce((s,a)=> s + (Number(a.calories)||0), 0);
  const consumedCalories = ['Breakfast','Lunch','Dinner'].reduce((s,meal)=> 
    s + (storedMeals[meal] ? storedMeals[meal].reduce((ss,m)=> ss + (Number(m.calories)||0),0) : 0), 0);

  const stepsPct = Math.min(100,(wellnessData.stepsTaken / wellnessData.stepGoal)*100);
  const baseBurn = Number(wellnessData.caloriesBurned) || 0;
  const totalBurn = baseBurn + activityCalories;
  const calPct = Math.min(100,(totalBurn / (wellnessData.caloriesGoal||1))*100);
  const waterPct = Math.min(100,(wellnessData.waterIntakeMl / wellnessData.waterGoalMl)*100);

  // Create cards
  root.appendChild(createCard('Steps taken', fmtNumber(wellnessData.stepsTaken), 
    `${fmtNumber(wellnessData.stepGoal)} goal`, stepsPct));
  root.appendChild(createCard('Calories burned', `${fmtNumber(totalBurn)} kcal`, 
    `${fmtNumber(wellnessData.caloriesGoal)} goal`, calPct));
  root.appendChild(createCard('Calories consumed', `${fmtNumber(consumedCalories)} kcal`, 
    `meals today`, Math.min(100, (consumedCalories/2500)*100)));
  root.appendChild(createCard('Water intake', 
    `${Math.round(wellnessData.waterIntakeMl/1000*100)/100} L`, 
    `${Math.round(wellnessData.waterGoalMl/1000*100)/100} L goal`, waterPct));

  // Animate cards staggered entrance
  root.querySelectorAll('.dashboard-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });

  // Animate progress circles after DOM insertion
  requestAnimationFrame(()=>{
    setTimeout(() => {
      root.querySelectorAll('[data-progress-target]').forEach(div=>{
        const target = parseFloat(div.dataset.progressTarget);
        const circle = div.querySelector('.progress-fg');
        if(circle){
          circle.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.4, 0, 0.2, 1)';
          circle.setAttribute('stroke-dashoffset', String(target));
        }
      });
    }, 300);
  });
  
  // Animate number values from 0
  setTimeout(() => {
    animateValue(root.children[0].querySelector('.dashboard-value'), 
      wellnessData.stepsTaken, 1200, '');
    animateValue(root.children[1].querySelector('.dashboard-value'), 
      totalBurn, 1200, ' kcal');
    animateValue(root.children[2].querySelector('.dashboard-value'), 
      consumedCalories, 1200, ' kcal');
    
    // Animate water with decimal
    const waterElement = root.children[3].querySelector('.dashboard-value');
    const waterValue = Math.round(wellnessData.waterIntakeMl/1000*100)/100;
    animateValue(waterElement, Math.round(waterValue * 100), 1200, '');
    setTimeout(() => {
      waterElement.textContent = waterValue + ' L';
    }, 1200);
  }, 400);
}

/**
 * Starts the live clock with smooth updates
 */
function startClock(){
  const elClock = document.getElementById('live-clock');
  function tick(){
    const d = new Date();
    elClock.textContent = d.toLocaleTimeString();
  }
  tick();
  setInterval(tick,1000);
}

/**
 * Attaches event listeners for real-time updates
 */
function attachUpdateListeners(){
  window.addEventListener('activities:updated', ()=> renderDashboard());
  window.addEventListener('meals:updated', ()=> renderDashboard());
  window.addEventListener('storage:reset', ()=> renderDashboard());
}

/**
 * Initializes the dashboard
 */
export function initDashboard(){
  renderDashboard();
  startClock();
  attachUpdateListeners();
  try{ window.wellnessData = wellnessData; }catch(e){}
}

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
  initDashboard();
});
