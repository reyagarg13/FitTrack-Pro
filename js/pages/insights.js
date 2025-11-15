// insights.js - render weekly charts, handle download and reset with responsiveness
import { weeklyData } from '../../data/weeklyData.js';
import { loadActivities, loadMeals, resetAll } from '../utilities/storage.js';

/**
 * Renders animated bar charts with smooth upward animation
 * @param {string} containerId - DOM ID of the chart container
 * @param {number[]} values - Array of numeric values for each bar
 * @param {string[]} labels - Array of labels corresponding to each bar
 */
const renderBars = (containerId, values, labels) => {
  const root = document.getElementById(containerId);
  if(!root) {
    console.error(`Container #${containerId} not found!`);
    return;
  }
  
  root.innerHTML = '';
  root.className = 'w-full h-56 flex items-end gap-3 px-4 py-2';
  root.style.minHeight = '224px'; // 14rem = 224px, ensure explicit height
  root.style.position = 'relative';
  
  // Handle empty data case
  if(!values || values.length === 0 || values.every(v => v === 0)){
    root.innerHTML = `
      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center p-6 bg-slate-50 rounded-lg">
          <div class="text-4xl mb-3">📊</div>
          <p class="text-slate-500 font-medium">No data available yet</p>
          <p class="text-xs text-slate-400 mt-1">Add activities or meals to see insights</p>
        </div>
      </div>
    `;
    return;
  }
  
  const max = Math.max(...values, 1);
  
  values.forEach((v, i) => {
    const pct = Math.round((v / max) * 100);
    
    // Bar wrapper with flex grow
    const barWrap = document.createElement('div');
    barWrap.style.flex = '1';
    barWrap.className = 'insights-bar-wrapper flex flex-col items-center justify-end';
    barWrap.style.minWidth = '40px';
    barWrap.style.maxWidth = '60px';
    barWrap.style.height = '100%'; // CRITICAL: Wrapper must have full height
    barWrap.style.position = 'relative';

    // Value label on top of bar
    const valueLabel = document.createElement('div');
    valueLabel.className = 'insights-value-label text-xs font-semibold text-slate-700 mb-1 opacity-0 transition-opacity duration-500';
    valueLabel.textContent = v;
    valueLabel.style.transitionDelay = `${100 + (i * 60)}ms`;

    // Animated bar element
    const bar = document.createElement('div');
    bar.className = 'insights-chart-bar rounded-t-xl w-full transition-all duration-700 ease-out cursor-pointer relative';
    bar.style.height = '0%';
    bar.style.width = '100%'; // Ensure full width
    bar.style.minWidth = '100%';
    bar.style.maxHeight = '100%'; // Don't exceed wrapper height
    bar.style.background = 'linear-gradient(to top, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)';
    bar.style.boxShadow = '0 -2px 12px rgba(6, 182, 212, 0.3)';
    bar.style.transformOrigin = 'bottom';
    bar.style.display = 'block';
    bar.dataset.target = pct;
    bar.dataset.value = String(v);
    bar.dataset.label = labels[i] || '';
    bar.title = `${labels[i]}: ${v}`;

    // Hover glow effect
    bar.addEventListener('mouseenter', () => {
      bar.style.boxShadow = '0 -4px 20px rgba(6, 182, 212, 0.5), 0 0 0 2px rgba(6, 182, 212, 0.2)';
      bar.style.transform = 'scaleY(1.05)';
    });
    bar.addEventListener('mouseleave', () => {
      bar.style.boxShadow = '0 -2px 12px rgba(6, 182, 212, 0.3)';
      bar.style.transform = 'scaleY(1)';
    });

    // Day label below bar
    const label = document.createElement('div');
    label.className = 'text-xs text-slate-600 mt-2 font-semibold tracking-wide';
    label.textContent = labels[i] || '';

    barWrap.appendChild(valueLabel);
    barWrap.appendChild(bar);
    barWrap.appendChild(label);
    root.appendChild(barWrap);

    // Staggered animation: bars grow upward
    requestAnimationFrame(() => {
      setTimeout(() => {
        console.log(`Setting bar ${i} (${labels[i]}) height to ${pct}%`);
        bar.style.height = pct + '%';
        valueLabel.style.opacity = '1';
      }, 100 + (i * 60));
    });
  });
};

/**
 * Attaches enhanced tooltip functionality to chart bars
 * @param {string} containerId - DOM ID of the chart container
 */
function attachTooltip(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  
  let tooltip = document.querySelector('.ft-tooltip');
  if(!tooltip){
    tooltip = document.createElement('div');
    tooltip.className = 'ft-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      display: none;
      padding: 8px 12px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 182, 212, 0.3);
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
      transform: translateY(-8px);
      transition: opacity 200ms ease;
    `;
    document.body.appendChild(tooltip);
  }
  
  // Attach to all bars with data attributes
  root.querySelectorAll('.insights-chart-bar').forEach(bar => {
    bar.addEventListener('mouseenter', (e) => {
      const label = bar.dataset.label || '';
      const value = bar.dataset.value || '0';
      tooltip.innerHTML = `<span style="color:#22d3ee">${label}</span>: <strong>${value}</strong>`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
    });
    
    bar.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY - 40) + 'px';
    });
    
    bar.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        tooltip.style.display = 'none';
      }, 200);
    });
  });
}

function attachButtons(){
  const downloadBtn = document.getElementById('download-summary');
  if(downloadBtn){
    downloadBtn.addEventListener('click', ()=>{
      // Create comprehensive summary
      const activities = loadActivities() || [];
      const mealData = loadMeals() || {};
      
      const totalActivityCalories = activities.reduce((s,a)=> s + (Number(a.calories)||0), 0);
      const totalConsumedCalories = ['Breakfast','Lunch','Dinner'].reduce((s,meal)=> 
        s + (mealData[meal] ? mealData[meal].reduce((ss,m)=> ss + (Number(m.calories)||0),0) : 0), 0);
      
      const payload = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivities: activities.length,
          totalActivityCalories,
          totalConsumedCalories,
          netCalories: totalConsumedCalories - totalActivityCalories
        },
        weekly: weeklyData,
        activities,
        meals: mealData
      };
      
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `fittrack-summary-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove(); 
      URL.revokeObjectURL(url);
      
      // Show confirmation
      const event = new CustomEvent('show-toast', {detail: {message: 'Summary downloaded successfully!'}});
      window.dispatchEvent(event);
    });
  }

  const resetBtn = document.getElementById('reset-dashboard');
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      if(confirm('Are you sure you want to reset all dashboard data? This action cannot be undone.')){
        resetAll();
        setTimeout(()=> location.reload(), 200);
      }
    });
  }
}

function init(){
  console.log('Insights page initializing...');
  console.log('Weekly data:', weeklyData);
  
  renderBars('weekly-activities', weeklyData.activityMinutes, weeklyData.days);
  renderBars('weekly-calories', weeklyData.calories, weeklyData.days);
  
  // Attach tooltips after a short delay to ensure bars are rendered
  setTimeout(() => {
    attachTooltip('weekly-activities');
    attachTooltip('weekly-calories');
  }, 500);
  
  attachButtons();
  renderQuickStats();
  
  console.log('Insights page initialized!');
}

/**
 * Renders animated quick statistics cards with data summary
 */
function renderQuickStats(){
  const statsContainer = document.getElementById('quick-stats');
  if(!statsContainer) return;
  
  const activities = loadActivities() || [];
  const mealData = loadMeals() || {};
  
  const totalActivityCalories = activities.reduce((s,a)=> s + (Number(a.calories)||0), 0);
  const totalConsumedCalories = ['Breakfast','Lunch','Dinner'].reduce((s,meal)=> 
    s + (mealData[meal] ? mealData[meal].reduce((ss,m)=> ss + (Number(m.calories)||0),0) : 0), 0);
  const totalMeals = ['Breakfast','Lunch','Dinner'].reduce((s,meal)=> 
    s + (mealData[meal] ? mealData[meal].length : 0), 0);
  const netCalories = totalConsumedCalories - totalActivityCalories;
  
  const stats = [
    { label: 'Total Activities', value: activities.length, icon: '🏃', color: 'from-blue-50 to-cyan-50 border-blue-200' },
    { label: 'Total Meals', value: totalMeals, icon: '🍽️', color: 'from-green-50 to-emerald-50 border-green-200' },
    { label: 'Calories Burned', value: `${totalActivityCalories}`, suffix: ' kcal', icon: '🔥', color: 'from-orange-50 to-red-50 border-orange-200' },
    { label: 'Calories Consumed', value: `${totalConsumedCalories}`, suffix: ' kcal', icon: '🥗', color: 'from-purple-50 to-pink-50 border-purple-200' }
  ];
  
  statsContainer.innerHTML = stats.map((stat, idx) => `
    <div class="insights-stat-card text-center p-6 bg-gradient-to-br ${stat.color} rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer" style="animation: fadeInUp 400ms ease-out ${idx * 80}ms backwards;">
      <div class="text-4xl mb-3 transition-transform duration-300 hover-icon">${stat.icon}</div>
      <div class="stat-value text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent" data-target="${stat.value}">${stat.value}${stat.suffix || ''}</div>
      <div class="text-sm text-slate-600 mt-2 font-semibold tracking-wide">${stat.label}</div>
    </div>
  `).join('');
  
  // Animate stat values
  statsContainer.querySelectorAll('.stat-value').forEach((el, i) => {
    const target = parseInt(el.dataset.target) || 0;
    const suffix = stats[i].suffix || '';
    animateStatValue(el, target, suffix);
  });
  
  // Add icon hover effect
  statsContainer.querySelectorAll('.insights-stat-card').forEach(card => {
    const icon = card.querySelector('.hover-icon');
    card.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
    });
    card.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1) rotate(0deg)';
    });
  });
}

/**
 * Animates a stat value from 0 to target
 * @param {HTMLElement} element - DOM element to animate
 * @param {number} target - Target value
 * @param {string} suffix - Optional suffix (e.g., ' kcal')
 */
function animateStatValue(element, target, suffix = '') {
  const duration = 1000;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * easeOutCubic);
    element.textContent = current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Re-render charts when storage changes (keeps charts responsive to new data)
window.addEventListener('activities:updated', ()=> {
  renderBars('weekly-activities', weeklyData.activityMinutes, weeklyData.days);
  renderQuickStats();
});
window.addEventListener('meals:updated', ()=> {
  renderBars('weekly-calories', weeklyData.calories, weeklyData.days);
  renderQuickStats();
});
window.addEventListener('storage:reset', ()=> setTimeout(()=> init(), 200));

document.addEventListener('DOMContentLoaded', init);
