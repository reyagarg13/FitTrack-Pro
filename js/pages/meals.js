// meals.js
import { mealsData } from '../../data/mealsData.js';
import { loadMeals, saveMeals } from '../utilities/storage.js';
import { uid } from '../utilities/helpers.js';

let meals = {};

function initMeals(){
  const stored = loadMeals();
  meals = stored || JSON.parse(JSON.stringify(mealsData));
  saveMeals(meals);
}

function renderMeals(){
  ['Breakfast','Lunch','Dinner'].forEach(mealType=>{
    const ul = document.querySelector(`[data-meal-list="${mealType}"]`);
    ul.innerHTML = '';
    
    if(!meals[mealType] || meals[mealType].length === 0){
      ul.innerHTML = '<li style="justify-content:center;color:#94a3b8;font-style:italic;border:none">No meals added</li>';
      return;
    }
    
    meals[mealType].forEach(m=>{
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${m.name}</span>
        <span>
          <strong>${m.calories}</strong> kcal 
          <button data-id="${m.id}" data-meal="${mealType}" class="ml-2" title="Remove meal">🗑️</button>
        </span>
      `;
      ul.appendChild(li);
    });
  });
  recalcTotal();
}

function recalcTotal(){
  let total = 0;
  Object.values(meals).forEach(arr=> arr.forEach(m=> total += Number(m.calories)));
  const el = document.getElementById('total-calories');
  // trigger animation
  el.style.animation = 'none';
  setTimeout(()=> el.style.animation = '', 10);
  el.textContent = `${total} kcal`;
}

function attachEvents(){
  document.querySelectorAll('.meal-form').forEach(form=>{
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const mealType = form.dataset.mealForm;
      const name = form.name.value.trim();
      const calories = Number(form.calories.value);
      
      // Validation
      if(!name || name.length < 2){
        alert('Please enter a valid meal name (at least 2 characters).');
        return;
      }
      if(!calories || calories<=0 || calories > 5000){
        alert('Calories must be between 1 and 5000.');
        return;
      }
      
      const item = { id: uid('m'), name, calories };
      meals[mealType].push(item);
      saveMeals(meals);
      renderMeals();
      form.reset();
      
      // Focus back to name input for quick entry
      form.name.focus();
    });
  });

  document.querySelectorAll('.meal-list').forEach(ul=>{
    ul.addEventListener('click',(e)=>{
      if(e.target.tagName === 'BUTTON'){
        const id = e.target.dataset.id;
        const mealType = e.target.dataset.meal;
        meals[mealType] = meals[mealType].filter(m=> m.id !== id);
        saveMeals(meals);
        renderMeals();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initMeals();
  renderMeals();
  attachEvents();
});
