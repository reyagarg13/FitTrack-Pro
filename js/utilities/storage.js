// storage.js - small wrapper around localStorage/sessionStorage
const ACTIVITY_KEY = 'fittrack.activities.v1';
const MEALS_KEY = 'fittrack.meals.v1';

// Helper to dispatch a global event when data changes
function dispatchUpdate(name, detail){
  try{ window.dispatchEvent(new CustomEvent(name, { detail })); }catch(e){ /* noop */ }
}

export function saveActivities(arr){
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(arr));
  // notify listeners
  dispatchUpdate('activities:updated', { activities: arr });
}

export function loadActivities(){
  const raw = localStorage.getItem(ACTIVITY_KEY);
  try{ return raw? JSON.parse(raw): null }catch(e){return null}
}

export function saveMeals(obj){
  localStorage.setItem(MEALS_KEY, JSON.stringify(obj));
  // notify listeners
  dispatchUpdate('meals:updated', { meals: obj });
}

export function loadMeals(){
  const raw = localStorage.getItem(MEALS_KEY);
  try{ return raw? JSON.parse(raw): null }catch(e){return null}
}

export function resetAll(){
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(MEALS_KEY);
  dispatchUpdate('storage:reset', {});
}
