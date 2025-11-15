// insights.js - render weekly charts, handle download and reset with responsiveness
import { weeklyData } from '../../data/weeklyData.js';
import { loadActivities, loadMeals, resetAll } from '../utilities/storage.js';

// Render bars into a container using values array; max controls 100% scaling
const renderBars = (containerId, values, labels) => {
  const root = document.getElementById(containerId);
  if(!root) return;
  root.innerHTML = '';
  root.className = 'w-full h-48 flex items-end gap-2 px-2';
  
  const max = Math.max(...values, 1);
  values.forEach((v,i)=>{
    const pct = Math.round((v / max) * 100);
    const barWrap = document.createElement('div');
    barWrap.style.flex = '1';
    barWrap.className = 'flex flex-col items-center justify-end';

    const bar = document.createElement('div');
    bar.className = 'rounded-t-lg bg-gradient-to-b from-teal-400 to-cyan-600 w-full transition-all duration-500 ease-out cursor-pointer hover:opacity-90';
    bar.style.maxWidth = '50px';
    bar.style.height = '0%';
    bar.dataset.target = pct + '%';
    bar.dataset.value = String(v);
    bar.dataset.label = labels[i] || '';
    bar.title = `${labels[i]}: ${v}`;

    const label = document.createElement('div');
    label.className = 'text-xs text-slate-600 mt-2 font-medium';
    label.textContent = labels[i] || '';

    barWrap.appendChild(bar);
    barWrap.appendChild(label);
    root.appendChild(barWrap);

    // animate with stagger
    requestAnimationFrame(()=> setTimeout(()=> {
      bar.style.height = bar.dataset.target;
    }, 60 + (i * 50)));
  });
};

function attachTooltip(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  let tooltip = document.querySelector('.ft-tooltip');
  if(!tooltip){
    tooltip = document.createElement('div');
    tooltip.className = 'ft-tooltip hidden p-2 text-sm bg-slate-800 text-white rounded shadow';
    document.body.appendChild(tooltip);
  }
  root.querySelectorAll('div[data-value]').forEach(bar=>{
    bar.addEventListener('mouseenter', ()=>{
      tooltip.textContent = `${bar.dataset.label}: ${bar.dataset.value}`;
      tooltip.classList.remove('hidden');
    });
    bar.addEventListener('mousemove', (e)=>{
      tooltip.style.left = (e.pageX + 12) + 'px';
      tooltip.style.top = (e.pageY + 12) + 'px';
    });
    bar.addEventListener('mouseleave', ()=> tooltip.classList.add('hidden'));
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
  renderBars('weekly-activities', weeklyData.activityMinutes, weeklyData.days);
  renderBars('weekly-calories', weeklyData.calories, weeklyData.days);
  attachTooltip('weekly-activities');
  attachTooltip('weekly-calories');
  attachButtons();
  renderQuickStats();
}

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
  const avgActivityCalories = activities.length > 0 ? Math.round(totalActivityCalories / activities.length) : 0;
  
  const stats = [
    { label: 'Total Activities', value: activities.length, icon: '🏃' },
    { label: 'Total Meals', value: totalMeals, icon: '🍽️' },
    { label: 'Calories Burned', value: `${totalActivityCalories} kcal`, icon: '🔥' },
    { label: 'Calories Consumed', value: `${totalConsumedCalories} kcal`, icon: '🥗' }
  ];
  
  statsContainer.innerHTML = stats.map(stat => `
    <div class="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
      <div class="text-3xl mb-2">${stat.icon}</div>
      <div class="text-2xl font-bold text-teal-600">${stat.value}</div>
      <div class="text-sm text-slate-600 mt-1">${stat.label}</div>
    </div>
  `).join('');
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
