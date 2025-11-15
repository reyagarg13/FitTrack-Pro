// insights.js - render weekly charts, handle download and reset with responsiveness
import { weeklyData } from '../../data/weeklyData.js';
import { loadActivities, loadMeals, resetAll } from '../utilities/storage.js';

// Render bars into a container using values array; max controls 100% scaling
const renderBars = (containerId, values, labels) => {
  const root = document.getElementById(containerId);
  if(!root) return;
  root.innerHTML = '';
  const max = Math.max(...values, 1);
  values.forEach((v,i)=>{
    const pct = Math.round((v / max) * 100);
    const barWrap = document.createElement('div');
    barWrap.style.flex = '1';
    barWrap.className = 'flex flex-col items-center';

    const bar = document.createElement('div');
    bar.className = 'rounded-lg bg-gradient-to-b from-teal-400 to-cyan-600 w-full';
    bar.style.maxWidth = '40px';
    bar.style.height = '6%';
    bar.dataset.target = pct + '%';
    bar.dataset.value = String(v);
    bar.dataset.label = labels[i] || '';

    const label = document.createElement('div');
    label.className = 'text-xs text-slate-600 mt-2';
    label.textContent = labels[i] || '';

    barWrap.appendChild(bar);
    barWrap.appendChild(label);
    root.appendChild(barWrap);

    // animate
    requestAnimationFrame(()=> setTimeout(()=> bar.style.height = bar.dataset.target, 60));
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
      const payload = {
        generatedAt: new Date().toISOString(),
        weekly: weeklyData,
        activities: loadActivities() || [],
        meals: loadMeals() || {}
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `fittrack-summary-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
  }

  const resetBtn = document.getElementById('reset-dashboard');
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      resetAll();
      setTimeout(()=> location.reload(), 200);
    });
  }
}

function init(){
  renderBars('weekly-activities', weeklyData.activityMinutes, weeklyData.days);
  renderBars('weekly-calories', weeklyData.calories, weeklyData.days);
  attachTooltip('weekly-activities');
  attachTooltip('weekly-calories');
  attachButtons();
}

// Re-render charts when storage changes (keeps charts responsive to new data)
window.addEventListener('activities:updated', ()=> renderBars('weekly-activities', weeklyData.activityMinutes, weeklyData.days));
window.addEventListener('meals:updated', ()=> renderBars('weekly-calories', weeklyData.calories, weeklyData.days));
window.addEventListener('storage:reset', ()=> setTimeout(()=> init(), 200));

document.addEventListener('DOMContentLoaded', init);
